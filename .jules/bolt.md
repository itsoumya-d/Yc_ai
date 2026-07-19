## 2025-02-28 - Avoid Chained Array Methods on Large Datasets in React Renders
**Learning:** Chaining array methods like `.map().slice().reduce()` inside a React component's `useMemo` on a large dataset (e.g., query results) can cause multiple O(N) array allocations per column, leading to significant but silent memory bottlenecks and slow execution times.
**Action:** When performing aggregate calculations on large arrays during render, replace chained array methods with a single loop (like a `for` loop) that computes all necessary metrics in one pass to avoid unnecessary memory allocation.
## 2025-03-09 - Avoid Full Store Subscriptions in Custom Hooks
**Learning:** Subscribing to an entire Zustand store (e.g., `const store = useAppStore();`) inside a custom hook (like `useQueryEngine`) forces any React component consuming that hook to unnecessarily re-render whenever *any* state in the store changes, creating a massive hidden performance bottleneck.
**Action:** When a custom hook only needs to call store actions or reference state statically within callbacks, use `useAppStore.getState()` instead of a hook subscription to prevent unwanted re-renders.
