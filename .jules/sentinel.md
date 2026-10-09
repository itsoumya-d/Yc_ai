## 2024-07-11 - [SQL Injection via SQLite Identifiers]
**Vulnerability:** The application dynamically constructed SQL queries using user-controlled table and column names without proper escaping, allowing for SQL injection.
**Learning:** SQLite identifiers (like table and column names) cannot be parameterized using standard `?` placeholders when using `better-sqlite3` in desktop apps.
**Prevention:** Always manually escape SQLite identifiers by replacing double quotes with two double quotes (`.replace(/"/g, '""')`) before using them in raw SQL queries.
