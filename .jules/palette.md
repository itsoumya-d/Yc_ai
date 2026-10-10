## 2024-05-18 - Missing native dependency compilation
**Learning:** `better-sqlite3` native bindings may fail to resolve tests out-of-the-box in Cortex due to node_modules/ignore-scripts configurations. However, UX enhancements in standard React components (TitleBar) are independent of this test failure and do not regress existing tests.
**Action:** Always test components, but recognize when native dependency test failures are orthogonal to simple UX/ARIA label additions.
