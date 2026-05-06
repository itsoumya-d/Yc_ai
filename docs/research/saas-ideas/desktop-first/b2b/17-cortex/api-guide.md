# Cortex -- API & Integration Guide

## Overview

Cortex integrates with a focused set of external APIs and libraries. The guiding principle: **minimize external dependencies, maximize local processing**. Only the AI layer and metadata sync require cloud services. Data processing, visualization, and database connectivity are all handled locally within the Electron app.

---

## API 1: OpenAI API

### Purpose

Natural language to SQL translation, chart type recommendation, data insight generation, anomaly explanation.

### Pricing (as of 2025)

| Model | Input | Output | Context Window |
|-------|-------|--------|----------------|
| **GPT-4o** | $2.50 / 1M tokens | $10.00 / 1M tokens | 128K tokens |
| **GPT-4o-mini** | $0.15 / 1M tokens | $0.60 / 1M tokens | 128K tokens |

### Cost Projection for Cortex

| Scenario | Model | Avg Tokens/Query | Queries/Day | Monthly Cost |
|----------|-------|------------------|-------------|-------------|
| **Free user** | GPT-4o-mini | ~800 (in+out) | 2 | ~$0.02/user/mo |
| **Active analyst** | Mix (70% mini, 30% 4o) | ~1,200 | 15 | ~$1.80/user/mo |
| **Power user** | Mix (50% mini, 50% 4o) | ~1,500 | 30 | ~$6.00/user/mo |
| **1,000 paid users** | Mix | ~1,300 avg | 20 avg | ~$3,200/mo total |

### Setup

```bash
npm install openai
```

### Authentication

```typescript
// src/services/ai/openai-client.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // For Cortex: API key stored in user settings
  // Encrypted with electron-safeStorage
});
```

### Code Snippets

**NL-to-SQL Generation**:

```typescript
// src/services/ai/nl-to-sql.ts
import OpenAI from 'openai';

interface QueryGenerationResult {
  sql: string;
  explanation: string;
  chartRecommendation: ChartType;
  confidence: number;
}

async function generateSQL(
  naturalLanguage: string,
  schema: DatabaseSchema,
  dialect: 'postgresql' | 'mysql' | 'duckdb',
  conversationHistory: ConversationEntry[]
): Promise<QueryGenerationResult> {
  const systemPrompt = buildSystemPrompt(schema, dialect);
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...conversationHistory.map(entry => ({
      role: entry.role as 'user' | 'assistant',
      content: entry.content,
    })),
    { role: 'user' as const, content: naturalLanguage },
  ];

  const response = await openai.chat.completions.create({
    model: isComplexQuery(naturalLanguage) ? 'gpt-4o' : 'gpt-4o-mini',
    messages,
    temperature: 0.1,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content!);
}

function buildSystemPrompt(schema: DatabaseSchema, dialect: string): string {
  return `You are an expert SQL analyst. Generate a single ${dialect} SQL query
based on the user's natural language question.

DATABASE SCHEMA:
${formatSchema(schema)}

RULES:
- Only generate SELECT statements. Never generate INSERT, UPDATE, DELETE, DROP.
- Use the exact table and column names from the schema.
- Always add appropriate LIMIT clauses for potentially large result sets.
- For date-related questions, use ${dialect}-specific date functions.
- Return JSON with: sql, explanation, chartRecommendation (bar|line|pie|scatter|number|table), confidence (0-1).

EXAMPLES:
...`;
}
```

**Chart Recommendation**:

```typescript
// src/services/ai/chart-recommendation.ts
async function recommendChart(
  sql: string,
  resultSchema: ColumnInfo[],
  rowCount: number
): Promise<ChartRecommendation> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'system',
      content: `Given a SQL query and its result schema, recommend the best
visualization. Return JSON with: chartType, xAxis, yAxis, groupBy, colorMapping.`
    }, {
      role: 'user',
      content: `SQL: ${sql}\nColumns: ${JSON.stringify(resultSchema)}\nRows: ${rowCount}`
    }],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content!);
}
```

