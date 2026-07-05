## 2025-02-28 - Avoid Chained Array Methods on Large Datasets in React Renders
**Learning:** Chaining array methods like `.map().slice().reduce()` inside a React component's `useMemo` on a large dataset (e.g., query results) can cause multiple O(N) array allocations per column, leading to significant but silent memory bottlenecks and slow execution times.
**Action:** When performing aggregate calculations on large arrays during render, replace chained array methods with a single loop (like a `for` loop) that computes all necessary metrics in one pass to avoid unnecessary memory allocation.
