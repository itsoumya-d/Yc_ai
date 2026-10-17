## 2024-05-24 - [SQLite Identifier SQL Injection]
**Vulnerability:** SQL injection in better-sqlite3 via unescaped table and column names (identifiers).
**Learning:** better-sqlite3 cannot parameterize identifiers. When creating tables or interpolating table/column names from user input (like CSV headers), they must be manually escaped by doubling double-quotes.
**Prevention:** Always use a helper function to escape identifiers (e.g. `id.replace(/"/g, '""')`) before interpolating them into a query string inside double quotes.

## 2024-10-18 - [execute-sql IPC Handler SQL Injection/Mutation]
**Vulnerability:** The `execute-sql` Electron IPC handler allowed execution of non-SELECT statements (like `DROP TABLE`, `INSERT`, `CREATE`), allowing potential data destruction and schema manipulation by end-users or AI-generated SQL.
**Learning:** In desktop applications where user input or AI-generated queries are passed to a backend query handler, it's critical to strictly enforce read-only operations to prevent unauthorized data mutation or destruction.
**Prevention:** Strictly validate incoming SQL queries in the IPC handler to ensure they only begin with read-only commands (`SELECT`, `WITH`, `EXPLAIN`) and throw an explicit error for any other statements.
