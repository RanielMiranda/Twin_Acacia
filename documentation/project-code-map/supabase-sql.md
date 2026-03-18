# Supabase Schema / SQL

## `supabase/schema.sql`
- Canonical database schema used for local development and production.
- Contains tables and relationships for:
  - `bookings` (main booking table)
  - Payments / guest breakdown / issues
  - Support messaging (`ticket_messages`, `ticket_issues`)
  - Accounts / authentication / recovery
  - Archives and audit logs
  - Email delivery logging
  - Resort payment reference image metadata

If you need to understand data relationships (e.g., how bookings link to resorts or how ticket messages connect to bookings), start with this file.
