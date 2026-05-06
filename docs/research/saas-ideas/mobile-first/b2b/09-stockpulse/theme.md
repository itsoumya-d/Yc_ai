# StockPulse — Theme

> Brand identity, color palette, typography, component styling, and design system for warehouse-ready mobile inventory scanning.

---

## Brand Personality

| Trait | Description | How It Shows Up |
|-------|-------------|-----------------|
| **Fast** | Everything happens in real-time. Scanning, counting, ordering — instant. | Micro-animations, haptic feedback, skeleton screens (never blank loading) |
| **Reliable** | Accuracy is everything. Wrong counts cost money. | Confidence scores, confirmation flows, clear data provenance |
| **No-Nonsense** | No marketing fluff in the UI. Every pixel earns its place. | Minimal decoration, functional layouts, data-forward screens |
| **Warehouse-Ready** | Built for hands in gloves, screens in bright light, and 30-second interactions. | Large touch targets, high contrast, dark mode default |
| **Trustworthy** | Small business owners are skeptical of tech. Earn trust through clarity. | Transparent pricing, clear data handling, no dark patterns |

**Brand voice:** Direct, helpful, professional. Like a knowledgeable warehouse manager — not a marketing department.

- Yes: "3 items are running low. Create a purchase order?"
- No: "Your inventory needs some love! Let's fix that together."
- Yes: "Scan complete. 42 products counted."
- No: "Amazing job scanning! You're a StockPulse pro!"

---

## Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Electric Blue** | `#2563EB` | 37, 99, 235 | Primary actions, navigation, brand identity |
| **Blue Dark** | `#1D4ED8` | 29, 78, 216 | Pressed state for primary buttons |
| **Blue Light** | `#3B82F6` | 59, 130, 246 | Hover/focus states, secondary emphasis |
| **Blue Subtle** | `#DBEAFE` | 219, 234, 254 | Light mode backgrounds, badges |

### Status Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **In Stock Green** | `#22C55E` | 34, 197, 94 | In-stock indicators, success states, positive trends |
| **Green Dark** | `#16A34A` | 22, 163, 74 | Pressed state, dark mode green |
| **Green Subtle** | `#DCFCE7` | 220, 252, 231 | Green background tints |
| **Low Stock Amber** | `#F59E0B` | 245, 158, 11 | Low-stock warnings, caution states |
| **Amber Dark** | `#D97706` | 217, 119, 6 | Pressed state, dark mode amber |
| **Amber Subtle** | `#FEF3C7` | 254, 243, 199 | Amber background tints |
| **Out of Stock Red** | `#EF4444` | 239, 68, 68 | Out-of-stock alerts, errors, destructive actions |
| **Red Dark** | `#DC2626` | 220, 38, 38 | Pressed state, critical alerts |
| **Red Subtle** | `#FEE2E2` | 254, 226, 226 | Red background tints |
| **Expiring Orange** | `#F97316` | 249, 115, 22 | Expiration warnings |

### Neutral Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Dark Slate** | `#0F172A` | 15, 23, 42 | Dark mode background, primary text (light mode) |
| **Slate 800** | `#1E293B` | 30, 41, 59 | Dark mode surface, cards |
| **Slate 700** | `#334155` | 51, 65, 85 | Dark mode elevated surface |
| **Slate 600** | `#475569` | 71, 85, 105 | Secondary text (dark mode) |
| **Slate 500** | `#64748B` | 100, 116, 139 | Placeholder text, disabled |
| **Slate 400** | `#94A3B8` | 148, 163, 184 | Inactive icons, borders |
| **Slate 300** | `#CBD5E1` | 203, 213, 225 | Light borders, dividers |
| **Slate 200** | `#E2E8F0` | 226, 232, 240 | Light mode card backgrounds |
| **Slate 100** | `#F1F5F9` | 241, 245, 249 | Light mode page background |
| **White** | `#FFFFFF` | 255, 255, 255 | Light mode surface, dark mode text |

---

## Theme Modes

### Dark Mode (Default)

Dark mode is the **default** for StockPulse. Rationale:
- Walk-in coolers and basements are dim — bright screens cause eye strain
- Kitchens at night (inventory is often counted after closing)
- Reduced battery drain during long scanning sessions
- Warehouse workers strongly prefer dark interfaces

