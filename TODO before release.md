# TODO Before Release

## Subdomains & Routing
- Re-enable middleware subdomain rules for portal-only access.
- Configure DNS + Vercel domains for `portal.<domain>`.
- Verify login and protected routes only work on portal subdomain.

## Notifications
- Buy and configure Semaphore SMS.
- Verify SMS sends on booking confirmation.
- Verify Resend email sending after domain is verified.
- Verify Resend email content is correct for client vs agent (approval emails).

## Booking Automation
- Confirm cron schedule + automation endpoint works in production.
- Verify booking status transitions (Confirmed → Ongoing → Pending Checkout).
- Confirm toast icons appear correctly on Resort Detail, Booking Details, and Booking Console pages.
