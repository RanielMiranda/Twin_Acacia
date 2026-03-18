# App Routes (`src/app`)

This project uses Next.js App Router with folder-based routing. Below is the current high-level routing structure.

## `(main)` — Public facing
- `/` — Home page (search + resort results)
- `/resort/[name]` — Resort detail page (availability, rooms, contact owner inquiry)
- `/ticket/[bookingId]` — Ticket page (booking details + messaging)

## `auth`
- `/auth/login` — Login
- `/auth/setup-resort` — Resort setup (token-based onboarding)

## `admin`
- `/admin/dashboard` — Admin dashboard
- `/admin/accounts` — Account management
- `/admin/analytics` — Analytics

## `owner`
- `/owner/dashboard` — Owner dashboard (requires auth)

## `edit`
- `/edit/resort-builder` — Resort builder overview
- `/edit/resort-builder/[id]` — Resort builder for a resort
- `/edit/bookings/[id]` — Booking console for resort (owner)
- `/edit/bookings/[id]/booking-details/[bookingId]` — Booking detail editor
- `/edit/accounts/[id]` — Account editor

## `api`
### Auth
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `GET /api/auth/session` — Session check
- `POST /api/auth/forgot-password` — Starts recovery flow

### Accounts
- `/api/accounts` — list/create
- `/api/accounts/[id]` — update/delete
- `/api/accounts/setup` — account setup

### Recovery
- `/api/account-recovery` — create recovery request
- `/api/account-recovery/[id]` — verify/complete recovery

### Booking
- `/api/booking/approve-inquiry-email` — send inquiry approval email

### Internal
- `/api/internal/booking-status` — triggers booking status automation (cron-safe)
