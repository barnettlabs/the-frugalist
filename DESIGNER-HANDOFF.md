# TheFrugalist - Designer Handoff Document

## Product Overview

**Name:** TheFrugalist
**Tagline:** "Spend intentionally"
**Company:** JayTech LLC / Tensifi
**Website:** https://thefrugalist.io
**Company Site:** https://tensifi.com

**Description:** TheFrugalist helps consumers avoid overpaying by tracking price movement, explaining pricing tactics, and alerting them when buying actually makes sense. No hype, no pressure — just clarity. Founded on the principle that "pricing is designed to pressure you" with tactics like artificial urgency, hidden fees, and confusing terms.

---

## Platforms

| Platform | Tech | Location |
|----------|------|----------|
| Mobile (iOS + Android) | React Native / Expo | `app/` |
| Web (SPA) | Vue.js 3 | `web/` |
| Backend API | Laravel 12 (PHP) | `api/` |

---

## Technology Stack

### Backend (`api/`)
- **Framework:** Laravel 12 (PHP 8.2+)
- **Database:** MySQL
- **Auth:** Laravel Sanctum (token-based)
- **Testing:** PHPUnit
- **Code Style:** Laravel Pint
- **Queue/Jobs:** Laravel Queue (for price checks, notifications)

### Web Frontend (`web/`)
- **Framework:** Vue.js 3 (Composition API)
- **Language:** TypeScript
- **Build Tool:** Vite
- **Routing:** Vue Router
- **State Management:** Pinia
- **Styling:** Tailwind CSS (with custom design tokens via CSS variables)
- **HTTP Client:** Axios
- **Form Validation:** vee-validate + Zod
- **Testing:** Vitest
- **Font:** Rubik (Google Fonts)

### Mobile App (`app/`)
- **Framework:** React Native 0.79 + Expo SDK 53
- **Language:** TypeScript
- **Routing:** Expo Router (file-based)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **State Management:** Zustand
- **Server State:** React Query (TanStack Query) + React Query Kit
- **Form Validation:** React Hook Form + Zod
- **Animations:** React Native Reanimated
- **Bottom Sheets:** @gorhom/bottom-sheet
- **Icons:** Custom SVG components (25 icons)
- **Notifications:** Expo Notifications (local + push)
- **i18n:** Custom i18n setup with translation files
- **Package Manager:** pnpm
- **Testing:** Jest
- **Font:** Rubik (loaded via Expo)

---

## Core Features

### 1. WATCH — Price Tracking
Track product prices across retailers and get alerts when prices drop.

- Track products by SKU/UPC
- Supported retailers: Amazon, Best Buy, Target, Walmart, Home Depot, Lowe's
- Set target price thresholds
- Price history timeline
- Price drop percentage display
- Active/paused tracking toggle
- Push + email notifications on price drops
- "Target reached" status indicators
- Filter views: All, Active, Paused, Target Reached, Price Drops
- Manual refresh for on-demand price checks
- Error reporting for scraper failures

### 2. COMPUTE — Financial Calculators

#### Finance Calculator (Vehicle Loans)
- Full loan amortization with monthly breakdown
- Inputs: MSRP, fees, discounts, rebates, down payment, sales tax %, APR, term (24–84 months)
- Extra payment schedules
- Monthly payment, total interest, total cost calculations
- Dealership + vehicle info capture
- Shareable estimates via unique key

#### Lease Calculator (Vehicle Leases)
- Money factor to APR conversion
- Residual value calculations
- Capitalized cost breakdown (gross vs net)
- Inputs: MSRP, money factor, residual %, fees (acquisition, doc, disposition), dealer contribution, trade-in, down payment, tax %
- Monthly payment breakdown (principal + interest + tax)
- Cash due at signing
- Shareable estimates

#### Both Calculators
- Full CRUD (create, edit, delete)
- Compare multiple estimates side-by-side (future feature)
- Contact and notes fields

### 3. GUIDES — Educational Content

#### Financing Terms (10 terms)
MSRP, APR, Down Payment, Trade-in, Rebates, Loan Term, Principal, Amortization, Total Interest, Doc Fee

#### Leasing Terms (10 terms)
Money Factor, Residual Value, Cap Cost, Cap Cost Reduction, Acquisition Fee, Disposition Fee, Mileage Allowance, Lease Cash/Incentives, Due at Signing, Buyout Price

