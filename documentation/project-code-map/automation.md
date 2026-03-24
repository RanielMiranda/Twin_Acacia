# Server Automation / Cron

## Booking status automation
- `src/lib/server/bookingStatusAutomation.js` contains the rules for automatically moving bookings into **Pending Checkout** when they are overdue.

## Internal API endpoint
- `src/app/api/internal/booking-status/route.js` exposes a cron-safe endpoint that runs the automation.
  - Requires `Authorization: Bearer <CRON_SECRET>` (or `BOOKING_AUTOMATION_SECRET`).

## Cron schedule
- Use Supabase cron to call `/api/internal/booking-status` on your desired schedule.
