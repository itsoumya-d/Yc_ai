## 2024-05-18 - Prevent SQL Injection in better-sqlite3 Identifiers
**Vulnerability:** SQLite table and column identifiers in generated queries were vulnerable to SQL injection because double quotes were not escaped. A malicious CSV header or SQLite table/column name could break out of the identifier quotes and execute arbitrary SQL.
**Learning:** `better-sqlite3` does not support parameterizing identifiers (table names, column names), only values. Identifiers must be manually escaped by replacing double quotes with two double quotes.
**Prevention:** Always escape identifiers like `id.replace(/"/g, '""')` before interpolating them into SQL strings.