**Insight Generation**:

```typescript
// src/services/ai/insights.ts
async function generateInsights(
  question: string,
  sql: string,
  results: Record<string, unknown>[],
  maxRows: number = 20
): Promise<string[]> {
  const sampleResults = results.slice(0, maxRows);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'system',
      content: `You are a data analyst. Given a question, SQL query, and results,
provide 2-4 concise, actionable insights. Focus on trends, outliers, and comparisons.
Return JSON with: insights (string array).`
    }, {
      role: 'user',
      content: `Question: ${question}\nSQL: ${sql}\nResults: ${JSON.stringify(sampleResults)}`
    }],
    temperature: 0.5,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content!).insights;
}
```

### Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| **Anthropic Claude** | Strong reasoning, 200K context | Higher cost, less SQL-specific training |
| **Google Gemini** | Competitive pricing, good SQL | Less mature API ecosystem |
| **Self-hosted (Llama 3)** | No API cost, data privacy | Requires GPU, lower SQL accuracy, complex deployment |
| **Mistral** | Good price/performance | Smaller context window, less proven for SQL |

**Recommendation**: Start with OpenAI GPT-4o/mini. Abstract the AI layer so models can be swapped. Offer enterprise customers the option to use their own API key or self-hosted model.

---

## API 2: DuckDB (Embedded Analytical Database)

### Purpose

Local analytical database for fast queries on imported CSV/Excel data and cached query results. Runs entirely within the Electron app -- no server required.

### Pricing

**Free and open source.** MIT license. No usage fees, no data limits.

### Setup

```bash
npm install duckdb
# OR for WASM (if needed for web builds)
npm install @duckdb/duckdb-wasm
```

### Code Snippets

**Initialize DuckDB**:

```typescript
// src/services/data/duckdb-engine.ts
import duckdb from 'duckdb';
import path from 'path';
import { app } from 'electron';

class DuckDBEngine {
  private db: duckdb.Database;
  private connection: duckdb.Connection;

  constructor() {
    const dbPath = path.join(app.getPath('userData'), 'cortex-data.duckdb');
    this.db = new duckdb.Database(dbPath, {
      memory_limit: '4GB',
      threads: '4',
    });
    this.connection = this.db.connect();
  }

  async query(sql: string): Promise<Record<string, unknown>[]> {
    return new Promise((resolve, reject) => {
      this.connection.all(sql, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as Record<string, unknown>[]);
      });
    });
  }

  async importCSV(filePath: string, tableName: string): Promise<void> {
    const sql = `CREATE OR REPLACE TABLE "${tableName}" AS
      SELECT * FROM read_csv_auto('${filePath}',
        header=true,
        sample_size=10000
      )`;
    await this.query(sql);
  }

  async importExcel(filePath: string, tableName: string, sheet?: string): Promise<void> {
    // DuckDB supports Excel via spatial extension or use xlsx to convert first
    const sql = `INSTALL spatial; LOAD spatial;
      CREATE OR REPLACE TABLE "${tableName}" AS
      SELECT * FROM st_read('${filePath}')`;
    await this.query(sql);
  }

  async getTableSchema(tableName: string): Promise<ColumnInfo[]> {
    const result = await this.query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_name = '${tableName}'
       ORDER BY ordinal_position`
    );
    return result as ColumnInfo[];
  }

  close(): void {
    this.connection.close();
    this.db.close();
  }
}
```

### Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| **SQLite** | Ubiquitous, mature | Row-oriented (slow for analytics), no analytical functions |
| **Apache Arrow** | In-memory columnar | Not a database, no SQL interface |
| **Polars** | Fast DataFrame library | Rust/Python focused, no Node.js native SQL interface |

**Recommendation**: DuckDB is the clear winner for embedded analytics. No alternative matches its combination of SQL support, analytical performance, and Node.js bindings.

---

## API 3: PostgreSQL Connector (pg)

### Purpose

Connect to PostgreSQL databases for live querying. The most common database Cortex users will connect to.

### Pricing

**Free and open source.** MIT license. (The PostgreSQL database itself is also free.)

### Setup

```bash
npm install pg
npm install @types/pg  # TypeScript types
```

### Authentication

Supports connection string, individual parameters, and SSL certificates.

### Code Snippet

```typescript
// src/services/connectors/postgresql.ts
import { Pool, PoolConfig, QueryResult } from 'pg';

