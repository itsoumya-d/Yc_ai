## 2024-05-18 - [CRITICAL] SQL Injection via SQLite Identifiers in better-sqlite3
**Vulnerability:** SQL injection vulnerability via dynamically generated table and column names in `better-sqlite3` operations, which could allow arbitrary SQL execution if a malicious table/column name was passed.
**Learning:** `better-sqlite3` does not support parameterization of identifiers (table/column names), leaving them vulnerable if directly concatenated inside strings.
**Prevention:** Always manually escape double quotes in SQLite identifiers using `.replace(/"/g, '""')` before interpolating them into SQL statements containing `""` wrappers.
