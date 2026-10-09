## 2025-02-28 - Avoid Chained Array Methods on Large Datasets in React Renders
**Learning:** Chaining array methods like `.map().slice().reduce()` inside a React component's `useMemo` on a large dataset (e.g., query results) can cause multiple O(N) array allocations per column, leading to significant but silent memory bottlenecks and slow execution times.
**Action:** When performing aggregate calculations on large arrays during render, replace chained array methods with a single loop (like a `for` loop) that computes all necessary metrics in one pass to avoid unnecessary memory allocation.

## 2024-07-14 - [Zustand Component Re-Renders]
**Learning:** Full store subscriptions in Zustand (`const store = useAppStore()`) without using state selectors inside frequently updated hooks cause unnecessary and costly re-renders in all components using that hook. In this case, `useQueryEngine` had a useless `useAppStore()` subscription leading to re-renders on every state update, including minor execution time increments.
**Action:** When using Zustand, always use selectors (e.g., `useAppStore((state) => state.property)`) or `useAppStore.getState()` for static references within callbacks to prevent unnecessary re-renders. Avoid subscribing to the full store unless absolutely necessary.
