# Booking & Ticketing Flows

This document covers the core booking creation paths, the booking edit console, and ticket view.

## Booking creation (guest inquiry + manual booking)

### Shared payload builder
- `src/components/booking/payloadData/buildBookingPayload.js`
  - Normalizes incoming form submissions into:
    - `bookingForm` (stored inside `booking_form` JSON column)
    - low-level booking model (`bookingModel`) used by internal helpers
    - `bookingRow` payload used when upserting to Supabase
  - Handles:
    - selected services → `serviceSnapshots` (price snapshot + name)
    - resolving room IDs/names
    - computing `totalAmount` (base + services)

### Guest inquiry flow (Resort detail page)
- `src/app/(main)/resort/[name]/ResortDetailPage.jsx`
  - Uses `ContactOwnerModal` + `BookingCreationTemplate` (UI)
  - On submit, calls `normalizeBookingSubmission()` then upserts to `bookings`.
  - Stores `totalAmount`, `resortServices` snapshot, and `resort_service_ids`.

### Manual booking (owner console)
- `src/app/edit/bookings/[id]/page.jsx`
  - Displays booking dashboard and allows manual bookings.
  - Uses `BookingCreationTemplate` inside `ManualBookingModal`.
  - Submits via `createBooking()` from `BookingsClient`.

## Booking edit / owner console

### Booking console data layer
- `src/components/useclient/BookingsClient.jsx`
  - Loads bookings for a resort and caches locally.
  - Tracks optimistic updates when creating/updating/delete.
  - Exposes helpers used by booking details UI.

### Booking details editor
- `src/app/edit/bookings/[id]/booking-details/[bookingId]/page.jsx`
  - Loads single booking + support data.
  - Renders `BookingModernEditor.jsx`.

### Booking details UI
- `src/app/edit/bookings/[id]/booking-details/[bookingId]/components/BookingModernEditor.jsx`
  - Main editor UI for status, payments, and notes.
  - Uses helper modules:
    - `bookingEditorUtils.js` (draft builders + date helpers)
    - `bookingEditorConfig.js` (status phases, payment channels)
  - Handles status transitions and sends SMS via caretaker notifications.

### Booking confirmation form
- `src/app/edit/bookings/[id]/booking-details/[bookingId]/form/BookingConfirmation.jsx`
  - Shows booking totals and payment breakdown.

## Ticket page (guest-facing booking view)
- `src/app/(main)/ticket/[bookingId]/page.jsx`
  - Shows booking details, payments, and messaging.
  - Uses polling + Supabase realtime subscription for updates.

### Ticket actions
- `src/app/(main)/ticket/[bookingId]/ticket-page/useTicketActions.js`
  - Handles updates like adding services, sending messages, and recomputing totals.
  - Uses shared booking payload logic for service snapshots.

### Memoized components
- Ticket subcomponents (header, payment, add-ons, support) are memoized with `React.memo` to reduce re-renders during polling.
