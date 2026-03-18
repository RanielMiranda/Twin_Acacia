# Server Automation / Cron

## Booking status automation
- `src/lib/server/bookingStatusAutomation.js` contains the rules for automatically moving bookings into **Pending Checkout** when they are overdue.

## Internal API endpoint
- `src/app/api/internal/booking-status/route.js` exposes a cron-safe endpoint that runs the automation.
- The endpoint requires `CRON_SECRET` / `BOOKING_AUTOMATION_SECRET` (configured via `vercel.json`).

## Cron schedule
- `vercel.json` includes a scheduled trigger for `/api/internal/booking-status` (runs daily).
