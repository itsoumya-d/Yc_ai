import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import { parse } from 'csv-parse/sync';

let mainWindow: BrowserWindow | null = null;
let db: InstanceType<typeof Database> | null = null;

function getDb(): InstanceType<typeof Database> {
  if (!db) {
    // In-memory SQLite database for loaded data
    db = new Database(':memory:');
    db.pragma('journal_mode = WAL');
  }
  return db;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0F0D1A',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env['VITE_DEV_SERVER_URL']) {
    mainWindow.loadURL(process.env['VITE_DEV_SERVER_URL']);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (mainWindow === null) createWindow(); });

// ---- Existing IPC handlers ----

ipcMain.handle('open-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Data Files', extensions: ['csv', 'xlsx', 'xls', 'json', 'parquet'] },
      { name: 'SQLite Databases', extensions: ['db', 'sqlite', 'sqlite3'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('get-version', () => app.getVersion());
ipcMain.handle('get-platform', () => process.platform);

// ---- CSV Loading ----

ipcMain.handle('load-csv', async (_event, filePath: string) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      cast: true,
      trim: true,
    }) as Record<string, unknown>[];

    if (records.length === 0) return null;

    // Derive table name from file name
    const baseName = path.basename(filePath, path.extname(filePath));
    const tableName = baseName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();

    const firstRecord = records[0]!;
    const columns = Object.keys(firstRecord);
    const database = getDb();

    // Drop table if exists, then create
    database.exec(`DROP TABLE IF EXISTS "${tableName}"`);

    // Infer column types from first 100 rows
    const typeMap: Record<string, string> = {};
    for (const col of columns) {
      const sampleValues = records.slice(0, 100).map((r) => r[col]);
      const isNumeric = sampleValues.every((v) => v === null || v === '' || typeof v === 'number' || !isNaN(Number(v)));
      typeMap[col] = isNumeric ? 'REAL' : 'TEXT';
    }

    const colDefs = columns.map((c) => `"${c}" ${typeMap[c]}`).join(', ');
    database.exec(`CREATE TABLE "${tableName}" (${colDefs})`);

    // Insert in batches
    const placeholders = columns.map(() => '?').join(', ');
    const insertStmt = database.prepare(`INSERT INTO "${tableName}" VALUES (${placeholders})`);

    const insertMany = database.transaction((rows: Record<string, unknown>[]) => {
      for (const row of rows) {
        const values = columns.map((c) => {
          const v = row[c];
          if (v === null || v === undefined || v === '') return null;
          if (typeMap[c] === 'REAL') return Number(v);
          return String(v);
        });
        insertStmt.run(...values);
      }
    });

    insertMany(records);

    return { tableName, columns, rowCount: records.length };
  } catch (err) {
    console.error('CSV load error:', err);
    return null;
  }
});

// ---- SQLite File Loading ----

ipcMain.handle('load-sqlite', async (_event, filePath: string) => {
  try {
    // Read external SQLite file and copy tables into our in-memory DB
    const externalDb = new Database(filePath, { readonly: true });
    const database = getDb();

    const tables = externalDb.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    ).all() as { name: string }[];

    for (const { name } of tables) {
      // Get table DDL
      const ddlRow = externalDb.prepare(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name=?"
      ).get(name) as { sql: string } | undefined;

      if (!ddlRow) continue;

      // Drop and recreate
      database.exec(`DROP TABLE IF EXISTS "${name}"`);
      database.exec(ddlRow.sql);

      // Copy all rows
      const rows = externalDb.prepare(`SELECT * FROM "${name}"`).all();
      if (rows.length === 0) continue;

      const cols = Object.keys(rows[0] as Record<string, unknown>);
      const placeholders = cols.map(() => '?').join(', ');
      const colNames = cols.map((c) => `"${c}"`).join(', ');
      const insertStmt = database.prepare(`INSERT INTO "${name}" (${colNames}) VALUES (${placeholders})`);

      const insertMany = database.transaction((data: Record<string, unknown>[]) => {
        for (const row of data) {
          insertStmt.run(...cols.map((c) => (row as Record<string, unknown>)[c] ?? null));
        }
      });

      insertMany(rows as Record<string, unknown>[]);
    }

    externalDb.close();
    return { tables: tables.map((t) => t.name) };
  } catch (err) {
    console.error('SQLite load error:', err);
    return null;
  }
});

// ---- Execute SQL ----

ipcMain.handle('execute-sql', async (_event, sql: string) => {
  try {
    const database = getDb();
    const start = performance.now();

    // Determine if it's a SELECT-like query or a statement
    const trimmed = sql.trim().toUpperCase();
    const isSelect = trimmed.startsWith('SELECT') || trimmed.startsWith('WITH') || trimmed.startsWith('EXPLAIN');

    if (isSelect) {
      const stmt = database.prepare(sql);
      const rows = stmt.all() as Record<string, unknown>[];
      const end = performance.now();

      const columns = rows.length > 0 && rows[0] ? Object.keys(rows[0]) : [];

      return {
        columns,
        rows: rows.slice(0, 5000), // Limit to 5000 rows for display
        rowCount: rows.length,
        executionTimeMs: Math.round(end - start),
      };
    } else {
      const result = database.exec(sql);
      const end = performance.now();
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: Math.round(end - start),
      };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(message);
  }
});

// ---- Get Schema ----

ipcMain.handle('get-schema', async () => {
  try {
    const database = getDb();
    const tables = database.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).all() as { name: string }[];

    return tables.map(({ name }) => {
      const columnsRaw = database.prepare(`PRAGMA table_info("${name}")`).all() as {
        name: string;
        type: string;
        notnull: number;
        pk: number;
      }[];

      const countRow = database.prepare(`SELECT COUNT(*) as cnt FROM "${name}"`).get() as { cnt: number };

      return {
        name,
        columns: columnsRaw.map((c) => ({
          name: c.name,
          type: c.type || 'TEXT',
          nullable: !c.notnull,
          pk: c.pk > 0,
        })),
        rowCount: countRow.cnt,
      };
    });
  } catch (err) {
    console.error('Schema error:', err);
    return [];
  }
});

// ---- Drop Table ----

ipcMain.handle('drop-table', async (_event, tableName: string) => {
  try {
    const database = getDb();
    database.exec(`DROP TABLE IF EXISTS "${tableName}"`);
    return true;
  } catch {
    return false;
  }
});
