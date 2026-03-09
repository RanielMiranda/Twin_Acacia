# Project Code Map

Quick reference for where key logic lives.

## Contexts (`src/components/useclient`)

- `ContextFilter.jsx`
  - Re-exports from `ResortDataClient`.
  - Use `useFilters()` for search/filter state shared by home + resort detail:
    - guests, dates, times, selected tags, price range
    - `filteredResorts`
    - `availabilityByResort` (viability + available rooms metadata)

- `ResortDataClient.jsx`
  - Main filter/search data source for public pages.
  - Fetches resort list/details from Supabase.
  - Builds sorted `filteredResorts`.
  - Computes availability ranking for home results (viable first, low match later).

- `ContextEditor.jsx`
  - Re-exports from `ResortEditorClient`.
  - Use `useResort()` for edit/detail resort state.

- `ResortEditorClient.jsx`
  - Resort editor data flow (load/save/update/delete resort).
  - Handles image upload + scoped draft caching for resort builder.

- `BookingsClient.jsx`
  - Booking CRUD and booking cache for owner edit pages.
  - `refreshBookings()` includes automatic status transitions:
    - overdue unpaid pending payment -> `Cancelled`
    - overdue confirmed checkout time -> `Pending Checkout`

- `SupportClient.jsx`
  - Ticket issue/message loading + status update for booking support panels.

## Shared Utilities (`src/lib`)

- `bookingDateTime.js`
  - Shared date/time helpers:
    - `toDateTimeMs(...)`
    - `overlapsByDateTime(...)`
    - `formatWeekdayLabel(...)`
    - `formatTotalStayDays(...)`
    - `isCheckoutOverdueRow(...)`

- `availability.js`
  - Availability helpers used by home + resort detail:
    - `buildRequestedRange(...)`
    - `getUnavailableRoomIds(...)`
    - status filtering for blocking bookings
    - room id normalization

- `utils.js`
  - General helpers (mostly image/storage):
    - Supabase storage path extraction
    - image transform/srcSet helpers
    - bucket constants
    - `convertImageFileToWebp()` (shared WebP conversion)
    - `getResortStoragePath()` (e.g. resortname/payment)

- `resortPaymentImage.js`
  - Shared upload/delete for resort payment reference image (e.g. GCash QR).
  - `uploadResortPaymentImage(supabase, file, resortName)` → converts to WebP, uploads to `[resortname]/payment` in bucket, returns public URL.
  - `deleteResortPaymentImage(supabase, imageUrl)` → removes object from storage when image is removed/replaced.

- `bookingFlow.js`
  - Booking confirmation stub generator.

- `ticketAccess.js`
  - Token generation/expiry checks for ticket access links.

- `caretakerNotifications.js`
  - Notification write helper used after payment approval.
  - Current hook point for future caretaker email/SMS delivery.

- `server/bookingStatusAutomation.js`
  - Server-only status automation runner.
  - Auto-moves overdue confirmed/ongoing bookings to `Pending Checkout`.

- `idempotency.js`
  - Simple idempotency key generator for write actions/messages.

- `emailTracking.js`
  - Shared helper for writing real email delivery events into analytics log table.

## Main Public Pages

- `src/app/(main)/components/hero/HeroBanner.jsx`
  - Hero visuals + embeds `SearchBar`.

- `src/app/(main)/components/search/*`
  - Search UI pieces (destination, guests, date range).
  - Writes into `useFilters()`.

- `src/app/(main)/components/resort/ResortSection.jsx`
  - Home results section wrapper.

- `src/app/(main)/components/resort/ResortResults.jsx`
  - Resort cards list.
  - Uses `availabilityByResort` to show available room tags and low-match badge.

- `src/app/(main)/resort/[name]/ResortDetailPage.jsx`
  - Resort detail container.
  - Computes unavailable room ids based on selected date/time.
  - Passes availability to room list + handles inquiry submission.

- `src/app/(main)/resort/[name]/rooms/RoomsSection.jsx`
  - Room cards UI.
  - Filters out unavailable room ids + selected tag matching.

## Booking Edit Area (`src/app/edit/bookings`)

- `/[id]/page.jsx`
  - Resort-level bookings dashboard summary.

- `/[id]/components/BookingsCalendar.jsx`
  - Calendar/range booking management UI.

- `/[id]/booking-details/[bookingId]/page.jsx`
  - Booking details route container (loads booking + support data).

- `/[id]/booking-details/[bookingId]/components/BookingModernEditor.jsx`
  - Main booking details editor UI.
  - Handles inline edits, status transitions, payment proof flow.
  - Adds action lock (`actionBusy`) and writes status audit entries.

- `/[id]/booking-details/[bookingId]/components/bookingEditorUtils.js`
  - Booking editor draft builders + helper re-exports from `src/lib/bookingDateTime.js`.

- `/[id]/booking-details/[bookingId]/components/bookingEditorConfig.js`
  - Status phase constants + payment channels.

- `/[id]/booking-details/[bookingId]/components/BookingEditorActionBar.jsx`
  - Sticky action buttons (decline/back/request payment/confirm/edit/save).

- `/[id]/booking-details/[bookingId]/components/BookingEditorAtoms.jsx`
  - Small shared UI pieces (`SectionLabel`, `InfoItem`, `StatusBadge`).

- `/[id]/booking-details/[bookingId]/form/*`
  - Full booking form route/screens.

## Supabase SQL

- `supabase/schema.sql`
  - Canonical schema file for clean setup and local/dev alignment.
  - Sections preserve the original phased rollout:
    - bookings
    - payments / guest breakdown / issues
    - support messaging
    - accounts
    - archives
    - status hardening + audit
    - lean email usage logging
    - auth hardening + recovery requests
    - resort payment reference image

## Server Automation

- `src/app/api/internal/booking-status/route.js`
  - Cron-safe internal endpoint.
  - Uses `CRON_SECRET` (or `BOOKING_AUTOMATION_SECRET`) auth in non-dev.

- `vercel.json`
  - Cron schedule for `/api/internal/booking-status` once daily (Hobby-safe).

## Rule of Thumb

- Need shared filter/search state? -> `useFilters()` from `ContextFilter`.
- Need editable resort state? -> `useResort()` from `ContextEditor`.
- Need booking CRUD/cache in owner edit pages? -> `useBookings()`.
- Need date overlap or checkout-overdue logic? -> `src/lib/bookingDateTime.js`.
- Need availability computation from booking rows? -> `src/lib/availability.js`.
