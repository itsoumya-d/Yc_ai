## 2024-05-24 - [SQLite Identifier SQL Injection]
**Vulnerability:** SQL injection in better-sqlite3 via unescaped table and column names (identifiers).
**Learning:** better-sqlite3 cannot parameterize identifiers. When creating tables or interpolating table/column names from user input (like CSV headers), they must be manually escaped by doubling double-quotes.
**Prevention:** Always use a helper function to escape identifiers (e.g. `id.replace(/"/g, '""')`) before interpolating them into a query string inside double quotes.

## $(date +%Y-%m-%d) - Inherent SQLite Protection Against Chained Injection and Execution Type Mismatches
**Vulnerability:** A perceived risk that a string-based query prefix validation (e.g., \`sql.startsWith('SELECT')\`) could be bypassed by preceding a destructive query (like \`DROP TABLE\`) with a valid prefix via comments (e.g., \`/* SELECT */ DROP TABLE\`) or chaining (e.g., \`SELECT 1; DROP TABLE\`).
**Learning:** `better-sqlite3` provides inherent protections that make regex-based comment stripping and execution-type blocking unnecessary in certain contexts. \`database.prepare(sql)\` throws a \`RangeError\` if multiple statements are provided, preventing chained injections. Furthermore, calling \`.all()\` on a prepared statement that doesn't return data (like \`DROP TABLE\`) throws an error, inherently preventing DML execution when data-returning queries are expected.
**Prevention:** Rely on the underlying database library's inherent protections (like \`prepare()\` strictness and \`.all()\` vs \`.run()\` enforcement) rather than attempting to build brittle string-parsing validators (regex) in application code, which often break valid use cases (like queries containing strings with \`--\` or \`/*\`).
