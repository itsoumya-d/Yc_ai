## 2025-02-28 - Avoid Chained Array Methods on Large Datasets in React Renders
**Learning:** Chaining array methods like `.map().slice().reduce()` inside a React component's `useMemo` on a large dataset (e.g., query results) can cause multiple O(N) array allocations per column, leading to significant but silent memory bottlenecks and slow execution times.
**Action:** When performing aggregate calculations on large arrays during render, replace chained array methods with a single loop (like a `for` loop) that computes all necessary metrics in one pass to avoid unnecessary memory allocation.

## 2026-10-09 - Zustand Store Subscription Top-Level Hook Performance Trap
**Learning:** In Zustand v5, fetching the entire store object via `const store = useAppStore();` at the top level of a custom React hook (like `useQueryEngine`) causes any consuming component to unnecessarily subscribe to the entire store. This forces widespread, expensive re-renders across the app whenever any unrelated state property changes.
**Action:** Always use specific selectors (e.g., `useAppStore((state) => state.property)`) for reactive state, or use `useAppStore.getState()` when state values are only needed within non-reactive callbacks like event handlers or async function executions.
