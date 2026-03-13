# TODO Before Release

## Subdomains & Routing
- Re-enable middleware subdomain rules for portal-only access.
- Configure DNS + Vercel domains for `portal.<domain>`.
- Verify login and protected routes only work on portal subdomain.

## Notifications
- Buy and configure Semaphore SMS.
- Verify SMS sends on booking confirmation.
- Verify Resend email sending after domain is verified.

## Booking Automation
- Confirm cron schedule + automation endpoint works in production.
- Verify booking status transitions (Confirmed → Ongoing → Pending Checkout).