class PostgreSQLConnector {
  private pool: Pool;

  constructor(config: PoolConfig) {
    this.pool = new Pool({
      ...config,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: config.ssl || false,
    });
  }

  async testConnection(): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    } finally {
      client.release();
    }
  }

  async executeQuery(sql: string): Promise<QueryResult> {
    const client = await this.pool.connect();
    try {
      // Set statement timeout to prevent runaway queries
      await client.query('SET statement_timeout = 120000'); // 2 minutes
      return await client.query(sql);
    } finally {
      client.release();
    }
  }

  async getSchema(): Promise<TableSchema[]> {
    const result = await this.executeQuery(`
      SELECT
        t.table_schema,
        t.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        tc.constraint_type,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.tables t
      JOIN information_schema.columns c
        ON t.table_name = c.table_name AND t.table_schema = c.table_schema
      LEFT JOIN information_schema.key_column_usage kcu
        ON c.column_name = kcu.column_name AND c.table_name = kcu.table_name
      LEFT JOIN information_schema.table_constraints tc
        ON kcu.constraint_name = tc.constraint_name
      LEFT JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name AND tc.constraint_type = 'FOREIGN KEY'
      WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema')
        AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_schema, t.table_name, c.ordinal_position
    `);
    return parseSchemaResult(result.rows);
  }

  async getRowCount(tableName: string): Promise<number> {
    const result = await this.executeQuery(
      `SELECT reltuples::bigint AS estimate
       FROM pg_class
       WHERE relname = '${tableName}'`
    );
    return result.rows[0]?.estimate || 0;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
```

### Alternatives

| Alternative | Notes |
|-------------|-------|
| **postgres.js** | Faster, modern API. Lacks some enterprise features (LISTEN/NOTIFY). Good alternative. |
| **Prisma** | ORM, too heavy for raw query execution. Not suitable for dynamic SQL. |
| **Knex** | Query builder. Cortex generates raw SQL, so a query builder adds unnecessary abstraction. |

---

## API 4: MySQL Connector (mysql2)

### Purpose

Connect to MySQL and MariaDB databases for live querying.

### Pricing

**Free and open source.** MIT license.

### Setup

```bash
npm install mysql2
```

### Code Snippet

```typescript
// src/services/connectors/mysql.ts
import mysql from 'mysql2/promise';

class MySQLConnector {
  private pool: mysql.Pool;

  constructor(config: mysql.PoolOptions) {
    this.pool = mysql.createPool({
      ...config,
      connectionLimit: 5,
      connectTimeout: 10000,
      waitForConnections: true,
    });
  }

  async testConnection(): Promise<boolean> {
    const connection = await this.pool.getConnection();
    try {
      await connection.query('SELECT 1');
      return true;
    } catch {
      return false;
    } finally {
      connection.release();
    }
  }

  async executeQuery(sql: string): Promise<mysql.RowDataPacket[]> {
    // Set query timeout
    const [rows] = await this.pool.query<mysql.RowDataPacket[]>({
      sql,
      timeout: 120000,
    });
    return rows;
  }

  async getSchema(): Promise<TableSchema[]> {
    const [tables] = await this.pool.query<mysql.RowDataPacket[]>(`
      SELECT
        TABLE_NAME as table_name,
        COLUMN_NAME as column_name,
        DATA_TYPE as data_type,
        IS_NULLABLE as is_nullable,
        COLUMN_KEY as column_key,
        COLUMN_DEFAULT as column_default
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `);
    return parseSchemaResult(tables);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
```

### Alternatives

| Alternative | Notes |
|-------------|-------|
| **mysql** (original) | Older, callback-based. mysql2 is the recommended successor. |
| **mariadb** | MariaDB-specific driver. mysql2 supports MariaDB. |

---

## API 5: Google BigQuery Client Library

### Purpose

Connect to Google BigQuery data warehouse for querying large-scale analytical datasets.

### Pricing

| Component | Cost |
|-----------|------|
| **Queries (on-demand)** | $6.25 per TB scanned |
| **Queries (flat-rate)** | Starting at $2,000/mo for 100 slots |
| **Storage** | $0.02/GB/month (active), $0.01/GB/month (long-term) |
| **Free tier** | 1 TB queries/month, 10 GB storage/month |

**Cost Note for Cortex**: BigQuery charges by data scanned. Cortex should show estimated bytes before query execution so users can avoid surprise bills.

### Setup

```bash
npm install @google-cloud/bigquery
```

### Authentication

Service account JSON key file. User uploads the key file through the Cortex connection wizard. Key file stored locally, encrypted with `electron-safeStorage`.

### Code Snippet

```typescript
// src/services/connectors/bigquery.ts
import { BigQuery, BigQueryOptions } from '@google-cloud/bigquery';

class BigQueryConnector {
  private client: BigQuery;
  private projectId: string;

  constructor(keyFilePath: string, projectId: string) {
    this.projectId = projectId;
    this.client = new BigQuery({
      keyFilename: keyFilePath,
      projectId,
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async executeQuery(sql: string): Promise<Record<string, unknown>[]> {
    const [rows] = await this.client.query({
      query: sql,
      location: 'US',
      maximumBytesBilled: String(10 * 1024 * 1024 * 1024), // 10 GB limit
    });
    return rows;
  }

  async estimateQueryCost(sql: string): Promise<{ bytesProcessed: string }> {
    const [job] = await this.client.createQueryJob({
      query: sql,
      dryRun: true,
    });
    return {
      bytesProcessed: job.metadata.statistics.totalBytesProcessed,
    };
  }

  async getDatasets(): Promise<string[]> {
    const [datasets] = await this.client.getDatasets();
    return datasets.map(ds => ds.id!);
  }

  async getSchema(datasetId: string): Promise<TableSchema[]> {
    const [tables] = await this.client.dataset(datasetId).getTables();
    const schemas: TableSchema[] = [];
    for (const table of tables) {
      const [metadata] = await table.getMetadata();
      schemas.push({
        tableName: table.id!,
        columns: metadata.schema.fields.map((f: any) => ({
          name: f.name,
          type: f.type,
          nullable: f.mode !== 'REQUIRED',
        })),
      });
    }
    return schemas;
  }

  async close(): Promise<void> {
    // BigQuery client doesn't maintain persistent connections
  }
}
```

### Alternatives

| Alternative | Notes |
|-------------|-------|
| **BigQuery REST API** | Direct HTTP calls. More control but more boilerplate. Client library is preferred. |
| **BigQuery SQL via JDBC** | Possible but adds Java dependency. Not suitable for Electron. |

---

## API 6: Snowflake SDK

### Purpose

Connect to Snowflake data warehouse for querying analytical datasets.

### Pricing

| Component | Cost |
|-----------|------|
| **Compute** | $2-4/credit (varies by cloud provider and region). 1 credit = 1 XS warehouse for 1 hour. |
| **Storage** | $23-40/TB/month (varies by region) |
| **Free trial** | $400 in credits, 30 days |

**Cost Note for Cortex**: Snowflake charges by compute time. Cortex should auto-suspend virtual warehouses after query completion to minimize costs.

### Setup

```bash
npm install snowflake-sdk
```

### Authentication

Key-pair authentication (RSA). User generates a key pair, uploads the private key through the Cortex connection wizard. Private key stored locally, encrypted.

### Code Snippet

```typescript
// src/services/connectors/snowflake.ts
import snowflake from 'snowflake-sdk';

class SnowflakeConnector {
  private connection: snowflake.Connection;

  constructor(config: {
    account: string;
    username: string;
    privateKeyPath: string;
    warehouse: string;
    database: string;
    schema: string;
  }) {
    this.connection = snowflake.createConnection({
      account: config.account,
      username: config.username,
      authenticator: 'SNOWFLAKE_JWT',
      privateKeyPath: config.privateKeyPath,
      warehouse: config.warehouse,
      database: config.database,
      schema: config.schema,
    });
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.connect();
      await this.executeQuery('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async executeQuery(sql: string): Promise<Record<string, unknown>[]> {
    return new Promise((resolve, reject) => {
      this.connection.execute({
        sqlText: sql,
        complete: (err, stmt, rows) => {
          if (err) reject(err);
          else resolve(rows as Record<string, unknown>[]);
        },
      });
    });
  }

  async getSchema(): Promise<TableSchema[]> {
    const tables = await this.executeQuery(`
      SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = CURRENT_SCHEMA()
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `);
    return parseSchemaResult(tables);
  }

  async close(): Promise<void> {
    return new Promise((resolve) => {
      this.connection.destroy((err) => {
        resolve();
      });
    });
  }
}
```

### Alternatives

| Alternative | Notes |
|-------------|-------|
| **Snowflake REST API** | HTTP-based. More portable but more complex. SDK is preferred for Node.js. |
| **Snowflake ODBC** | Requires ODBC driver installation. Not ideal for Electron distribution. |

---

## API 7: D3.js / Recharts (Visualization)

### Purpose

Data visualization. Recharts for standard charts (bar, line, pie, area). D3.js for custom, complex visualizations (scatter with regression, geographic maps, Sankey diagrams).

### Pricing

**Free and open source.** D3.js: ISC license. Recharts: MIT license.

### Setup

```bash
npm install d3 recharts
npm install @types/d3  # TypeScript types for D3
```

### Code Snippets

**Recharts Bar Chart**:

```typescript
// src/components/charts/BarChartView.tsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface BarChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKeys: string[];
  colors?: string[];
}

const CHART_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
  '#06B6D4', '#EC4899', '#EF4444', '#F97316',
];

export function BarChartView({ data, xKey, yKeys, colors }: BarChartProps) {
  const chartColors = colors || CHART_COLORS;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey={xKey}
          tick={{ fill: '#94A3B8', fontSize: 12 }}
          axisLine={{ stroke: '#334155' }}
        />
        <YAxis
          tick={{ fill: '#94A3B8', fontSize: 12 }}
          axisLine={{ stroke: '#334155' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0F172A',
            border: '1px solid #334155',
            borderRadius: 6,
            color: '#F8FAFC',
          }}
        />
        <Legend wrapperStyle={{ color: '#94A3B8' }} />
        {yKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={chartColors[index % chartColors.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
```

**D3.js Scatter Plot with Trend Line**:

```typescript
// src/components/charts/ScatterPlotView.tsx
import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface ScatterPlotProps {
  data: { x: number; y: number; label?: string }[];
  xLabel: string;
  yLabel: string;
  showTrendLine?: boolean;
}

export function ScatterPlotView({ data, xLabel, yLabel, showTrendLine }: ScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x) as [number, number])
      .range([0, width])
      .nice();

    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => d.y) as [number, number])
      .range([height, 0])
      .nice();

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(-height).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#334155').attr('stroke-dasharray', '3,3');

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text').attr('fill', '#94A3B8');

    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text').attr('fill', '#94A3B8');

    // Data points
    g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))
      .attr('r', 5)
      .attr('fill', '#3B82F6')
      .attr('opacity', 0.7);

    // Trend line (linear regression)
    if (showTrendLine) {
      const regression = linearRegression(data);
      const lineData = [
        { x: d3.min(data, d => d.x)!, y: regression.predict(d3.min(data, d => d.x)!) },
        { x: d3.max(data, d => d.x)!, y: regression.predict(d3.max(data, d => d.x)!) },
      ];
      g.append('line')
        .attr('x1', x(lineData[0].x))
        .attr('y1', y(lineData[0].y))
        .attr('x2', x(lineData[1].x))
        .attr('y2', y(lineData[1].y))
        .attr('stroke', '#EF4444')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '6,3');
    }
  }, [data, showTrendLine]);

  return <svg ref={svgRef} width="100%" height={400} />;
}
```

### Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| **Plotly.js** | Rich charts, 3D support | Heavy bundle size (~3MB), opinionated styling |
| **Chart.js** | Canvas-based (good for many data points) | Less customizable than D3, limited chart types |
| **Nivo** | Beautiful defaults, React-native | Less flexibility for custom charts |
| **Observable Plot** | Modern D3 successor | Newer, smaller community |
| **Apache ECharts** | Massive chart library | Very large bundle, complex API |

**Recommendation**: Recharts for 80% of charts (bar, line, pie, area). D3.js for the 20% that need custom rendering (scatter with annotations, geographic, Sankey).

---

## API 8: SendGrid (Email Delivery)

### Purpose

Delivering scheduled reports and alert notifications via email.

### Pricing

| Plan | Emails/Month | Cost |
|------|-------------|------|
| **Free** | 100/day (3,000/mo) | $0 |
| **Essentials** | 100K/mo | $19.95/mo |
| **Pro** | 100K/mo | $89.95/mo (+ dedicated IP, analytics) |

**Cost Projection**: With 1,000 paid users sending 1 scheduled report/week each = ~4,000 emails/month. Free tier sufficient for MVP. Essentials tier for growth.

### Setup

```bash
npm install @sendgrid/mail
```

### Authentication

API key stored in Supabase Edge Function environment variables (not on the desktop app -- emails sent server-side).

### Code Snippet

```typescript
// supabase/functions/send-report/index.ts
// This runs as a Supabase Edge Function, NOT in the Electron app
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(Deno.env.get('SENDGRID_API_KEY')!);

