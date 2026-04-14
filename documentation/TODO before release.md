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

## Update Contacts Footer & TopBar 
- Update contact modal to contact admin email
- update the contact info
- update the follow us 
