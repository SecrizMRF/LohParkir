# ParkirCerdas (LohParkir)

## Overview

ParkirCerdas is a QR code-based parking verification and management system for Indonesian Dinas Perhubungan (Dishub Kota Medan). Public users scan QR codes on officer badges to verify legitimacy, report illegal parking, and pay via QRIS. Dishub admins monitor a real-time dashboard, manage reports, and register parking officers.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Mobile framework**: Expo (React Native) with expo-router
- **API framework**: Express 5
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: JWT (8h expiry) with role-based middleware
- **State management**: React Context + API client + AsyncStorage offline cache
- **UI**: React Native StyleSheet with Atkinson Hyperlegible font family
- **Font**: `AtkinsonHyperlegible_400Regular` and `AtkinsonHyperlegible_700Bold` from `@expo-google-fonts/atkinson-hyperlegible`

## Architecture

### Database (lib/db)
- **Drizzle ORM** schema with 7 tables: `users`, `officers`, `officer_qr_codes`, `reports`, `scans`, `payments`, `audit_trail`
- `officer_qr_codes` holds 1 row per (officer × vehicle type) — each officer has its own motor + mobil QR code with preset rate
- Schema at `lib/db/src/schema/index.ts`
- Push with `pnpm --filter @workspace/db run push`

### API Server (artifacts/api-server)
- Express 5 REST API mounted at `/api`
- Routes: auth, officers (CRUD), QR validation, reports, payments, dashboard stats, seed
- JWT auth middleware with role-based access (`admin`, `superadmin`)
- Runs on port 8080

### Mobile App (artifacts/mobile)
- Expo React Native with expo-router tabs
- API client at `lib/api.ts` with offline fallback via AsyncStorage
- Context at `contexts/AppContext.tsx` for global state

## User Roles
- **public** (User): Scan QR codes, submit reports, make payments (no auth needed)
- **officer** (Juru Parkir): Logs in with badge number + password (badge is lowercased to use as username), sees vehicle picker (Motor/Mobil) → displays the matching QR code on screen for users to scan. Each officer has 2 QR codes auto-generated, one per vehicle type, with preset tariff
- **admin** (Dishub): Manage officers, reports, view dashboard (JWT required)
- **superadmin**: Full access (JWT required)

## Vehicle Types & Tariffs
- **Motor / Roda 2**: Rp 3.000 (QR suffix `-MOTOR`)
- **Mobil / Roda 4**: Rp 5.000 (QR suffix `-MOBIL`)
- Defined in `lib/db/src/schema/officer_qr_codes.ts` as `VEHICLE_TYPES`

## Design System (ParkirCerdas Spec)

### Colors
- Primary Blue: `#1565C0`
- Valid Green: `#1B5E20` (solid full-screen backgrounds)
- Invalid Red: `#B71C1C` (solid full-screen backgrounds)
- Yellow/Warning: `#FBC02D`
- Background: `#F5F5F5`
- Text Primary: `#424242`
- Text Muted: `#757575`

### Typography
- Font: Atkinson Hyperlegible (accessibility-first)
- Bold: `AtkinsonHyperlegible_700Bold`
- Regular: `AtkinsonHyperlegible_400Regular`
- No Inter font — fully migrated

### Accessibility
- Minimum button height: 56dp
- Button border radius: 12
- Full-width primary buttons
- High contrast text on colored backgrounds

## Screens (5 Tabs + Stack)

### Tab Screens
- **Scan Tab** (`(tabs)/index.tsx`): Three buttons — "SCAN QR JUKIR" (blue filled), "LAPORKAN PUNGLI" (red outlined), "Input QR Manual" (all platforms)
- **Laporan Tab** (`(tabs)/reports.tsx`): View reports list, FAB to create new
- **Riwayat Tab** (`(tabs)/payments.tsx`): Card-based payment history with vehicle icons (car/motorbike), plate numbers, amounts, success badges
- **Poin Tab** (`(tabs)/peta-rawan.tsx`): Points display (48pt yellow), progress bar, rewards redemption (Gratis Parkir 1x, Diskon 10%)
- **Admin Tab** (`(tabs)/admin.tsx`): Dashboard stats, login, officer/report management

