## 2023-11-20 - [ARIA labels for Icon Buttons with Dynamic Context]
**Learning:** Icon buttons inside iterated list/map often lack sufficient context when simply given a static aria-label (e.g. 'Show API Key'), making them ambiguous for screen-reader users.
**Action:** When adding ARIA labels to mapped items, always dynamically include the unique identifier or label (e.g. `Show ${label.name} API Key`).
