# Project Code Map

Quick reference for where key logic lives.

## Client contexts (`src/components/useclient`)

- `ContextFilter.jsx`
  - Re-exports `ResortDataProvider` as `FilterProvider` and `useFilters` from `ResortDataClient.jsx`.
  - Use `useFilters()` for search/filter state shared by home + resort detail: guests, dates, times, selected tags, price range, `filteredResorts`, `availabilityByResort`.

- `ContextEditor.jsx`
  - Re-exports `ResortEditorProvider` as `ResortProvider` and `useResort` from `ResortEditorClient.jsx`.

- `ResortDataClient.jsx`
  - Main filter/search data source for public pages. Fetches resort list/details from Supabase, builds sorted `filteredResorts`, computes availability ranking (viable first, low match later). Exposes `fetchResortByIdentifier(identifier, isId)`.

- `ResortEditorClient.jsx`
  - Resort editor data flow: load/save/update/delete resort, scoped draft caching. `uploadImage(file, resortName, category, subFolder)`, `saveResort()`, `deleteResort()`, `setVisibility()`, `safeSrc()`.

- `BookingsClient.jsx`
  - Booking CRUD and booking cache for owner edit pages. `refreshBookings()` (includes automatic status transitions: overdue unpaid -> Cancelled, overdue confirmed checkout -> Pending Checkout), `updateBookingById`, `deleteBookingById`, `createSignedProofUrl`, `createBookingTransaction`.

- `SupportClient.jsx`
  - Ticket issue/message loading and updates. `loadBookingSupport(bookingId)` (messages + issues + archived issues), `updateConcernStatus(issueId, status)`, `sendTicketMessage(payload)`, `listArchivedOwnerAdminMessages`, `archiveOwnerAdminMessage`. Uses `ticket_messages`, `ticket_issues`, `ticket_issues_archive`, `owner_admin_messages`.

- `AccountsClient.jsx`
  - Session and accounts management. `refreshSession()` (GET `/api/auth/session`), `refreshAccounts()` (GET `/api/accounts`), `createAccountInvite`, `updateAccount`, `deleteAccount`, profile image upload. Exposes `activeAccount`, `accounts`, `loading`, `loadingSession`.

## Shared utilities (`src/lib`)

- `supabase.js`
  - Browser Supabase client (used by client components and pages).

- `bookingDateTime.js`
  - Date/time helpers: `toDateTimeMs`, `overlapsByDateTime`, `formatWeekdayLabel`, `formatTotalStayDays`, `isCheckoutOverdueRow`.

- `availability.js`
  - Availability for home + resort detail: `buildRequestedRange`, `getUnavailableRoomIds`, status filtering, room id normalization.

- `utils.js`
  - Image/storage: `BUCKET_NAME`, `getStoragePathFromPublicUrl`, `convertImageFileToWebp`, `getResortStoragePath`, `getPublicUrl`, `isSupabasePublicStorageUrl`, `getTransformedSupabaseImageUrl`, `getSupabaseSrcSet`.

- `resortPaymentImage.js`
  - Resort payment reference image: `uploadResortPaymentImage(supabase, file, resortName)`, `deleteResortPaymentImage(supabase, imageUrl)`. Stores under `[resortname]/payment`, WebP.

- `bookingFlow.js`
  - Booking confirmation stub generator.

- `ticketAccess.js`
  - Ticket link token generation and expiry checks (`isTicketTokenValid`, etc.).

- `caretakerNotifications.js`
  - Notification write helper after payment approval (in-app; placeholder for future email/SMS).

- `idempotency.js`
  - Idempotency key generator for write actions/messages.

- `supportConversation.js`
  - Support UI helpers: `buildSupportConversationItems(messages, issues)`, `isResolvedConversationItem`. Merges messages and issues into a single sorted conversation list.

- `emailTracking.js`
  - `logEmailDelivery(supabaseClient, payload)` — writes to `email_delivery_logs` for send/delivery tracking.

## Server-only (`src/lib/server`)

- `serviceSupabase.js`
  - `createServiceSupabaseClient()` — Supabase client with service role key (server-only).

- `accounts.js`
  - Account CRUD and recovery: `listAccounts`, `getAccountById`, `getAccountByEmail`, `getAccountBySetupToken`, `createAccountInvite`, `updateAccount`, `deleteAccount`, `createRecoveryRequest`, `listRecoveryRequests`, `resolveRecoveryRequest`, `completeAccountSetup`, `sanitizeAccount`. Uses hashed passwords via `passwords.js`.

- `passwords.js`
  - `hashPassword`, `verifyPassword`, `shouldUpgradePasswordHash`, `upgradeLegacyPassword`. Scrypt-based hashing (server-only, Node crypto).

- `session.js`
  - Server session: `SESSION_COOKIE_NAME`, `createSession(payload)`, `verifySession(cookieHeader)`. HMAC-signed cookie; used by auth routes.

- `bookingStatusAutomation.js`
  - Server-only status automation: overdue confirmed/ongoing -> Pending Checkout. Consumed by `/api/internal/booking-status`.

## App routes (`src/app`)

- **`(main)`** — Public layout: home (`/`), resort detail `resort/[name]`, ticket `ticket/[bookingId]`. Uses `FilterProvider` / `useFilters`.
- **`auth`** — Login `auth/login`, setup resort `auth/setup-resort` (token-based). Uses `session.js`, `passwords.js`, `accounts.js`.
- **`admin`** — Dashboard `admin/dashboard`, accounts `admin/accounts`, analytics `admin/analytics`. Session-protected.
- **`owner`** — Owner dashboard `owner/dashboard`. Session-protected.
- **`edit`** — Resort builder `edit/resort-builder`, `edit/resort-builder/[id]`; bookings `edit/bookings/[id]`, booking detail `edit/bookings/[id]/booking-details/[bookingId]`; accounts `edit/accounts/[id]`. Uses `ResortEditorClient`, `BookingsClient`, `AccountsClient`.
- **`api`** — Auth: `api/auth/login`, `api/auth/logout`, `api/auth/session`, `api/auth/forgot-password`. Accounts: `api/accounts`, `api/accounts/setup`, `api/accounts/[id]`. Recovery: `api/account-recovery`, `api/account-recovery/[id]`. Booking: `api/booking/approve-inquiry-email`. Internal: `api/internal/booking-status` (calls `bookingStatusAutomation`).

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
