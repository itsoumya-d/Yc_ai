## 2024-05-24 - [SQLite Identifier SQL Injection]
**Vulnerability:** SQL injection in better-sqlite3 via unescaped table and column names (identifiers).
**Learning:** better-sqlite3 cannot parameterize identifiers. When creating tables or interpolating table/column names from user input (like CSV headers), they must be manually escaped by doubling double-quotes.
**Prevention:** Always use a helper function to escape identifiers (e.g. `id.replace(/"/g, '""')`) before interpolating them into a query string inside double quotes.

## 2024-05-24 - [Unrestricted SQL Execution in IPC]
**Vulnerability:** The `execute-sql` IPC handler allowed executing arbitrary, destructive SQL statements (like `DROP TABLE`, `DELETE`, `INSERT`) because it fell back to `database.exec(sql)` for non-SELECT queries.
**Learning:** IPC handlers acting as a bridge between the frontend and a local database must strictly validate the query type. Allowing unrestricted `exec()` opens the application to data destruction and unauthorized mutations from the frontend.
**Prevention:** Strictly allow-list query types (e.g., `SELECT`, `WITH`, `EXPLAIN`) and throw an explicit error for anything else. Never use `exec()` with arbitrary frontend input in a general-purpose query handler.
