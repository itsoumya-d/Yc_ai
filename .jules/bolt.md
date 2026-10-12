## 2025-02-28 - Avoid Chained Array Methods on Large Datasets in React Renders
**Learning:** Chaining array methods like `.map().slice().reduce()` inside a React component's `useMemo` on a large dataset (e.g., query results) can cause multiple O(N) array allocations per column, leading to significant but silent memory bottlenecks and slow execution times.
**Action:** When performing aggregate calculations on large arrays during render, replace chained array methods with a single loop (like a `for` loop) that computes all necessary metrics in one pass to avoid unnecessary memory allocation.

## 2025-02-28 - Unnecessary Zustand Store Subscriptions in Custom Hooks
**Learning:** Calling a Zustand store hook (e.g., `const store = useAppStore();`) without providing a selector subscribes the calling component to *every* change in the store. If this happens inside a custom hook (like `useQueryEngine`), any component using that hook will unnecessarily re-render on any unrelated state change across the app.
**Action:** When a custom hook only needs to read or write state inside callbacks (e.g., inside `useCallback`), use `useAppStore.getState()` instead of subscribing via the hook.