### Officer Dashboard
- **Officer Dashboard** (`officer-dashboard.tsx`): Officer-only screen. Shows vehicle picker (Motor/Mobil cards); tapping a card displays a large QR code (via `react-native-qrcode-svg`) with the matching tariff for the user to scan
- Officer login from Admin tab automatically redirects here

### Stack Screens
- **Scan Result** (`scan-result.tsx`): Valid — white card with officer photo, name, ID badge, zona/lokasi/tarif details, "BAYAR PARKIR" button expanding to QRIS/Tunai options. Invalid — full red screen with alert.
- **Payment** (`payment.tsx`): Method-based flow — QRIS: QR code display → "SUDAH SCAN & BAYAR" → waiting/auto-detect (5s countdown) → success. Cash: amount card + warning → "SUDAH BAYAR TUNAI" → success. Success: green screen with receipt + points.
- **Karcis Digital** (`karcis.tsx`): Digital parking receipt shown after payment
- **Rating** (`rating.tsx`): 4 emoji choices (Buruk/Biasa/Baik/Sangat Baik), auto-navigates home 1.5s after selection, +5 bonus points
- **Report Form** (`report-form.tsx`): Submit reports with photo & GPS
- **Report Detail** (`report-detail.tsx`): View report, admin status changes + notes
- **Officer Form** (`officer-form.tsx`): Register officers (badge auto-generated, login uses badge as username)
- **Officers List** (`officers-list.tsx`): View/manage officers, activate/deactivate
- **Reports Manage** (`reports-manage.tsx`): Filter reports by status

## Points System
- Users earn points from payments: 1 point per Rp 1.000 spent
- Users earn +5 bonus points for rating officers
- Points persisted in AsyncStorage (`parkingPoints` key)
- Rewards: 25 points = Gratis Parkir 1x, 100 points = Diskon Langganan Bulanan 10%
- Displayed on Poin tab with progress bar

## QR Code Format
- Badge: `DSH-YYYY-NNN` (e.g., DSH-2024-001)
- New per-vehicle QR: `LOHPARKIR-DSH-YYYY-NNN-MOTOR` or `-MOBIL` (preferred, has tariff preset)
- Legacy badge QR: `LOHPARKIR-DSH-YYYY-NNN` (still validated for backward compat, no vehicle type)
- New regex: `/^LOHPARKIR-DSH-\d{4}-\d{3}-(MOTOR|MOBIL)$/`

## Seed Data
- 3 demo officers: Budi Santoso, Siti Rahayu, Ahmad Wijaya — each with 2 QR codes (motor + mobil)
- Admin login: `admin` / `admin123`
- Superadmin login: `superadmin` / `superadmin123`
- Officer logins (NIP / password): `198501012010011001` / `petugas001`, `199002152012012002` / `petugas002`, `198807202015011003` / `petugas003`
- Seed endpoint: `POST /api/seed` (idempotent — re-runs safely)

## Cross-Platform Utilities (`lib/platform.ts`)
- `showAlert(title, message, buttons?)` — cross-platform alert (Alert.alert on native, window.confirm/alert on web)
- `hapticImpact(style?)` — safe haptic feedback with try/catch (no crash on unsupported devices)
- `hapticNotification(type?)` — safe notification haptic with try/catch
- All screens use `StatusBar` component for native status bar color management
- Shadows use `Platform.select` (iOS: shadow*, Android: elevation)

## Key Commands
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes
- `pnpm --filter @workspace/api-server run dev` — run API server
- `pnpm --filter @workspace/mobile run dev` — run Expo mobile app

## API Endpoints
- `POST /api/auth/login` — JWT login
- `GET /api/officers` — list all officers
- `POST /api/officers` — create officer (admin)
- `PUT /api/officers/:id` — update officer (admin)
- `DELETE /api/officers/:id` — delete officer (admin)
- `POST /api/qr/validate` — validate QR code, record scan; returns `vehicleType`, `vehicleLabel`, `rate` for new-format QRs
- `GET /api/qr/my-codes` — officer fetches their own QR codes (officer JWT required)
- `GET /api/reports` — list reports (filter by status/type)
- `POST /api/reports` — create report (public)
- `PUT /api/reports/:id/status` — update report status (admin)
- `GET /api/payments` — list payments
- `POST /api/payments` — create payment
- `GET /api/dashboard/stats` — dashboard statistics
- `GET /api/dashboard/recent-scans` — recent scan history
- `GET /api/dashboard/recent-reports` — recent reports
