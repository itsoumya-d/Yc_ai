# CSV import regression checks

From `apps/desktop/b2b/cortex`, after installing its locked dependencies:

```sh
npm test
npm run typecheck
npm run build
```

The tests execute the real TypeScript IPC handlers with `csv-parse` and native
`better-sqlite3`. They cover quoted identifiers, failed schema replacement,
rollback after a partial insert, retry, and malformed/empty CSV input. Fixtures
use temporary CSV files and an in-memory database; no provider credentials are
needed.

Electron's lifecycle/window surface is stubbed. These are handler tests, not
UI automation, native desktop launch checks or SQLite-file-import coverage.
The build regenerates the tracked `dist-electron` output. This aggregate
repository currently has no root GitHub Actions workflow running these checks.

Known separate packaging limitation: a VM smoke check of both the prior and
regenerated Electron main bundle fails to locate `better_sqlite3.node` through
the bundled dynamic-require helper. These source-handler tests do not resolve
that existing native-binding packaging issue; no desktop app launch was tested.
