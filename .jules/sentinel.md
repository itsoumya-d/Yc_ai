
## 2025-03-08 - SQL Injection in Dynamic SQLite Identifiers
**Vulnerability:** SQL injection via double quotes in unparameterized dynamically injected SQLite table and column names using `better-sqlite3`.
**Learning:** SQLite cannot parameterize identifiers. If identifiers are injected using template strings, malicious content (like CSV headers) with double quotes could prematurely end the identifier string and allow arbitrary SQL command execution.
**Prevention:** Always manually escape SQLite identifiers by replacing `"` with `""` (e.g., `identifier.replace(/"/g, '""')`) before injecting them into a SQL command.
