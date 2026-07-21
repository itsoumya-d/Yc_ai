## 2024-05-16 - [SQL Injection via Unescaped Identifiers in better-sqlite3]
**Vulnerability:** SQL injection vulnerability in `apps/desktop/b2b/cortex/electron/main.ts` where unescaped identifiers (like table and column names) are interpolated directly into raw SQLite queries (`DROP TABLE`, `CREATE TABLE`, `INSERT`, `PRAGMA table_info`).
**Learning:** `better-sqlite3` parameterization only applies to values, not identifiers. User-controlled identifiers must be manually sanitized/escaped.
**Prevention:** Always escape double quotes in dynamic SQLite identifiers using `.replace(/"/g, '""')` to prevent SQL injection in raw queries.
