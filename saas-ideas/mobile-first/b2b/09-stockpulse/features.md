# StockPulse — Features

> MVP roadmap, post-MVP features, Year 2+ vision, user stories, and development timeline.

---

## Feature Priority Matrix

| Priority | Category | Description | Effort | Impact |
|----------|----------|-------------|--------|--------|
| P0 | Core | Camera-based inventory scanning | High | Critical |
| P0 | Core | Barcode/QR code reading | Medium | Critical |
| P0 | Core | Product database (add/edit/delete) | Medium | Critical |
| P0 | Core | Stock level tracking per location | Medium | Critical |
| P0 | Core | Low-stock alerts (push notifications) | Low | High |
| P1 | Core | Basic reporting (stock levels, scan history) | Medium | High |
| P1 | Core | Manual count entry fallback | Low | High |
| P1 | Workflow | Auto purchase order generation | High | High |
| P1 | Integration | Supplier directory and contact management | Medium | Medium |
| P2 | Tracking | Expiration date tracking and alerts | Medium | High |
| P2 | Analytics | Waste analytics dashboard | Medium | High |
| P2 | Scale | Multi-location support | High | Medium |
| P2 | Integration | POS integration (Square, Toast, Clover) | High | High |
| P3 | AI | Predictive ordering (demand forecasting) | Very High | High |
| P3 | Compliance | Shelf planogram compliance scanning | High | Medium |
| P3 | Marketplace | Vendor price comparison | High | Medium |
| P3 | Hardware | RFID/NFC tag support | Medium | Low |

---

## Phase 1: MVP (Months 1-6)

### 1.1 Camera-Based Inventory Scanning

**The core feature.** Point your phone camera at a shelf, cooler, or storage area, and StockPulse identifies products and estimates quantities.

**User Story:** As a restaurant manager, I want to walk through my walk-in cooler with my phone and have inventory counted automatically, so I can finish my weekly count in 15 minutes instead of 2 hours.

**How it works:**
1. User opens Scan Mode — camera activates with AI overlay
2. User slowly pans across shelf or storage area
3. AI identifies products in real-time (bounding boxes on screen)
4. Each product detection is matched against the product database
5. Quantities are estimated and displayed as floating labels
6. User confirms or adjusts counts with quick tap gestures
7. Scan results are saved to inventory with timestamp

**Technical details:**
- Frame capture every 500ms during active scan
- Frames sent to GPT-4o Vision API for product identification
- Results displayed as real-time overlay on camera feed
- Haptic feedback on successful product detection
- Scan session saves all detected products as a batch

**Edge cases:**
- Products partially obscured by other items
- Poor lighting in walk-in coolers and basements
- Products without labels (loose produce, bulk items)
- Camera shake and motion blur
- Products the AI has never seen before

**Mitigations:**
- LED flash toggle for dark environments
- Image stabilization via frame selection (pick sharpest frame)
- "Unknown product" flow — user names it, AI learns for next time
- Confidence threshold — only auto-count above 85% confidence, flag uncertain items for manual review
- Barcode fallback always available

---

### 1.2 Barcode/QR Code Reading

**The reliable fallback.** When AI vision is uncertain, barcodes provide definitive product identification.

**User Story:** As a convenience store owner, I want to scan product barcodes to instantly add them to my inventory count, especially for new products I have not added yet.

**Features:**
- Real-time barcode scanning (UPC, EAN, QR, Code 128, Code 39)
- Automatic product lookup via Barcode Lookup API and Open Food Facts
- New product auto-creation from barcode data (name, category, image)
- Batch scanning mode — scan multiple barcodes in rapid succession
- Audio feedback (beep) on successful scan
- History of recent barcode scans for quick re-count

**Edge cases:**
- Damaged or partially torn barcodes
- Very small barcodes (jewelry, cosmetics)
- QR codes that link to websites rather than product data
- Barcodes not found in any database

---

### 1.3 Product Database

**User Story:** As a store owner, I want to maintain a catalog of all my products with photos, categories, and reorder levels so the system knows what to look for when scanning.

**Features:**
- Add products manually (name, SKU, barcode, category, unit, cost, min stock level)
- Import products from CSV/spreadsheet upload
- Import products from POS system catalog (Phase 2)
- Auto-create products from barcode scans
- Product photos (from camera or gallery)
- Category management (custom categories per business type)
- Unit types: each, case, pound, kilogram, liter, gallon, box, bag
- Cost per unit tracking for value calculations
- Minimum stock level per product (triggers low-stock alerts)
- Search, filter, and sort product catalog
- Bulk edit (change category, update costs for multiple products)

**Default categories by business type:**
- Restaurant: Proteins, Produce, Dairy, Dry Goods, Beverages, Cleaning Supplies, Paper Goods
- Retail: Snacks, Beverages, Tobacco, Household, Personal Care, Frozen, Refrigerated
- Food Truck: Proteins, Produce, Sauces, Buns/Bread, Beverages, Disposables

---

### 1.4 Stock Level Tracking

