# TheFrugalist Brand Implementation Notes

## Brand Summary
- **Name:** TheFrugalist
- **Tagline:** "Spend intentionally."
- **Domain:** thefrugalist.*
- **Company:** JayTech LLC

## Color System

### Chosen Accent Color
**Teal (#14B8A6)** - Vibrant and engaging while maintaining professionalism

### Full Palette
| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| Primary | #1F1F1F | #F8FAFC | Text, headings |
| Accent | #14B8A6 | #2DD4BF | Links, active states, highlights |
| Accent Light | #5EEAD4 | #5EEAD4 | Hover states |
| Accent Dark | #0D9488 | #14B8A6 | Active/pressed states |
| Background | #F8FAFC | #1E293B | Page background |
| Surface | #FFFFFF | #334155 | Cards, modals |
| Border | #E2E8F0 | #475569 | Dividers, outlines |
| Text Muted | #64748B | #94A3B8 | Secondary text |

### Semantic Colors (Muted)
| Color | Value | Usage |
|-------|-------|-------|
| Success | #4A7C59 | Positive states, confirmations |
| Warning | #B8860B | Cautions, alerts |
| Danger | #9B3D3D | Errors, destructive actions |
| Info | #4A6FA5 | Informational states |

## Typography

### Font Family
**Rubik** - Kept from existing system as specified in brand requirements

### Usage
- Headings: Rubik Medium (500)
- Body: Rubik Regular (400)
- Labels: Rubik Regular with subtle letter-spacing

## Navigation Structure

### Web App
```
├── Dashboard
├── Watch (formerly "Price Tracker")
├── Compute (formerly "Finance Calculator" / "Lease Calculator")
├── Guides (formerly "Learning")
├── Review (coming soon placeholder)
└── Settings / Account
```

### Mobile App
```
Tab Bar:
├── Home (Dashboard)
├── Watch (Price Tracker)
├── Compute (Finance tools)
└── Account (Settings)
```

## Files Modified

### Design Tokens
- `web/src/assets/css/app.css` - CSS variables
- `web/tailwind.config.js` - Tailwind color extension
- `app/src/components/ui/colors.js` - React Native color palette
- `app/tailwind.config.js` - Nativewind config

### Logo Components
- `web/src/components/ApplicationLogo.vue` - Text-based wordmark
- `app/src/components/ui/logo.tsx` - React Native text logo

### Layouts
- `web/src/layouts/AuthenticatedLayout.vue` - Main app navigation
- `web/src/layouts/GuestLayout.vue` - Public pages layout
- `app/src/app/(app)/(tabs)/_layout.tsx` - Mobile tab bar

### Pages
- `web/src/pages/Welcome.vue` - Landing page with hero
- `web/src/pages/Review.vue` - Coming soon placeholder
- `web/src/pages/Privacy.vue` - Privacy policy

### Routing
- `web/src/router/index.ts` - Added Review route, updated breadcrumbs

### Translations
- `app/src/translations/en.json` - English copy
- `app/src/translations/ar.json` - Arabic copy

### Icons
- `app/src/components/ui/icons/eye.tsx` - Eye icon for Watch tab
- `app/src/components/ui/icons/index.tsx` - Updated exports

## Copy Locations

### Marketing Copy
- `web/src/pages/Welcome.vue` - Hero headline, subhead, value props
- `web/src/layouts/GuestLayout.vue` - Footer description

### UI Labels
- Navigation items defined in layout files
- Breadcrumbs defined in `web/src/router/index.ts`
- Mobile translations in `app/src/translations/*.json`

## Removed/Changed

### Removed
- "The Frugalist" branding
- Fox logo references
- Neon glow effects (`neon-glow`)
- Old blue/amber color scheme

### Kept/Updated
- Dotted background patterns (`.dotted-background-light`, `.dotted-background-dark`)
- Subtle gradients (`bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800`)
- Glass effect (`.glass`)
- Teal accent color for visual appeal

### Changed
- "Price Tracker" → "Watch"
- "Finance/Lease Calculator" → "Compute"
- "Learning" → "Guides"
- Reduced mobile tabs from 5 to 4 (combined finance/lease)

## Blockers / Future Work

### Logo Assets
Currently using text-based "thefrugalist" wordmark. Final logo assets (SVG/PNG) should be placed in:
- `web/public/logos/`
- `app/src/assets/images/`

### Mobile App Metadata
Update app name in:
- `app/app.json` - Expo config
- `app/package.json` - Package name

### Remaining Pages to Review
These pages exist but may need copy/styling updates:
- Dashboard (`web/src/pages/Dashboard.vue`, `app/src/app/(app)/(tabs)/index.tsx`)
- Price tracker screens (`web/src/pages/price-tracker/*.vue`)
- Estimate screens (`web/src/pages/estimates/**/*.vue`)
- Learning screens (`web/src/pages/learning/*.vue`)
- Profile/Settings screens
- Auth screens (login, register, etc.)

## Dark Mode
Dark mode is enabled and uses a muted charcoal palette. Toggle via:
- CSS class `.dark` or `[data-theme="dark"]`
- System preference detection
- Mobile: MMKV storage with `useSelectedTheme()` hook
