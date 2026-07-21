## 2024-05-24 - [SQLite Identifier SQL Injection]
**Vulnerability:** SQL injection in better-sqlite3 via unescaped table and column names (identifiers).
**Learning:** better-sqlite3 cannot parameterize identifiers. When creating tables or interpolating table/column names from user input (like CSV headers), they must be manually escaped by doubling double-quotes.
**Prevention:** Always use a helper function to escape identifiers (e.g. `id.replace(/"/g, '""')`) before interpolating them into a query string inside double quotes.
