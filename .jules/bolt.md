## 2025-02-28 - Avoid Chained Array Methods on Large Datasets in React Renders
**Learning:** Chaining array methods like `.map().slice().reduce()` inside a React component's `useMemo` on a large dataset (e.g., query results) can cause multiple O(N) array allocations per column, leading to significant but silent memory bottlenecks and slow execution times.
**Action:** When performing aggregate calculations on large arrays during render, replace chained array methods with a single loop (like a `for` loop) that computes all necessary metrics in one pass to avoid unnecessary memory allocation.

## 2026-07-12 - Avoid spread operator with array mapping for aggregate calculations
**Learning:** Using `Math.max(...array.map(item => item.value))` creates an intermediate array and passes it as individual arguments to `Math.max`. On large arrays, this can cause a 'Maximum call stack size exceeded' error and wastes memory.
**Action:** Use `array.reduce((max, item) => Math.max(max, item.value), initialValue)` instead to find the max/min of an array of objects efficiently without creating intermediate arrays or risking stack overflow.
