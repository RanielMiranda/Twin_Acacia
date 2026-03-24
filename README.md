# Agoda-Style Resort Booking Platform

This project is a Next.js (App Router) web app for managing resorts, bookings, and tickets. It includes a public guest experience, an admin/owner portal, and operational tooling for booking workflows.

## Key Features
- Public resort browsing and booking inquiries
- Booking console for owners (confirmed/ongoing/checkout workflow)
- Ticket pages for clients/agents with messaging and payment proof uploads
- Admin console for accounts and resort management
- Automated booking status transitions
- Notifications: email (Resend) + SMS (Semaphore)

## Tech Stack
- Next.js (App Router)
- Supabase (DB + storage)
- Resend (email)
- Semaphore (SMS)
- NameCheap (Domain)
- Vercel (Frontend)

## Getting Started (Local)
1. Install dependencies
2. Create `.env.local` with required keys (see below)
3. Run the dev server

## Environment Variables
Required for core functionality:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SESSION_SECRET=
```

Notifications:
```
RESEND_API=
RESEND_FROM_EMAIL=
SEMAPHORE_API_KEY=
SEMAPHORE_SENDER_NAME=
```

Portal routing:
```
PORTAL_HOST=portal.yourdomain.com
```

Automation:
```
CRON_SECRET=
BOOKING_AUTOMATION_SECRET=
```

## Portal Subdomain Routing
Admin/owner/edit routes are enforced in `src/middleware.js` to only allow access on the portal host.
- Public domain: guests browse, inquire, and access tickets
- Portal domain (`portal.domain.com`): login, admin, owner, edit

For local testing you can use:
```
127.0.0.1 portal.localhost
```
and visit `http://portal.localhost:3000`.

## Notifications
- **Email**: `RESEND_API` + `RESEND_FROM_EMAIL` power inquiry approval and account setup links.
- **SMS**: `SEMAPHORE_API_KEY` sends caretaker notifications on booking confirmation.

## Useful Docs
- App routes: `documentation/project-code-map/app-routes.md`
- Booking flows: `documentation/project-code-map/booking.md`
- Server modules: `documentation/project-code-map/server.md`
- Automation: `documentation/project-code-map/automation.md`
- Supabase schema: `documentation/project-code-map/supabase-sql.md`
- Release checklist: `documentation/TODO before release.md`

## Scripts
Use standard Next.js commands:
```
npm run dev
npm run build
npm run start
```

## Notes
- This README is high-level. For internal architecture and code references, use the docs above.
