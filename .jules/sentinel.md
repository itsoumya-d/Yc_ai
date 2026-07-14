## 2024-05-18 - SQLite Identifier Injection
**Vulnerability:** SQLite identifiers (like table names and column names) were interpolated directly into raw SQL strings using double quotes without escaping. Since they cannot be parameterized like values, this allowed potential SQL injection if an identifier name contained a double quote (e.g., loaded from a CSV).
**Learning:** `better-sqlite3` and SQLite in general do not support parameterizing identifiers. When user-controlled data is used as an identifier, it must be manually escaped by replacing double quotes with two double quotes.
**Prevention:** Always escape any string used as a table name or column name with `.replace(/"/g, '""')` before using it in a raw SQL query.
