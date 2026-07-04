## 2024-07-04 - Redundant array allocations in React useMemo
**Learning:** In the Cortex app (NL-to-SQL dashboard), KPI computations in `useMemo` were chaining `slice()`, `map()`, and `reduce()` multiple times over the same `queryResults`. This causes multiple O(N) iterations and memory allocations per calculation, which can slow down rendering when results are large.
**Action:** Replace chained array iterations with a single-pass `for` loop to compute aggregations, avoiding intermediate array allocations and reducing loop overhead.
