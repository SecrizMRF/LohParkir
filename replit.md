# LohParkir

## Overview

LohParkir is a parking verification and management mobile application built with Expo (React Native). It helps verify official parking officers, report illegal parking, and manage parking operations for Dishub (Transportation Agency).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Mobile framework**: Expo (React Native)
- **API framework**: Express 5
- **State management**: React Context + AsyncStorage
- **UI**: React Native StyleSheet with Inter font

## App Structure

### User Roles
- **Public (Drivers)**: Scan QR codes, report illegal parking, make digital payments
- **Admin (Dishub)**: Dashboard, manage reports, create officer accounts
- **Officers**: Carry QR badge only (no app interaction)

### Screens
- **Scan Tab**: QR code verification with demo codes
- **Reports Tab**: View submitted reports with FAB to create new ones
- **Admin Tab**: Dashboard with stats, role toggle, officer/report management
- **Scan Result**: Shows valid/invalid QR verification results
- **Report Form**: Submit illegal parking or fake QR reports with photo & GPS
- **Payment**: Digital QRIS payment flow with receipt
- **Officer Form**: Register new parking officers (admin)
- **Officers List**: View/manage registered officers (admin)
- **Reports Manage**: Filter and manage reports by status (admin)

### Data Models
- Officers: id, name, badgeNumber, qrCode, area, location, rate, status
- Reports: id, ticketNumber, type, photoUri, GPS coords, description, status
- ScanHistory: id, qrCode, officerName, location, isValid, scannedAt
- Payments: id, officerId, officerName, amount, status

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Color Theme
- Primary: #0066CC (blue)
- Secondary: #0EA5E9 (teal)
- Background: #F0F4F8
- Success: #10B981 (green)
- Destructive: #EF4444 (red)
- Warning: #F59E0B (amber)
