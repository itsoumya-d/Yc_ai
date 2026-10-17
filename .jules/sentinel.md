## 2024-05-24 - [SQLite Identifier SQL Injection]
**Vulnerability:** SQL injection in better-sqlite3 via unescaped table and column names (identifiers).
**Learning:** better-sqlite3 cannot parameterize identifiers. When creating tables or interpolating table/column names from user input (like CSV headers), they must be manually escaped by doubling double-quotes.
**Prevention:** Always use a helper function to escape identifiers (e.g. `id.replace(/"/g, '""')`) before interpolating them into a query string inside double quotes.

## 2024-05-18 - [Restrict IPC SQL execution to read-only queries]
**Vulnerability:** The IPC handler `execute-sql` in `apps/desktop/b2b/cortex` allowed unrestricted execution of any SQL command, potentially allowing an attacker who gains control over the renderer (e.g. through XSS) to drop tables or corrupt data.
**Learning:** Even though the database might be primarily in-memory or loaded from external sources, all IPC bridges should adhere strictly to the principle of least privilege. In this application, generated SQL is only supposed to execute `SELECT` queries for viewing, while mutations are handled by separate, dedicated handlers like `load-csv`.
**Prevention:** Always validate and restrict the types of SQL queries permitted through generic IPC handlers (`execute-sql`) to read-only statements (`SELECT`, `WITH`, `EXPLAIN`) and enforce parameterization where necessary.
