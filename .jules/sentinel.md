## 2025-07-10 - Escape SQLite Identifiers to prevent SQL Injection
**Vulnerability:** SQL Injection in SQLite queries (via dynamic identifiers)
**Learning:** Table and column names loaded from external sources (e.g. CSVs, SQLite files) were being directly interpolated into `CREATE TABLE`, `DROP TABLE`, and `INSERT` queries in `apps/desktop/b2b/cortex/electron/main.ts` without escaping. Identifiers cannot be parameterized with `?`.
**Prevention:** Always escape double quotes by replacing `"` with `""` (`.replace(/"/g, '""')`) when dynamically inserting identifiers into SQLite query strings.