interface ReportEmailParams {
  recipients: string[];
  reportName: string;
  pdfBuffer: Buffer;
  orgName: string;
}

async function sendScheduledReport(params: ReportEmailParams): Promise<void> {
  const { recipients, reportName, pdfBuffer, orgName } = params;

  const msg = {
    to: recipients,
    from: {
      email: 'reports@cortexdata.com',
      name: `${orgName} via Cortex`,
    },
    subject: `${reportName} - ${new Date().toLocaleDateString()}`,
    html: buildReportEmailHTML(reportName, orgName),
    attachments: [{
      content: pdfBuffer.toString('base64'),
      filename: `${reportName}-${new Date().toISOString().split('T')[0]}.pdf`,
      type: 'application/pdf',
      disposition: 'attachment',
    }],
  };

  await sgMail.send(msg);
}

function buildReportEmailHTML(reportName: string, orgName: string): string {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0F172A;">${reportName}</h2>
      <p style="color: #475569;">Your scheduled report from ${orgName} is attached.</p>
      <p style="color: #475569;">Open the PDF attachment to view your latest data.</p>
      <hr style="border: 1px solid #E2E8F0;" />
      <p style="color: #94A3B8; font-size: 12px;">
        Sent by Cortex. <a href="https://cortexdata.com">Manage your reports</a>.
      </p>
    </div>
  `;
}
```

### Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| **Resend** | Modern API, React email templates | Newer, smaller team |
| **Postmark** | Excellent deliverability | More expensive for transactional volume |
| **AWS SES** | Cheapest at scale ($0.10/1K emails) | More setup, no built-in templates |
| **Mailgun** | Good deliverability, flexible | Pricing less transparent |

**Recommendation**: SendGrid for MVP (generous free tier, reliable, good documentation). Consider switching to Resend for better developer experience or AWS SES for cost at scale.

---

## Supabase (Auth, Metadata, Real-time)

### Purpose

User authentication, metadata storage (saved queries, dashboard configs, team management), real-time collaboration, and serverless functions.

### Pricing

| Plan | Cost | Includes |
|------|------|----------|
| **Free** | $0 | 50K MAU, 500MB DB, 1GB storage, 500K edge function invocations |
| **Pro** | $25/mo | 100K MAU, 8GB DB, 100GB storage, 2M edge function invocations |
| **Team** | $599/mo | SOC 2, priority support, 28-day log retention |

**Cost Projection**: Pro plan ($25/mo) sufficient through 10,000 users. Team plan when enterprise customers require SOC 2 compliance.

### Setup

```bash
npm install @supabase/supabase-js
```

### Code Snippet

```typescript
// src/services/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Auth
async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

// Save query metadata
async function saveQuery(query: {
  nlInput: string;
  generatedSql: string;
  chartType: string;
  chartConfig: object;
  connectionId: string;
}) {
  return supabase.from('queries').insert({
    ...query,
    user_id: (await supabase.auth.getUser()).data.user?.id,
    org_id: getCurrentOrgId(),
  });
}

// Real-time dashboard updates
function subscribeToDashboard(dashboardId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`dashboard:${dashboardId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'dashboard_tiles',
      filter: `dashboard_id=eq.${dashboardId}`,
    }, callback)
    .subscribe();
}
```

---

## Cost Summary

### Monthly Cost at Scale Milestones

| Milestone | Users | OpenAI | Supabase | SendGrid | Total API Cost | Revenue |
|-----------|-------|--------|----------|----------|----------------|---------|
| **MVP Launch** | 100 | $50 | $0 (free) | $0 (free) | ~$50 | $2,000 |
| **Early Growth** | 1,000 | $500 | $25 (pro) | $0 (free) | ~$525 | $25,000 |
| **Product-Market Fit** | 5,000 | $2,500 | $25 (pro) | $20 | ~$2,545 | $125,000 |
| **Scale** | 20,000 | $10,000 | $599 (team) | $90 | ~$10,689 | $500,000 |
| **$1M MRR** | 50,000 | $25,000 | $599 (team) | $90 | ~$25,689 | $1,000,000 |

**API Cost as % of Revenue**: ~2.5% at scale. This is excellent for a SaaS product. The desktop-first architecture means no compute/hosting costs for data processing -- that runs on the user's machine.

---

## Integration Architecture Summary

```
+-------------------------------------------------------------------+
|                    CORTEX INTEGRATION MAP                          |
|                                                                    |
|  PAID APIs (variable cost)         FREE / OSS (no cost)           |
|  +---------------------------+     +---------------------------+  |
|  | OpenAI ($2.5K-$25K/mo)    |     | DuckDB (embedded)         |  |
|  |   - NL to SQL             |     | D3.js / Recharts          |  |
|  |   - Chart recommendation  |     | pg (PostgreSQL driver)    |  |
|  |   - Insight generation    |     | mysql2 (MySQL driver)     |  |
|  +---------------------------+     | node-sql-parser           |  |
|  | Supabase ($0-$599/mo)     |     | xlsx (Excel parser)       |  |
|  |   - Auth                  |     | csv-parse (CSV parser)    |  |
|  |   - Metadata storage      |     +---------------------------+  |
|  |   - Real-time sync        |                                    |
|  +---------------------------+     PAID APIs (fixed cost)         |
|  | SendGrid ($0-$90/mo)      |     +---------------------------+  |
|  |   - Scheduled reports     |     | BigQuery (user pays)      |  |
|  |   - Alert notifications   |     | Snowflake (user pays)     |  |
|  +---------------------------+     +---------------------------+  |
+-------------------------------------------------------------------+
```

**Key Insight**: BigQuery and Snowflake costs are paid by the customer, not Cortex. Cortex only pays for OpenAI, Supabase, and SendGrid -- all of which scale linearly and remain a small percentage of revenue.

---

*Every API choice serves the principle: keep data local, keep costs low, keep the analyst fast.*
