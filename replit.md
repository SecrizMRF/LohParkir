# LohParkir

## Overview

LohParkir is a QR code-based parking verification and management system for Indonesian Dinas Perhubungan (Dishub). Public users scan QR codes on officer badges to verify legitimacy, report illegal parking, and pay via QRIS. Dishub admins monitor a real-time dashboard, manage reports, and register parking officers.

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
- **UI**: React Native StyleSheet with Inter font family

## Architecture

### Database (lib/db)
- **Drizzle ORM** schema with 6 tables: `users`, `officers`, `reports`, `scans`, `payments`, `audit_trail`
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
- **public**: Scan QR codes, submit reports, make payments (no auth needed)
- **officer**: Carry QR badge only (no app interaction)
- **admin**: Manage officers, reports, view dashboard (JWT required)
- **superadmin**: Full access (JWT required)

## Screens (5 Tabs + Stack)
- **Scan Tab** (`(tabs)/index.tsx`): QR scanner with camera + manual input, demo QR codes
- **Peta Tab** (`(tabs)/peta-rawan.tsx`): Zona rawan pungli visualization with color-coded grid, legend, and danger levels
- **Laporan Tab** (`(tabs)/reports.tsx`): View reports, FAB to create new
- **Riwayat Tab** (`(tabs)/payments.tsx`): Payment history with points card (Poin Parkir) and summary stats
- **Admin Tab** (`(tabs)/admin.tsx`): Dashboard stats, login, officer/report management
- **Scan Result** (`scan-result.tsx`): Enhanced full-screen green (valid) / red (invalid) verification display with officer details
- **Payment** (`payment.tsx`): QRIS payment with plate number input, duration selection (1-5 hrs), enhanced Karcis Digital receipt, points earned
- **Rating** (`rating.tsx`): Officer rating (1-5 stars) for 3 criteria (Keramahan, Kebersihan, Keamanan) with +5 bonus points
- **Report Form** (`report-form.tsx`): Submit reports with photo & GPS
- **Report Detail** (`report-detail.tsx`): View report, admin status changes + notes
- **Officer Form** (`officer-form.tsx`): Register officers with NIP/badge validation
- **Officers List** (`officers-list.tsx`): View/manage officers, activate/deactivate
- **Reports Manage** (`reports-manage.tsx`): Filter reports by status (pending/in_progress/resolved/rejected)

## Points System
- Users earn points from payments: 1 point per Rp 1.000 spent
- Users earn +5 bonus points for rating officers
- Points persisted in AsyncStorage (`parkingPoints` key)
- 1000 points = parking discount (future feature)
- Displayed on Riwayat tab in golden card

## QR Code Format
- Badge: `DSH-YYYY-NNN` (e.g., DSH-2024-001)
- QR Code: `LOHPARKIR-DSH-YYYY-NNN` (e.g., LOHPARKIR-DSH-2024-001)
- Validated via regex: `/^LOHPARKIR-DSH-\d{4}-\d{3}$/`

## Seed Data
- 3 demo officers: Budi Santoso, Siti Rahayu, Ahmad Wijaya
- Admin login: `admin` / `admin123`
- Superadmin login: `superadmin` / `superadmin123`
- Seed endpoint: `POST /api/seed`

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
- `POST /api/qr/validate` — validate QR code, record scan
- `GET /api/reports` — list reports (filter by status/type)
- `POST /api/reports` — create report (public)
- `PUT /api/reports/:id/status` — update report status (admin)
- `GET /api/payments` — list payments
- `POST /api/payments` — create payment
- `GET /api/dashboard/stats` — dashboard statistics
- `GET /api/dashboard/recent-scans` — recent scan history
- `GET /api/dashboard/recent-reports` — recent reports

## Color Theme
- Primary: #0066CC (blue)
- Secondary: #0EA5E9 (teal)
- Background: #F0F4F8
- Success: #10B981 (green)
- Destructive: #EF4444 (red)
- Warning: #F59E0B (amber)
