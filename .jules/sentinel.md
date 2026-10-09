## 2024-07-06 - [SQL Injection in IPC Handlers]
**Vulnerability:** Unsanitized user inputs (table and column names from loaded files) were used directly in raw SQL queries via template literals during SQLite operations.
**Learning:** Even when SQLite databases are in-memory or localized, dynamically creating tables and inserting records based on untrusted inputs requires proper identifier escaping. Prepared statements only protect values, not table or column identifiers.
**Prevention:** Always use a helper function to escape identifiers (e.g., doubling double quotes `""`) when constructing SQL dynamically for table/column names that cannot be parameterized.