```typescript
const darkTheme = {
  colors: {
    background: '#0F172A',       // Dark Slate
    surface: '#1E293B',          // Slate 800
    surfaceElevated: '#334155',  // Slate 700
    primary: '#2563EB',          // Electric Blue
    primaryPressed: '#1D4ED8',   // Blue Dark
    textPrimary: '#FFFFFF',      // White
    textSecondary: '#94A3B8',    // Slate 400
    textTertiary: '#64748B',     // Slate 500
    border: '#334155',           // Slate 700
    borderLight: '#1E293B',      // Slate 800
    success: '#22C55E',          // In Stock Green
    warning: '#F59E0B',          // Low Stock Amber
    error: '#EF4444',            // Out of Stock Red
    expiring: '#F97316',         // Expiring Orange
    overlay: 'rgba(0, 0, 0, 0.6)',
    scanOverlay: 'rgba(15, 23, 42, 0.7)',
  }
};
```

### Light Mode

```typescript
const lightTheme = {
  colors: {
    background: '#F1F5F9',       // Slate 100
    surface: '#FFFFFF',          // White
    surfaceElevated: '#FFFFFF',  // White (with shadow)
    primary: '#2563EB',          // Electric Blue
    primaryPressed: '#1D4ED8',   // Blue Dark
    textPrimary: '#0F172A',      // Dark Slate
    textSecondary: '#475569',    // Slate 600
    textTertiary: '#94A3B8',     // Slate 400
    border: '#E2E8F0',           // Slate 200
    borderLight: '#F1F5F9',      // Slate 100
    success: '#16A34A',          // Green Dark (better contrast on white)
    warning: '#D97706',          // Amber Dark
    error: '#DC2626',            // Red Dark
    expiring: '#EA580C',         // Orange Dark
    overlay: 'rgba(0, 0, 0, 0.4)',
    scanOverlay: 'rgba(241, 245, 249, 0.7)',
  }
};
```

---

## Typography

### Font Families

| Font | Usage | Weight Range | Why |
|------|-------|-------------|-----|
| **Plus Jakarta Sans** | Headings, screen titles, navigation labels | 600 (SemiBold), 700 (Bold) | Clean, modern, excellent readability. Professional without being corporate. |
| **Inter** | Body text, descriptions, labels, form inputs | 400 (Regular), 500 (Medium), 600 (SemiBold) | Best screen font available. Designed specifically for digital interfaces. |
| **JetBrains Mono** | Quantities, counts, prices, stock numbers, barcodes | 500 (Medium), 700 (Bold) | Monospace makes numbers aligned and scannable. Easy to distinguish 0/O, 1/l/I. |

### Type Scale

```typescript
const typography = {
  // Headings (Plus Jakarta Sans)
  h1: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 28, lineHeight: 36 },
  h2: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 24, lineHeight: 32 },
  h3: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 20, lineHeight: 28 },
  h4: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 18, lineHeight: 24 },

  // Body (Inter)
  bodyLarge: { fontFamily: 'Inter-Regular', fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: 'Inter-Regular', fontSize: 14, lineHeight: 20 },
  bodySmall: { fontFamily: 'Inter-Regular', fontSize: 12, lineHeight: 16 },
  bodyMediumBold: { fontFamily: 'Inter-SemiBold', fontSize: 14, lineHeight: 20 },
  label: { fontFamily: 'Inter-Medium', fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: 'Inter-Regular', fontSize: 12, lineHeight: 16 },

  // Numbers (JetBrains Mono)
  numberLarge: { fontFamily: 'JetBrainsMono-Bold', fontSize: 32, lineHeight: 40 },
  numberMedium: { fontFamily: 'JetBrainsMono-Bold', fontSize: 24, lineHeight: 32 },
  numberSmall: { fontFamily: 'JetBrainsMono-Medium', fontSize: 16, lineHeight: 24 },
  numberTiny: { fontFamily: 'JetBrainsMono-Medium', fontSize: 14, lineHeight: 20 },
  barcode: { fontFamily: 'JetBrainsMono-Medium', fontSize: 12, lineHeight: 16 },
};
```

### Typography Usage Examples

- Screen title: `h2` ("Dashboard", "Inventory", "Scan Mode")
- Section heading: `h3` ("Low Stock Items", "Recent Activity")
- Card title: `h4` ("Chicken Breast", "Sysco Foods")
- Product description: `bodyMedium`
- Stock quantity: `numberMedium` ("42 units")
- Price: `numberSmall` ("$12.50")
- Timestamp: `caption` ("Scanned 2 hours ago")
- Barcode display: `barcode` ("012345678905")

---

## Spacing System

Base unit: **4px**

