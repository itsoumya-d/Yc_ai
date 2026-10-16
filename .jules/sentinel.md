## 2024-05-24 - [SQLite Identifier SQL Injection]
**Vulnerability:** SQL injection in better-sqlite3 via unescaped table and column names (identifiers).
**Learning:** better-sqlite3 cannot parameterize identifiers. When creating tables or interpolating table/column names from user input (like CSV headers), they must be manually escaped by doubling double-quotes.
**Prevention:** Always use a helper function to escape identifiers (e.g. `id.replace(/"/g, '""')`) before interpolating them into a query string inside double quotes.

## 2024-10-13 - [Block Non-SELECT Queries in Desktop Client]
**Vulnerability:** The desktop SQL execution IPC handler blindly allowed arbitrary SQL commands (INSERT, UPDATE, DELETE, DROP), contradicting the safety architecture.
**Learning:** Local-first architecture applications that take arbitrary generated SQL from an AI layer must validate the queries before execution to prevent data destruction.
**Prevention:** Always restrict execution endpoints to only allow SELECT statements when only reading is intended. Parse or strictly inspect the SQL command string before running it.