#### Pro Tips
8 financing tips + 8 leasing tips with expandable cards

### 4. Dashboard / Home
- Personalized greeting (time-of-day aware)
- User avatar (image or initials)
- Stats HUD: Watching count, Finance count, Lease count
- Price alerts section (top 3 products with drops)
- Recent activity feed (last 5 items, chronological)
- Pull-to-refresh

### 5. Tools Hub
Grid of tool cards with:
- Watch — "Track product prices"
- Finance — "Calculate loan payments"
- Lease — "Calculate lease payments"
- Guides — "Learn the terminology"
- Live count badges, animated entrance

### 6. Profile & Settings
- Edit name, email, avatar
- Theme toggle: Light / Dark / System
- App info (name, version)
- Share app, Rate app, Contact support
- Links to web app, company site, privacy policy, terms
- Account deletion with confirmation
- Sign out
- Developer debug mode (test notifications, reset onboarding)

### 7. Onboarding (4 slides)
1. Welcome — "Your personal finance companion for smarter car buying and deal hunting"
2. Calculators — Finance and lease payment tools
3. Price Tracker — SKU/UPC tracking across retailers
4. Notifications — Enable push alerts

### 8. Auth Flow
- Login (email/password)
- Register (first name, last name, email, password)
- Email verification
- Forgot password / Reset password

---

## Color Palette

### Primary / Accent
| Token | Light | Dark |
|-------|-------|------|
| Accent (Primary Blue) | `#235892` | `#5A7DAB` |
| Accent Dark | `#1A4675` | — |
| Accent Muted | `#A3B5CC` | — |

### Secondary
| Token | Light | Dark |
|-------|-------|------|
| Secondary (Teal) | `#0D9488` | `#2DD4BF` |
| Secondary Dark | `#0F766E` | — |

### Semantic
| Token | Default | Usage |
|-------|---------|-------|
| Success | `#4A7C59` | Positive states, lease color |
| Warning | `#B8860B` | Caution states |
| Danger | `#9B3D3D` | Errors, destructive actions |
| Info | `#4A6FA5` | Finance color, informational |

### Neutrals (Apple-inspired)

**Charcoal Scale** (dark mode surfaces):
| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 850 | 900 | 950 |
|----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| `#F2F2F7` | `#E5E5EA` | `#D1D1D6` | `#C7C7CC` | `#8E8E93` | `#636366` | `#48484A` | `#3A3A3C` | `#2C2C2E` | `#1C1C1E` | `#1C1C1E` | `#000000` |

**Slate Scale** (backgrounds):
| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| `#F8FAFC` | `#F1F5F9` | `#E2E8F0` | `#CBD5E1` | `#94A3B8` | `#64748B` | `#475569` | `#334155` | `#1E293B` | `#0F172A` | `#020617` |

### Theme Colors

| Element | Light | Dark |
|---------|-------|------|
| Page Background | `#F2F2F7` | `#000000` |
| Card/Surface | `#FFFFFF` | `#1C1C1E` |
| Border | `#E5E5EA` | `#38383A` |
| Primary Text | `#000000` | `#FFFFFF` |
| Muted Text | `#8E8E93` | `#8E8E93` |
| Input Background | `#F2F2F7` | `#2C2C2E` |
| Tab Bar BG | `#FFFFFF` | `#1C1C1E` |
| Tab Active | `#235892` | `#5A7DAB` |
| Tab Inactive | `#8E8E93` | `#8E8E93` |

---

## Typography

### Font Family
**Rubik** — all weights

| Weight | Name | Usage |
|--------|------|-------|
| 400 | Rubik Regular | Body text |
| 500 | Rubik Medium | Labels, captions, logo text |
| 600 | Rubik SemiBold | Headings, buttons, emphasis |
| 700 | Rubik Bold | Display numbers, hero text |

### Type Scale
| Role | Size | Weight | Example Usage |
|------|------|--------|---------------|
| Display | 28px+ (text-3xl) | Bold | Hero numbers, stat counts |
| Heading | 20–24px (text-xl/2xl) | SemiBold | Section titles |
| Body | 16px (text-base) | Regular | Default text |
| Caption | 12–14px (text-xs/sm) | Medium | Labels, metadata |

