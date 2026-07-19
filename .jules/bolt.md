## 2025-02-28 - Avoid Chained Array Methods on Large Datasets in React Renders
**Learning:** Chaining array methods like `.map().slice().reduce()` inside a React component's `useMemo` on a large dataset (e.g., query results) can cause multiple O(N) array allocations per column, leading to significant but silent memory bottlenecks and slow execution times.
**Action:** When performing aggregate calculations on large arrays during render, replace chained array methods with a single loop (like a `for` loop) that computes all necessary metrics in one pass to avoid unnecessary memory allocation.

## 2025-02-28 - Unnecessary Zustand Subscriptions in Custom Hooks
**Learning:** Initializing a Zustand store with `const store = useAppStore();` inside a custom hook (without using a selector) causes any component consuming that hook to subscribe to the *entire* store. This leads to severe, silent performance bottlenecks, as components will unnecessarily re-render on *any* store state change, even if the hook only uses functions or doesn't read the state.
**Action:** When creating custom hooks that need to interact with a Zustand store, avoid subscribing to the whole store. If you only need to trigger actions or read state within callbacks, use `useAppStore.getState()` inside the callbacks instead of calling the hook at the root level.
