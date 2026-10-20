## 2024-05-18 - Dynamically Contextualize Icon Buttons in Lists
**Learning:** When using icon-only buttons (like a trash can for 'Delete') inside a list or grid that maps over multiple items, a static `aria-label="Delete"` is insufficient and confusing for screen reader users, as it doesn't specify *which* item is being deleted.
**Action:** Always dynamically generate the `aria-label` to include the item's name or identifier (e.g., `aria-label={"Delete " + item.name}`) to provide disambiguated context for accessibility.
