# TODO Before Release

## Subdomains & Routing
- Middleware subdomain rules enforced in `src/middleware.js` (portal-only access).
- Configure DNS + Vercel domains for `portal.<domain>`.
- Set `PORTAL_HOST` (e.g., `portal.domain.com`) in production env.
- Verify `/auth/login`, `/admin`, `/owner`, `/edit` only work on portal subdomain.

## Notifications
- Buy and configure Semaphore SMS (`SEMAPHORE_API_KEY`).
- Verify SMS sends on booking confirmation (caretaker notice, no ticket link).
- Verify Resend email sending after domain is verified (`RESEND_API`, `RESEND_FROM_EMAIL`).
- Verify Resend email content for: inquiry approval + account setup invites.

## Booking Automation
- Configure Supabase cron to call `/api/internal/booking-status` with Authorization header.
- Confirm cron schedule + automation endpoint works in production.
- Verify booking status transitions (Confirmed → Ongoing → Pending Checkout).
- Confirm toast icons appear correctly on Resort Detail, Booking Details, and Booking Console pages.

## Update Contacts Footer & TopBar 
- Update contact modal to contact admin email
- update the contact info
- update the follow us 
