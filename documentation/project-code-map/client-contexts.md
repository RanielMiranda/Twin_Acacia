# Client Contexts (`src/components/useclient`)

This folder contains shared React context providers and hooks used throughout the public-facing UI and owner admin sections.

## Contexts / Providers

### `ContextFilter.jsx`
- Re-exports `ResortDataProvider` as `FilterProvider` and `useFilters` from `ResortDataClient.jsx`.
- Contains global search/filter state for public pages.
- Use `useFilters()` to access: 
  - `guests`, `startDate`, `endDate`, `checkInTime`, `checkOutTime`.
  - `destination` / search input.
  - `filteredResorts`, `availabilityByResort`.

### `ContextEditor.jsx`
- Re-exports `ResortEditorProvider` as `ResortProvider` and `useResort` from `ResortEditorClient.jsx`.
- Used by all admin/owner pages to load/save resort meta, rooms, services, etc.

## Clients

### `ResortDataClient.jsx`
- Main data fetcher for public pages.
- Fetches resort list and individual resort details from Supabase.
- Computes sorted `filteredResorts` and `availabilityByResort` ranking.
- Exposes `fetchResortByIdentifier(identifier, isId)`.

### `ResortEditorClient.jsx`
- Resort editor data flow.
- Manages resort draft caching (localStorage), resort save/delete operations.
- Helpers:
  - `uploadImage(file, resortName, category, subFolder)`
  - `saveResort()` / `deleteResort()`
  - `setVisibility()`
  - `safeSrc()` for image URLs.

### `BookingsClient.jsx`
- Booking CRUD & caching for owner/edit pages.
- Exposes:
  - `refreshBookings()` (pulls latest bookings for resort)
  - `updateBookingById()`, `deleteBookingById()`, `createBooking()`
  - `createSignedProofUrl()`, `createBookingTransaction()`
- Includes optimistic updates and local cache persistence.

### `SupportClient.jsx`
- Ticket/issue messaging support.
- Exposes:
  - `loadBookingSupport(bookingId)` (messages + issues + archives)
  - `updateConcernStatus(issueId, status)`, `sendTicketMessage(payload)`
  - `listArchivedOwnerAdminMessages()` / `archiveOwnerAdminMessage()`

### `AccountsClient.jsx`
- Session & account management.
- Exposes:
  - `refreshSession()` (GET `/api/auth/session`)
  - `refreshAccounts()` (GET `/api/accounts`)
  - `createAccountInvite()`, `updateAccount()`, `deleteAccount()`
  - Profile image upload.
  - `activeAccount`, `accounts`, `loading`, `loadingSession`.
