# Resort Booking Platform

This is a full-stack web application for managing resorts, bookings, and guest communication. 

It provides a public booking experience, a dedicated owner/admin portal, and operational tools to handle the complete booking lifecycle—from inquiry to checkout and payment verification.

## Key Features
- Public resort browsing and booking inquiries
- Ticket pages for clients/agents with messaging and payment proof uploads
  - Short reference numbers (e.g., `RN-07`) for easy identification
  - Dedicated contact card with resort info, rules, and terms
  - Section sub-navigation for quick access
  - "View Form" button to see original booking details
- Booking console for owners (confirmed -> ongoing -> checkout workflow)
- Automated booking status transitions
- Admin console for accounts and resort management
- Notifications via email (Resend) and SMS (Semaphore)

## Tech Stack
- Next.js (App Router)
- Supabase (Database + Storage)
- Resend (Email API)
- Semaphore (SMS API)
- Namecheap (Domain)
- Vercel (Hosting)

## Getting Started (Local)
1. Install dependencies
```
npm install
```
2. Create `.env.local` with required keys (see below)
3. Run the dev server
```
npm run dev
```

## Environment Variables
Required:
```
NEXT_PUBLIC_SUPABASE_URL=from Supabase project settings -> API
NEXT_PUBLIC_SUPABASE_ANON_KEY=from Supabase project settings -> API
SUPABASE_SERVICE_ROLE_KEY=from Supabase project settings -> API (service_role)
SESSION_SECRET=any random string you create (e.g., local-dev-secret-123)
```

Notifications:
```
RESEND_API=code from resend
RESEND_FROM_EMAIL=defaultemail
ADMIN_CONTACT_EMAIL=admin@gmail.com
SEMAPHORE_API_KEY=code
SEMAPHORE_SENDER_NAME=defaultname
```

Portal routing:
```
PORTAL_HOST=portal.yourdomain.com
```

Automation (Supabase cron calls the endpoint below):
```
CRON_SECRET=any random string you create (used as Bearer token)
BOOKING_AUTOMATION_SECRET=optional fallback (can be same as CRON_SECRET)
```

## Portal Subdomain Routing
Admin/owner/edit routes are enforced in `src/middleware.js` to only allow access on the portal host.
- Public domain: guests browse, inquire, and access tickets
- Portal domain (`portal.domain.com`): login, admin, owner, edit

Local testing:
```
127.0.0.1 portal.localhost
```
Visit `http://portal.localhost:3000`.

## Notifications
- Email: `RESEND_API` + `RESEND_FROM_EMAIL` power inquiry approvals and account setup invites.
- Contact form: `ADMIN_CONTACT_EMAIL` receives messages from the homepage contact modal.
- SMS: `SEMAPHORE_API_KEY` sends caretaker notifications on booking confirmation.

## Automation Notes (Supabase Cron)
- Supabase cron should call: `https://yourdomain.com/api/internal/booking-status`.
- Add header: `Authorization: Bearer <CRON_SECRET>`.
- The Supabase `automation_settings` table is optional; the app does not read it unless you wire it in.

## Useful Docs
- App routes: `documentation/project-code-map/app-routes.md`
- Booking flows: `documentation/project-code-map/booking.md`
- Server modules: `documentation/project-code-map/server.md`
- Automation: `documentation/project-code-map/automation.md`
- Supabase schema: `documentation/project-code-map/supabase-sql.md`
- Release checklist: `documentation/TODO before release.md`

## Scripts
```
npm run dev
npm run build
npm run start
```

## Notes
For internal architecture and code references, use the docs above.
