## 2025-02-28 - Avoid Chained Array Methods on Large Datasets in React Renders
**Learning:** Chaining array methods like `.map().slice().reduce()` inside a React component's `useMemo` on a large dataset (e.g., query results) can cause multiple O(N) array allocations per column, leading to significant but silent memory bottlenecks and slow execution times.
**Action:** When performing aggregate calculations on large arrays during render, replace chained array methods with a single loop (like a `for` loop) that computes all necessary metrics in one pass to avoid unnecessary memory allocation.

## 2025-02-28 - Unnecessary Full-Store Subscriptions in Custom Hooks (Zustand v5)
**Learning:** Using `const store = useAppStore()` without selectors at the root of a custom hook forces any component consuming that hook to subscribe to the *entire* store. In an app with frequent state updates (like query execution time, query status), this causes massive unnecessary re-renders across all consuming components.
**Action:** Always use granular selectors (e.g., `useAppStore(state => state.property)`) or `useAppStore.getState()` for static references within callbacks. Never subscribe to the entire store inside custom hooks.
