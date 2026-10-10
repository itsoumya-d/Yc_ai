const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');

// Exercise the emitted artifact, not a recompiled source handler. Electron's
// window/lifecycle API is stubbed; SQLite uses the installed host-Node binding.
test('built main process loads native SQLite and preserves CSV replacement semantics', async (t) => {
  const filename = path.resolve(__dirname, '../dist-electron/main.js');
  const nativeRequire = createRequire(filename);
  const requestedModules = [];
  const handlers = new Map();
  const electron = {
    app: { whenReady: () => ({ then: () => {} }), on: () => {} },
    ipcMain: { handle: (name, handler) => handlers.set(name, handler) },
    BrowserWindow: class {}, dialog: {},
  };
  const context = {
    require: (name) => {
      requestedModules.push(name);
      return name === 'electron' ? electron : nativeRequire(name);
    },
    module: { exports: {} }, exports: {}, __dirname: path.dirname(filename), __filename: filename,
    process, performance, Buffer, console: { error: () => {} },
  };
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), context, { filename });
  const call = (name, ...args) => handlers.get(name)(undefined, ...args);
  const queried = await call('execute-sql', 'SELECT 42 AS answer');
  assert.equal(queried.rows[0].answer, 42);
  assert.ok(requestedModules.includes('better-sqlite3'), 'native dependency must resolve outside the bundle');

  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'cortex-bundle-test-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const csv = path.join(directory, 'bundle.csv');
  fs.writeFileSync(csv, '"quoted""header"\nPreserve me\n');
  assert.equal((await call('load-csv', csv)).rowCount, 1);
  fs.writeFileSync(csv, 'Amount,amount\n1,2\n');
  assert.equal(await call('load-csv', csv), null);
  const preserved = await call('execute-sql', 'SELECT "quoted""header" AS value FROM bundle');
  assert.equal(preserved.rows[0].value, 'Preserve me');
  const schema = await call('get-schema');
  assert.equal(schema[0].columns[0].name, 'quoted"header');
  assert.equal(await call('drop-table', 'bundle'), true);
});