**User Story:** As a restaurant owner with 3 locations, I want to see current stock levels for every product at every location in one view, so I know where I am running low before it becomes a problem.

**Features:**
- Real-time stock levels per product per location
- Stock status indicators: In Stock (green), Low (amber), Critical (red), Out of Stock (dark red)
- Stock history — track how levels change over time
- Last scanned timestamp per product
- Variance tracking — compare expected stock vs actual scan
- Stock value calculation (quantity x cost per unit)
- Daily stock snapshot for trend analysis

---

### 1.5 Low-Stock Alerts

**User Story:** As a busy store owner, I want to receive a push notification on my phone when any product drops below its reorder level, so I can order before I run out.

**Features:**
- Push notifications via OneSignal when stock hits minimum level
- Configurable alert thresholds per product
- Alert grouping — batch multiple low-stock alerts into one notification
- Alert escalation — second alert if still low after 24 hours
- In-app alert center with history
- Email digest option (daily summary of low-stock items)
- Snooze alerts for individual products
- Team alerts — notify specific team members based on product category

---

### 1.6 Basic Reporting

**User Story:** As an owner, I want to see summary reports of my inventory value, most-scanned products, and stock trends so I can make better purchasing decisions.

**MVP reports:**
- **Stock Summary** — Current inventory value by location and category
- **Scan Activity** — Number of scans per day/week/month, who scanned
- **Low Stock Report** — All products currently below minimum level
- **Stock Movement** — Products with biggest quantity changes this week
- **Inventory Count Sheet** — Printable/exportable PDF of current stock levels

**Export formats:** PDF, CSV, Google Sheets sync

---

### 1.7 Manual Count Entry Fallback

**User Story:** As a staff member, I want to be able to manually enter inventory counts when scanning is not practical (e.g., counting items inside a sealed box), so I can always complete the full count.

**Features:**
- Quick manual entry from product list
- Number pad optimized for fast count entry
- "Count all" mode — walks through entire product catalog sequentially
- Adjustments — add/subtract from current count without replacing it
- Notes field — explain why a manual adjustment was made
- Manual entries flagged differently from scanned counts in reports

---

## Phase 2: Post-MVP (Months 7-12)

### 2.1 Auto Purchase Order Generation

**User Story:** As a restaurant manager, I want StockPulse to automatically generate a purchase order for all my low-stock items, pre-filled with my usual suppliers and quantities, so I can review and send it in under a minute.

**Features:**
- One-tap PO generation from low-stock alerts
- Supplier matching — each product linked to preferred supplier
- Order quantity suggestions based on historical usage
- PO review and edit before sending
- Send PO via email directly from the app
- PO tracking (draft, sent, confirmed, received)
- Receiving workflow — scan incoming delivery to confirm PO items received
- PO history and reorder from past orders

---

### 2.2 Supplier Integration

**Features:**
- Supplier directory with contact info, catalogs, and order history
- Supplier-specific pricing and minimum order quantities
- Multiple suppliers per product (primary and backup)
- Supplier performance tracking (on-time delivery rate, accuracy)
- Direct email/SMS to suppliers from within the app

---

### 2.3 Expiration Date Tracking

**User Story:** As a restaurant manager, I want to know exactly which items are expiring in the next 3 days so I can use them first or discount them, reducing my food waste.

**Features:**
- Scan expiration dates from product labels using AI vision
- Manual expiration date entry
- FIFO (First In, First Out) tracking
- Expiration alerts: 7-day, 3-day, 1-day, expired
- "Use First" list — prioritized list of items closest to expiration
- Waste log — track items discarded due to expiration
- Waste cost calculation — dollar value of expired items this month
- Color-coded inventory list by expiration urgency

---

### 2.4 Waste Analytics

**Features:**
- Monthly waste report (items, quantities, dollar values)
- Waste by category — which categories have highest waste rates
- Waste trends — is waste going up or down over time
- Waste causes — expiration, damage, overstock, spoilage
- Benchmarking — compare your waste to industry averages
- ROI calculator — show how much waste reduction saves

---

### 2.5 Multi-Location Support

**Features:**
- Switch between locations with one tap
- Per-location inventory, stock levels, and alerts
- Cross-location stock transfer tracking
- Consolidated reporting across all locations
- Location-specific settings (alert thresholds, team members)
- Location types (restaurant, warehouse, food truck)
- Location performance comparison dashboard

---

### 2.6 POS Integration

**User Story:** As a restaurant owner using Toast, I want my inventory to automatically decrease when items sell through the POS, so my stock levels are always accurate without re-scanning.

**Supported POS systems:**
- **Square** — OAuth integration, real-time sales sync
- **Toast** — API integration, menu item mapping to inventory products
- **Clover** — OAuth integration, inventory sync

**Features:**
- Automatic inventory deduction on sale
- Menu item to inventory product mapping (1 burger = 1 bun, 1 patty, 2 oz lettuce)
- Sales velocity reporting — how fast each product sells
- Reorder point suggestions based on sales velocity
- POS catalog sync — import products directly from POS

