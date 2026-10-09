const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const Database = require('better-sqlite3');

// Execute the actual IPC handler source with real CSV parsing and native SQLite.
// Only Electron's lifecycle/window surface is stubbed: these are not UI tests.
function application(t, { failInsert } = {}) {
  const handlers = new Map();
  const databases = [];
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'cortex-csv-test-'));
  let insertCount = 0;
  function RecordingDatabase(...args) {
    const database = new Database(...args);
    databases.push(database);
    const prepare = database.prepare.bind(database);
    database.prepare = (sql) => {
      const statement = prepare(sql);
      if (sql.startsWith('INSERT INTO') && failInsert) {
        const run = statement.run.bind(statement);
        statement.run = (...values) => {
          insertCount += 1;
          if (failInsert(insertCount)) throw new Error('Synthetic insert failure');
          return run(...values);
        };
      }
      return statement;
    };
    return database;
  }
  const source = fs.readFileSync(path.join(__dirname, '../electron/main.ts'), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  const electron = {
    app: { whenReady: () => ({ then: () => {} }), on: () => {} },
    ipcMain: { handle: (name, handler) => handlers.set(name, handler) },
    BrowserWindow: class {}, dialog: {},
  };
  vm.runInNewContext(compiled.outputText, {
    require: (name) => name === 'electron' ? electron : name === 'better-sqlite3' ? RecordingDatabase : require(name),
    exports: {}, __dirname: path.join(__dirname, '../electron'), process, performance,
    console: { error: () => {} },
  });
  t.after(() => {
    for (const database of databases) if (database.open) database.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });
  return {
    call: (name, ...args) => handlers.get(name)(undefined, ...args),
    csv: (contents, filename = 'records.csv') => {
      const file = path.join(directory, filename);
      fs.writeFileSync(file, contents);
      return file;
    },
  };
}

test('quoted CSV headers import with real parsing and preserve values in schema/query', async (t) => {
  const app = application(t);
  const result = await app.call('load-csv', app.csv('"gross""revenue","customer name"\n12,Synthetic\n'));
  assert.equal(result.rowCount, 1);
  assert.deepEqual(Array.from(result.columns), ['gross"revenue', 'customer name']);
  const schema = await app.call('get-schema');
  assert.equal(schema[0].columns[0].name, 'gross"revenue');
  const query = await app.call('execute-sql', 'SELECT "gross""revenue" AS amount FROM records');
  assert.equal(query.rows[0].amount, 12);
});

test('invalid replacement schema preserves the previous table and supports retry', async (t) => {
  const app = application(t);
  const file = app.csv('original\nPreserve me\n');
  assert.equal((await app.call('load-csv', file)).rowCount, 1);
  fs.writeFileSync(file, 'Amount,amount\n1,2\n');
  assert.equal(await app.call('load-csv', file), null);
  const original = await app.call('execute-sql', 'SELECT original FROM records');
  assert.equal(original.rows[0].original, 'Preserve me');
  fs.writeFileSync(file, 'replacement\nRecovered\nSecond row\n');
  assert.equal((await app.call('load-csv', file)).rowCount, 2);
  const schema = await app.call('get-schema');
  assert.equal(schema[0].columns[0].name, 'replacement');
  assert.equal(schema[0].rowCount, 2);
});

test('failure after an inserted replacement row rolls back schema and every new row', async (t) => {
  // First insert seeds the old table; fail on the second replacement insert.
  let enabled = true;
  const app = application(t, { failInsert: (count) => enabled && count === 3 });
  const file = app.csv('original\nPreserve me\n');
  await app.call('load-csv', file);
  fs.writeFileSync(file, 'replacement\nFirst replacement\nSecond replacement\n');
  assert.equal(await app.call('load-csv', file), null);
  const original = await app.call('execute-sql', 'SELECT original FROM records');
  assert.equal(original.rowCount, 1);
  assert.equal(original.rows[0].original, 'Preserve me');
  enabled = false;
  assert.equal((await app.call('load-csv', file)).rowCount, 2);
});

test('failed first import leaves no partial table or rows', async (t) => {
  const app = application(t, { failInsert: (count) => count === 2 });
  assert.equal(await app.call('load-csv', app.csv('value\nFirst\nSecond\n')), null);
  assert.equal((await app.call('get-schema')).length, 0);
});

test('empty or malformed CSV preserves an existing table', async (t) => {
  const app = application(t);
  const file = app.csv('original\nPreserve me\n');
  await app.call('load-csv', file);
  for (const invalid of ['', '"unterminated\n']) {
    fs.writeFileSync(file, invalid);
    assert.equal(await app.call('load-csv', file), null);
    assert.equal((await app.call('execute-sql', 'SELECT original FROM records')).rows[0].original, 'Preserve me');
  }
});

test('quoted table names remain supported by schema inspection and drop', async (t) => {
  const app = application(t);
  await app.call('execute-sql', 'CREATE TABLE "customer""records" ("quoted""column" TEXT); INSERT INTO "customer""records" VALUES (\'fixture\')');
  const schema = await app.call('get-schema');
  assert.equal(schema[0].name, 'customer"records');
  assert.equal(schema[0].rowCount, 1);
  assert.equal(await app.call('drop-table', 'customer"records'), true);
  assert.equal((await app.call('get-schema')).length, 0);
});
