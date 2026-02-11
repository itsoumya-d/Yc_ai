import OpenAI from 'openai';
import type { SchemaTable, ChartType } from '@/types/database';

interface NLToSQLResult {
  sql: string;
  chartType: ChartType;
  insight: string;
}

/**
 * Convert natural language query to SQL using OpenAI with schema context.
 * Also returns a recommended chart type and an AI insight about the query results.
 */
export async function naturalLanguageToSQL(
  question: string,
  schema: SchemaTable[],
  apiKey: string,
): Promise<NLToSQLResult> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required. Please add it in Settings → API Keys.');
  }

  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  // Build schema description
  const schemaDesc = schema.map((t) => {
    const cols = t.columns.map((c) => {
      let desc = `  ${c.name} ${c.type}`;
      if (c.primary_key) desc += ' PRIMARY KEY';
      if (!c.nullable) desc += ' NOT NULL';
      if (c.foreign_key) desc += ` REFERENCES ${c.foreign_key.table}(${c.foreign_key.column})`;
      return desc;
    }).join('\n');
    return `TABLE "${t.name}" (${t.row_count} rows):\n${cols}`;
  }).join('\n\n');

  const systemPrompt = `You are a SQL expert. Convert natural language questions into SQLite-compatible SQL queries.

DATABASE SCHEMA:
${schemaDesc}

RULES:
1. Return ONLY valid SQLite SQL. No PostgreSQL-specific syntax (no INTERVAL, use date functions instead).
2. Use double quotes for table/column names if they contain special characters.
3. Limit results to 1000 rows max unless the user asks for all.
4. For aggregations, always include meaningful aliases.
5. For time-based queries, use SQLite date functions (date(), strftime(), etc.).

Respond in JSON format with exactly these fields:
{
  "sql": "THE SQL QUERY",
  "chartType": "bar|line|pie|area|scatter|table|kpi",
  "insight": "A brief 1-2 sentence insight about what this query will reveal"
}

Choose chartType based on the query:
- "bar" for comparisons across categories
- "line" for trends over time
- "pie" for proportion/percentage breakdowns
- "area" for cumulative trends
- "scatter" for correlation analysis
- "table" for detailed listings or joins
- "kpi" for single-value metrics`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question },
    ],
    temperature: 0,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenAI');

  const parsed = JSON.parse(content) as NLToSQLResult;

  if (!parsed.sql) throw new Error('No SQL generated');

  return {
    sql: parsed.sql,
    chartType: parsed.chartType || 'table',
    insight: parsed.insight || '',
  };
}

/**
 * Generate an AI insight from query results.
 */
export async function generateInsight(
  question: string,
  sql: string,
  results: Record<string, unknown>[],
  apiKey: string,
): Promise<string> {
  if (!apiKey || results.length === 0) return '';

  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  // Send first 20 rows as context
  const sampleData = JSON.stringify(results.slice(0, 20), null, 2);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a data analyst. Provide a brief, actionable insight (2-3 sentences max) about the query results. Focus on trends, anomalies, or business implications. Be concise and specific with numbers.',
      },
      {
        role: 'user',
        content: `Question: ${question}\nSQL: ${sql}\nResults (sample):\n${sampleData}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 200,
  });

  return response.choices[0]?.message?.content || '';
}
