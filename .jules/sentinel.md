## 2024-05-18 - [SQL Injection via SQLite Identifiers]
**Vulnerability:** SQL injection vulnerabilities existed because table names and column names derived from external sources (e.g., CSV files or loaded SQLite databases) were directly interpolated into SQL queries without proper sanitization.
**Learning:** `better-sqlite3` and SQLite parameterization only support values, not identifiers (table and column names). Consequently, standard parameter binding (`?`) does not protect against malicious identifiers.
**Prevention:** Always manually escape SQLite identifiers by replacing single occurrences of double quotes with two double quotes (`.replace(/"/g, '""')`) before incorporating them into SQL queries.
