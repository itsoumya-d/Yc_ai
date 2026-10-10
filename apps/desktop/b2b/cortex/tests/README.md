# Cortex regression checks

From `apps/desktop/b2b/cortex`, after installing its locked dependencies:

```sh
npm run build
npm test
npm run typecheck
```

Build first so the artifact test exercises the current emitted output rather
than a stale tracked bundle. The build regenerates `dist-electron`.

## Source handlers

`csv-import.test.cjs` executes the real TypeScript IPC handlers with `csv-parse`
and native `better-sqlite3`. It covers quoted identifiers, failed schema
replacement, rollback after a partial insert, retry, and malformed/empty CSV.
Fixtures use temporary CSV files and an in-memory database; no provider
credentials are needed.

## Emitted main-process bundle

`bundle-smoke.test.cjs` loads `dist-electron/main.js` in a Node VM, stubs
Electron's lifecycle/window APIs, and exercises SQL, CSV import, failed
replacement, schema inspection and table deletion using the installed native
SQLite binding. It also checks that `better-sqlite3` is resolved as an external
runtime dependency. Previously Rollup bundled its loader and database
initialization failed through the generated dynamic-require helper.

The main-process Vite configuration externalizes `better-sqlite3`, following
[the plugin's native-addon guidance](https://electron-vite.github.io/guide/cpp-addons.html).
The dependency remains in package.json and must be included when distributing
the app; externalization does not make it optional.

## Limits

These are source/artifact tests under the host Node runtime, not an Electron
app launch, UI automation, distributable/ASAR packaging test or SQLite-file-import
validation. Electron may need a binding rebuilt for its own ABI; see
[Electron's native-module guidance](https://www.electronjs.org/docs/latest/tutorial/using-native-node-modules).
No Electron ABI rebuild or desktop launch is established by this test suite.
## Continuous integration

The root [Cortex workflow](../../../../../.github/workflows/cortex-ci.yml) runs
these checks on Node 22 and 24 when Cortex files or the workflow change in a
pull request or a push to main. It installs the lockfile, typechecks, builds,
runs source and emitted-bundle tests, and checks that tracked Electron output
matches the build. Manual dispatch is also declared.

CI skips downloading Electron's desktop binary because the tests stub its
lifecycle and exercise the host Node native binding. It does not skip SQLite
installation or claim Electron ABI/UI verification. The job requests only
repository contents read access and does not deploy or change branch protection.
Path-filtered runs are not a repository-wide verification claim.
