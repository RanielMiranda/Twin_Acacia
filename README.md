# Resort Booking Platform

This is a full-stack web application for managing resorts, bookings, and guest communication. 
It provides a public booking experience, a dedicated owner/admin portal, and operational tools to handle the complete booking lifecycle—from inquiry to checkout and payment verification.

## Key Features

### Guest Experience
- Public resort browsing and booking inquiries
- Ticket pages for clients/agents with messaging and payment proof uploads

### Booking Management
- Booking console for owners (confirmed → ongoing → checkout workflow)
- Automated booking status transitions

### Admin & Operations
- Admin console for accounts and resort management

### Notifications
- Email (Resend) for approvals and account setup
- SMS (Semaphore) for operational alerts

## Tech Stack
- Next.js (App Router)
- Supabase (Database + Storage)
- Resend (Email API)
- Semaphore (SMS API)
- Namecheap (Domain)
- Vercel (Hosting & Deployment)

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
