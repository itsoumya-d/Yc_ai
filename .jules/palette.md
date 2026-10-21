
## 2024-05-18 - Dynamic ARIA Labels in Mapped Lists
**Learning:** When dealing with mapped lists of items in React (like templates, clauses, or team members), statically providing an ARIA label to an icon-only button (e.g., `aria-label="Edit"`) leads to ambiguity for screen reader users, since they will hear "Edit button" repeatedly without knowing *which* item it edits.
**Action:** Always dynamically include the item's contextual identifier (e.g., `aria-label={"Edit " + item.name}`) in ARIA labels for icon-only buttons within loops.
