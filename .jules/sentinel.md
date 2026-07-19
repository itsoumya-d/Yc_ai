## 2024-07-18 - Escaping SQLite Identifiers with better-sqlite3
**Vulnerability:** SQL injection risks exist when using dynamic database identifiers (like table or column names) because `better-sqlite3` and SQLite in general do not support parameterization for identifiers.
**Learning:** If user-provided or externally-derived strings are used as table or column names (e.g. from CSV headers or another database's schema), they must be properly escaped by replacing double quotes `"` with two double quotes `""`.
**Prevention:** Always use `.replace(/"/g, '""')` on identifiers being formatted into query strings (like `CREATE TABLE`, `INSERT INTO`, or `PRAGMA table_info`) when using `better-sqlite3`.
