## 2024-05-24 - [SQLite Identifier SQL Injection]
**Vulnerability:** SQL injection in better-sqlite3 via unescaped table and column names (identifiers).
**Learning:** better-sqlite3 cannot parameterize identifiers. When creating tables or interpolating table/column names from user input (like CSV headers), they must be manually escaped by doubling double-quotes.
**Prevention:** Always use a helper function to escape identifiers (e.g. `id.replace(/"/g, '""')`) before interpolating them into a query string inside double quotes.
## 2024-05-24 - [execute-sql IPC Mutation Vulnerability]
**Vulnerability:** The `execute-sql` IPC endpoint allowed non-SELECT queries (mutations) directly from renderer, enabling data loss or injection.
**Learning:** Checking strictly for `SELECT`, `WITH`, or `EXPLAIN` query beginnings successfully isolates SQL endpoints intended for read-only use. Be sure to strip comments before validation to avoid simple bypasses like `/* comment */ DROP TABLE users`.
**Prevention:** Strictly lock down any exposed client-side SQL execution handler in desktop applications to read-only statements using regex stripping of comments and `String.startsWith` verification, avoiding `exec` in favor of `prepare` and `all`.
