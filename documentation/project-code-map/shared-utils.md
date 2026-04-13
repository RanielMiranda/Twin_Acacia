# Shared Utilities (`src/lib`)

This folder hosts shared helpers used across both client and server code.

## General helpers

### `supabase.js`
- Browser Supabase client (used by client components and pages).

### `bookingDateTime.js`
- Date/time helper functions used by booking and calendar logic.
- Key exports:
  - `toDateTimeMs`, `overlapsByDateTime`, `formatWeekdayLabel`, `formatTotalStayDays`, `isCheckoutOverdueRow`.

### `availability.js`
- Availability helpers used on the resort detail and search pages.
- Key exports:
  - `buildRequestedRange`
  - `getUnavailableRoomIds`
  - status filtering and room id normalization.

### `utils.js`
- Misc shared utilities.
- Notable exports:
  - Image/storage helpers: `BUCKET_NAME`, `getStoragePathFromPublicUrl`, `getPublicUrl`, `isSupabasePublicStorageUrl`, `getTransformedSupabaseImageUrl`, `getSupabaseSrcSet`.
  - Booking helpers: `parseMoney`, `getServiceKey`, `buildServiceSnapshot`, `buildServiceSnapshots`, `computeBookingTotalAmount`.

### `resortPaymentImage.js`
- Manages resort payment reference images.
- `uploadResortPaymentImage(supabase, file, resortName)` and `deleteResortPaymentImage(supabase, imageUrl)`.

### `bookingFlow.js`
- Booking confirmation generator for the guest-facing flow.

### `ticketAccess.js`
- Ticket link token generation and validation.
- `generateTicketAccessToken()`, `getTicketAccessExpiry()`.

### `caretakerNotifications.js`
- Builds SMS body and helper functions for caretaker notifications.
- Triggered when booking status changes to **Confirmed**.

### `idempotency.js`
- Idempotency key generator used for write actions/messages.

### `supportConversation.js`
- Combines ticket messages + issues into a unified conversation timeline.

### `emailTracking.js`
- `logEmailDelivery(...)` to write email delivery logs to Supabase.
