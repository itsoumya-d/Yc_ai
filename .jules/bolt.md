## 2025-02-28 - Avoid Chained Array Methods on Large Datasets in React Renders
**Learning:** Chaining array methods like `.map().slice().reduce()` inside a React component's `useMemo` on a large dataset (e.g., query results) can cause multiple O(N) array allocations per column, leading to significant but silent memory bottlenecks and slow execution times.
**Action:** When performing aggregate calculations on large arrays during render, replace chained array methods with a single loop (like a `for` loop) that computes all necessary metrics in one pass to avoid unnecessary memory allocation.
## 2025-02-28 - Accidental Full Zustand Store Subscription in Custom Hooks
**Learning:** Initializing `const store = useAppStore();` without utilizing it inside a custom React hook creates an accidental full store subscription. Any consumer of the hook re-renders on ANY state change, degrading performance dramatically across the app.
**Action:** When a hook only needs state access inside callbacks (like `useCallback`), strictly use `useAppStore.getState()` instead of a hook call to prevent unnecessary reactive component re-renders.