---

## Phase 3: Year 2+ Vision

### 3.1 Predictive Ordering (AI Demand Forecasting)

**User Story:** As a restaurant owner, I want StockPulse to predict how much of each product I will need next week based on historical sales, seasonality, weather, and local events, so I never over-order or under-order.

**Features:**
- ML-based demand forecasting per product per location
- Factors: historical sales, day of week, seasonality, weather, holidays, local events
- Automated reorder suggestions with optimal timing
- Confidence intervals on predictions
- "What if" scenarios — "What if we run a promotion on chicken?"
- Forecast accuracy tracking and self-improvement

---

### 3.2 Shelf Planogram Compliance

**Features:**
- Define ideal shelf layouts (planograms) per location
- Scan shelf and compare to planogram
- Compliance score and deviation report
- Missing product alerts
- Photo-based audit trail for compliance checks

---

### 3.3 Vendor Price Comparison

**Features:**
- Compare prices across multiple suppliers for the same product
- Price history tracking per supplier
- Automatic savings calculations when switching suppliers
- Supplier marketplace — discover new vendors with competitive pricing
- Price alerts when a commonly ordered item drops in price

---

### 3.4 RFID/NFC Support

**Features:**
- Read RFID tags for instant product identification
- NFC tap-to-count for tagged items
- Bulk scanning via RFID reader attachment
- Asset tracking for reusable containers and equipment
- Integration with existing RFID infrastructure

---

## User Stories Summary

| Role | Story | Phase |
|------|-------|-------|
| Store owner | Walk through store with phone, count inventory in 15 min instead of 2 hours | MVP |
| Restaurant manager | Scan walk-in cooler after delivery to verify order | MVP |
| Staff member | Quickly scan shelves and flag low-stock items | MVP |
| Owner | Receive push alert when key items are running low | MVP |
| Manager | Generate purchase order from low-stock report in one tap | Post-MVP |
| Owner | See which items are expiring in the next 3 days | Post-MVP |
| Multi-location owner | Compare stock levels across locations from one dashboard | Post-MVP |
| Owner | Let POS sales automatically adjust inventory counts | Post-MVP |
| Owner | Get AI-predicted order quantities for next week | Year 2+ |
| Regional manager | Verify shelf layouts match corporate planograms | Year 2+ |

---

## Development Timeline

### Month 1-2: Foundation

- [ ] Project setup (Expo, Supabase, CI/CD)
- [ ] Auth flow (signup, login, magic link)
- [ ] Organization and location data model
- [ ] Product database CRUD
- [ ] Basic navigation and screen structure
- [ ] Design system implementation (theme, components)

### Month 3-4: Core Scanning

- [ ] Camera integration and barcode scanning
- [ ] GPT-4o Vision API integration
- [ ] Product recognition pipeline
- [ ] Real-time camera overlay UI
- [ ] Scan session management
- [ ] Offline queue for scans

### Month 5-6: MVP Launch

- [ ] Stock level tracking and dashboard
- [ ] Low-stock alerts (push notifications)
- [ ] Basic reporting (stock summary, scan activity)
- [ ] Manual count entry
- [ ] Onboarding flow
- [ ] Beta testing with 20 local businesses
- [ ] App Store and Google Play submission
- [ ] MVP launch

### Month 7-9: Post-MVP Growth

- [ ] Purchase order generation
- [ ] Supplier directory
- [ ] Expiration date tracking
- [ ] Waste analytics
- [ ] POS integration (Square first)

### Month 10-12: Scale

- [ ] Multi-location support
- [ ] Toast and Clover POS integration
- [ ] Advanced reporting
- [ ] Team/staff access controls
- [ ] Web dashboard (Next.js)
- [ ] Performance optimization

### Year 2

- [ ] Predictive ordering ML model
- [ ] Shelf planogram compliance
- [ ] Vendor price comparison marketplace
- [ ] RFID/NFC support
- [ ] Enterprise features (SSO, audit logs, API access)
- [ ] SOC 2 compliance

---

## Edge Cases and Error Handling

| Scenario | Handling |
|----------|---------|
| Camera permission denied | Show clear instructions to enable in Settings, offer manual entry |
| No internet connection | Queue scans locally, sync when reconnected, show offline indicator |
| AI cannot identify product | Prompt user to name it, add to database, AI learns for next scan |
| Very large inventory (1000+ SKUs) | Paginated loading, category-based scanning sessions |
| Multiple staff scanning same location simultaneously | Real-time conflict resolution via Supabase Realtime |
| Product exists in database but different packaging | Fuzzy matching by name, prompt user to confirm or create variant |
| Scan image too dark/blurry | Real-time quality check, prompt to retake with flash on |
| API rate limit hit (GPT-4o) | Queue excess requests, process in order, show estimated wait time |
| Barcode not in any external database | Create product with barcode only, user fills in details |
| User scans competitor's inventory accidentally | Data isolation per organization, no cross-org data leakage |

---

*Features designed around one principle: make inventory counting as fast and effortless as taking a photo.*