```typescript
const spacing = {
  xs: 4,    // Tight spacing within components
  sm: 8,    // Between related elements
  md: 12,   // Between component sections
  lg: 16,   // Standard padding
  xl: 20,   // Between cards
  '2xl': 24, // Section spacing
  '3xl': 32, // Major section spacing
  '4xl': 40, // Screen padding top/bottom
  '5xl': 48, // Large separation
};
```

---

## Touch Targets

| Element | Minimum Size | Recommended Size |
|---------|-------------|-----------------|
| Primary button | 48px height | 56px height |
| Icon button | 48x48px | 48x48px |
| Scan button (FAB) | 56x56px | 64x64px |
| List row | 56px height | 64px height |
| Stepper (+/-) button | 44x44px | 48x48px |
| Tab bar item | 48px hit area | 64px hit area |
| Checkbox/toggle | 44x44px | 48x48px |

**Rationale:** Inventory scanning often happens with wet, greasy, or gloved hands. Oversized touch targets reduce mis-taps and frustration.

---

## Icon Library: Phosphor Icons

**Why Phosphor Icons:**
- Consistent 24px grid
- Clean, readable at small sizes
- Available as React Native package (`phosphor-react-native`)
- Multiple weights: Thin, Light, Regular, Bold, Fill, Duotone
- Open source (MIT license)

### Key Icons Used

| Icon Name | Usage | Weight |
|-----------|-------|--------|
| `Camera` | Scan mode, camera-related actions | Bold |
| `Barcode` | Barcode scanning mode | Regular |
| `Package` | Product/inventory items | Regular |
| `WarningCircle` | Low stock alerts | Bold |
| `XCircle` | Out of stock | Bold |
| `CheckCircle` | In stock, success | Bold |
| `Clock` | Expiration tracking | Regular |
| `ShoppingCart` | Purchase orders | Regular |
| `Truck` | Supplier/delivery | Regular |
| `ChartLine` | Reports/analytics | Regular |
| `Gear` | Settings | Regular |
| `Bell` | Notifications | Regular |
| `Plus` | Add new item | Bold |
| `MagnifyingGlass` | Search | Regular |
| `Funnel` | Filter | Regular |
| `ArrowsClockwise` | Sync/refresh | Regular |
| `Export` | Export data | Regular |
| `Users` | Team management | Regular |
| `MapPin` | Location | Regular |
| `Lightning` | Quick action | Bold |

---

## Border Radius

```typescript
const borderRadius = {
  none: 0,
  sm: 6,     // Small elements (badges, chips)
  md: 8,     // Buttons, inputs
  lg: 12,    // Cards, modals
  xl: 16,    // Bottom sheets, large cards
  full: 9999, // Circular elements (avatars, FAB)
};
```

---

## Shadows (Light Mode)

```typescript
const shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  scanButton: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};
```

Dark mode: No shadows. Use `surfaceElevated` background color for elevation hierarchy.

---

## Component Styling Examples

### Scan Button (Center Tab Bar FAB)

```typescript
const ScanButton = {
  container: {
    width: 64,
    height: 64,
    borderRadius: 32, // full circle
    backgroundColor: '#2563EB', // Electric Blue
    justifyContent: 'center',
    alignItems: 'center',
    // Elevated above tab bar
    marginTop: -20,
    ...shadows.scanButton,
  },
  icon: {
    color: '#FFFFFF',
    size: 28,
  },
  // Pressed state
  pressed: {
    backgroundColor: '#1D4ED8', // Blue Dark
    transform: [{ scale: 0.95 }],
  },
  // Scanning active state
  active: {
    backgroundColor: '#EF4444', // Red (recording indicator)
    // Pulsing animation
  },
};
```

### Stock Status Card

```typescript
const StockCard = {
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    // Border color changes by status:
    // In Stock: '#22C55E'
    // Low Stock: '#F59E0B'
    // Out of Stock: '#EF4444'
    // Expiring: '#F97316'
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  productName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  quantity: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 20,
    color: theme.colors.textPrimary,
  },
  unit: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    // Background: status color at 15% opacity
    // Text: status color at 100%
  },
};
```

### Alert Badge

