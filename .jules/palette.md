## 2026-07-24 - [Disambiguating Action Buttons in Lists]
**Learning:** When using mapped lists or grids with icon-only action buttons (like Delete), standard generic `aria-label`s are not enough. It creates an accessibility issue for screen reader users where all they hear is 'Delete, Delete, Delete' with no context.
**Action:** When adding ARIA labels to icon-only buttons within mapped lists or grids, always ensure the label dynamically includes the item's name or identifier (e.g., `aria-label={\`Delete ${item.name}\`}`) to provide disambiguated context.