### Letter Spacing
| Token | Value | Usage |
|-------|-------|-------|
| tighter | -0.05em | — |
| tight | -0.025em | Logo text |
| normal | 0 | Body |
| wide | 0.025em | — |
| button | 0.06em | Button labels |
| widest | 0.1em | — |

---

## Component Library

### Buttons

| Variant | Background | Text | Active State |
|---------|------------|------|-------------|
| Default (Primary) | `#235892` | White | `#1A4675` |
| Secondary | `#0D9488` | White | `#0F766E` |
| Outline | Transparent, 1px border | Accent color | 10% accent bg |
| Destructive | `#7C3131` | White | `#642828` |
| Ghost | Transparent | Charcoal-700/200 | Charcoal-100/800 |
| Glass | `white/10`, border `white/20`, blur | White | `white/20` |
| Link | None | Accent | Underline |

**Sizes:** Default (44px h), Large (52px h), Small (36px h), Icon (40px)
**States:** Loading (spinner replaces label), Disabled (charcoal-200 bg, charcoal-400 text)
**Full width by default**, font-semibold, tracking-wide

### Inputs
- Border: 1px charcoal-200 (light) / charcoal-600 (dark)
- Background: white / charcoal-800
- Padding: 16px horizontal, 14px vertical
- Border radius: 5px (md)
- Focus: accent blue border
- Error: danger-500 border + danger label
- Placeholder: `#8E8E93`

### Cards
- **Standard:** `rounded-xl`, 1px border, white/charcoal-850 bg
- **Elevated:** Same + `shadow-card` (0 1px 3px rgba(0,0,0,0.06))
- **Tool Card:** 16px radius, 16px padding, custom shadow (0 2px 8px 8% opacity)
- Internal padding: 16px

### Modals / Bottom Sheets
- Built on `@gorhom/bottom-sheet`
- Default snap: 60%
- Handle: 12px height bar, gray
- Backdrop: `rgba(0, 0, 0, 0.4)` with fade
- Optional header with title + close (X) button

### Segment Tabs
**iOS:** Rounded container (10px radius), animated white indicator, 3px padding
**Android:** Material underline, 3px accent bar

### Select / Dropdown
- Opens as bottom sheet modal
- Options with optional icon/image (40px container)
- Selected state: accent bg at 10% + checkmark

### Checkbox / Radio / Switch
- **Checkbox:** 20px, 2px border, accent when checked, white checkmark
- **Radio:** 20px circle, 10px inner dot
- **Switch:** 50×28px track, 22px thumb, accent track when on

### Logo
- **Text:** "thefrugalist" (lowercase), Rubik Medium, tracking-tight
- **Image:** Blue variant (light mode), White variant (dark mode)
- **Sizes:** sm (24px), md (32px), lg (40px), xl (48px), 2xl (64px)
- **Logo files:** `logo-blue.png`, `logo-white.png`

### Icons
25 custom SVG icons, default 24px, configurable color:
arrow-right, bell, book, bug, calculator, car, caret-down, chevron, dashboard, eye, feed, github, home, language, logout, plus, rate, settings, share, style, support, tag, user, website

---

## Layout & Spacing

### Spacing Scale (Tailwind 4px base)
Standard 0–12 + custom: 4.5 (18px), 5.5 (22px), 13 (52px), 15 (60px), 18 (72px), 22 (88px)

### Border Radius Scale
| Token | Value |
|-------|-------|
| sm | 3px |
| DEFAULT | 5px |
| md | 6px |
| lg | 8px |
| xl | 10px |
| 2xl | 12px |
| 3xl | 16px |
| full | 9999px |

### Shadows
| Token | Value | Usage |
|-------|-------|-------|
| card | 0 1px 3px rgba(0,0,0,0.06) | Standard cards |
| card-hover | 0 4px 12px rgba(0,0,0,0.08) | Elevated/hovered cards |
| sm | 0 1px 2px rgba(0,0,0,0.05) | Subtle elevation |
| md | 0 4px 6px rgba(0,0,0,0.1) | Medium |
| lg | 0 10px 15px rgba(0,0,0,0.1) | Prominent |
| xl | 0 20px 25px rgba(0,0,0,0.1) | Overlay |
| FAB | offset(0,4) opacity 0.35, radius 8 | Floating action button |

---

## Background Patterns

### Dotted Background
SVG-based repeating dot pattern, used on most screens via `ScreenContainer`.