```typescript
const AlertBadge = {
  // Critical (Out of Stock)
  critical: {
    container: {
      backgroundColor: '#FEE2E2', // Red Subtle (light mode)
      // backgroundColor: 'rgba(239, 68, 68, 0.15)', // Dark mode
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    text: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 11,
      color: '#EF4444',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  },
  // Warning (Low Stock)
  warning: {
    container: {
      backgroundColor: '#FEF3C7', // Amber Subtle
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    text: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 11,
      color: '#F59E0B',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  },
  // Info (Notification count)
  info: {
    container: {
      backgroundColor: '#2563EB',
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontFamily: 'JetBrainsMono-Bold',
      fontSize: 11,
      color: '#FFFFFF',
    },
  },
};
```

### Primary Button

```typescript
const PrimaryButton = {
  container: {
    backgroundColor: '#2563EB',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  text: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  pressed: {
    backgroundColor: '#1D4ED8',
  },
  disabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.5,
  },
};
```

### Camera Scan Overlay Label

```typescript
const ScanLabel = {
  container: {
    backgroundColor: 'rgba(37, 99, 235, 0.85)', // Blue with transparency
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  productName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  quantity: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  boundingBox: {
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 4,
    // Position absolute, sized dynamically based on detection
  },
  // High confidence
  highConfidence: {
    borderColor: '#22C55E',
    backgroundColor: 'rgba(34, 197, 94, 0.85)',
  },
  // Low confidence
  lowConfidence: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.85)',
  },
};
```

### Input Field

```typescript
const InputField = {
  container: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
  },
  text: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  placeholder: {
    color: theme.colors.textTertiary,
  },
  focused: {
    borderColor: '#2563EB',
    borderWidth: 2,
  },
  error: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
};
```

---

## Animation Guidelines

| Animation | Duration | Easing | Use Case |
|-----------|----------|--------|----------|
| Screen transition | 300ms | ease-in-out | Navigation between screens |
| Button press | 100ms | ease-out | Scale down to 0.95 on press |
| Toast notification | 200ms in, 150ms out | spring | Slide in from top |
| Scan detection | 150ms | ease-out | Bounding box appears |
| Status change | 200ms | ease-in-out | Color transition for stock status |
| Bottom sheet | 300ms | spring (damping: 20) | Slide up from bottom |
| Pull to refresh | 200ms | ease-out | Spinner rotation |
| Skeleton loading | 1500ms loop | linear | Shimmer effect on loading placeholders |

**Performance rule:** All animations run on the UI thread via `react-native-reanimated`. Never animate on the JS thread.

---

## Accessibility

### Color Contrast Ratios

All color combinations meet WCAG AA (4.5:1 for normal text, 3:1 for large text):

| Foreground | Background | Ratio | Pass? |
|-----------|-----------|-------|-------|
| White text | Electric Blue (#2563EB) | 4.6:1 | Yes (AA) |
| White text | Dark Slate (#0F172A) | 16.9:1 | Yes (AAA) |
| Dark Slate text | White (#FFFFFF) | 16.9:1 | Yes (AAA) |
| In Stock Green text | Dark Slate (#0F172A) | 7.2:1 | Yes (AAA) |
| Low Stock Amber text | Dark Slate (#0F172A) | 8.4:1 | Yes (AAA) |
| Out of Stock Red text | Dark Slate (#0F172A) | 4.7:1 | Yes (AA) |

### Non-Color Status Indicators

Stock status is never communicated by color alone:

| Status | Color | Icon | Text Label |
|--------|-------|------|-----------|
| In Stock | Green dot | CheckCircle | "In Stock" |
| Low Stock | Amber dot | WarningCircle | "Low" |
| Out of Stock | Red dot | XCircle | "Out" |
| Expiring Soon | Orange dot | Clock | "Exp [date]" |

### Screen Reader Support

- All images have descriptive alt text
- Interactive elements have accessible labels and hints
- Announcements for scan results: "Detected Chicken Breast, quantity 5"
- Navigation landmarks for screen sections
- Custom actions for swipe gestures (accessible via long-press menu)

---

## Design Tokens Export

```typescript
// theme/tokens.ts — single source of truth for the entire design system

export const tokens = {
  colors: { /* all colors defined above */ },
  typography: { /* all type styles defined above */ },
  spacing: { /* all spacing values defined above */ },
  borderRadius: { /* all radius values defined above */ },
  shadows: { /* all shadow values defined above */ },
  animation: {
    fast: 100,
    normal: 200,
    slow: 300,
    spring: { damping: 20, stiffness: 200 },
  },
  touchTarget: {
    minimum: 48,
    recommended: 56,
    fab: 64,
  },
};
```

---

*Theme designed for the real world: dimly lit coolers, bright kitchens, greasy hands, and people who have 30 seconds — not 5 minutes.*