| Property | Light | Dark |
|----------|-------|------|
| Grid size | 24×24px | 24×24px |
| Dot radius | 0.8px | 0.8px |
| Dot color | `rgba(35, 88, 146, 0.12)` | `rgba(90, 125, 171, 0.18)` |
| Base bg | Off-white (`#F2F2F7`) | Black (`#000000`) |

**Web variant:** CSS `radial-gradient`, 20–24px spacing, fixed attachment

---

## Dark Mode

- **Strategy:** Class-based (`dark:` prefix in Tailwind)
- **Options:** Light, Dark, System (follows device)
- **Key swaps:**
  - Backgrounds: off-white → pure black
  - Surfaces: white → charcoal-850 (`#1C1C1E`)
  - Borders: neutral-200 → charcoal-700 (`#3A3A3C`)
  - Text: black → white
  - Accent: slightly brighter (`#5A7DAB` vs `#235892`)
  - Dot pattern: more visible on dark bg

---

## Animation

| Element | Duration | Easing |
|---------|----------|--------|
| Toggle (checkbox/radio) | 50–100ms | Linear |
| Switch | Smooth | Spring (clamped) |
| Progress bar | 250ms | Quad |
| Modal backdrop | 50ms in / 20ms out | Fade |
| Card entrance | 500ms | Spring, staggered delay |
| Tab indicator | Standard | Layout animation |

---

## Navigation Structure

### Mobile Tab Bar (3 tabs)
1. **Home** — Dashboard with stats + alerts
2. **Tools** — Tool cards grid (Watch, Finance, Lease, Guides)
3. **Account** — Settings, profile, theme, support

### Full-Screen Stacks (no tab bar)
- `/compute/finance/*` — Finance calculator flow
- `/compute/lease/*` — Lease calculator flow
- `/watch/*` — Price tracker flow
- `/learning/*` — Educational content
- `/profile` — Full profile editor

### Back Navigation
- Custom back button with contextual label
- `?from=` query param drives label text (e.g., "Home", "Tools", "Finance")
- `router.back()` for all back navigation

---

## Screen Inventory

| Screen | Route | Description |
|--------|-------|-------------|
| Onboarding (4 slides) | `/onboarding` | Welcome, calculators, tracker, notifications |
| Login | `/(auth)/login` | Email + password |
| Register | `/(auth)/register` | Name, email, password |
| Verify Email | `/(auth)/verify-email` | Email verification |
| Forgot Password | `/(auth)/forgot-password` | Password reset |
| Dashboard | `/(tabs)/` | Stats, alerts, activity |
| Tools | `/(tabs)/tools` | Tool cards grid |
| Settings | `/(tabs)/settings` | Theme, profile, support, links |
| Profile Editor | `/profile` | Edit name, email, avatar |
| Finance List | `/compute/finance` | All finance estimates |
| Finance Create | `/compute/finance/create` | New estimate form |
| Finance Detail | `/compute/finance/[id]` | Calculations + amortization |
| Lease List | `/compute/lease` | All lease estimates |
| Lease Create | `/compute/lease/create` | New estimate form |
| Lease Detail | `/compute/lease/[id]` | Calculations + schedule |
| Watch List | `/watch` | Tracked products + filters |
| Watch Create | `/watch/create` | Add product by SKU/UPC |
| Watch Detail | `/watch/[id]` | Price history + alerts |
| Learn Financing | `/learning/financing` | Terms + tips |
| Learn Leasing | `/learning/leasing` | Terms + tips |

---

## Legal Pages
- Privacy Policy
- Terms of Service
- Disclaimers

---

## Data Models Summary

| Model | Key Fields |
|-------|-----------|
| User | first_name, last_name, email, avatar_url, phone |
| VehicleFinanceSheet | msrp, fees, discounts, rebates, down_payment, sales_tax, interest_rate, finance_term, extra_payments, shareable_key |
| VehicleLeaseSheet | msrp, money_factor, residual_percent, down_payment, acquisition_fee, doc_fee, disposition_fee, trade_in_value, dealer_contribution, shareable_key |
| TrackedProduct | name, sku, retailer, current_price, retail_price, target_price, image_url, active, price_history[], price_alerts[], price_drop_percent |
| Retailer | name, slug, logo_url, active |
| PriceHistory | price, checked_at |
| PriceAlert | type, old_price, new_price |
| Announcement | System-wide notifications |
| UserDevice | Push notification tokens |
