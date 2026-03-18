# Server-only Logic (`src/lib/server`)

Server-only helper modules used by API routes and internal automation.

## `serviceSupabase.js`
- Creates a Supabase client using the service role key.
- Used by server routes that need elevated privileges.

## `accounts.js`
- Account CRUD and recovery logic.
- Key exports:
  - `listAccounts`, `getAccountById`, `getAccountByEmail`, `getAccountBySetupToken`
  - `createAccountInvite`, `updateAccount`, `deleteAccount`
  - `createRecoveryRequest`, `listRecoveryRequests`, `resolveRecoveryRequest`, `completeAccountSetup`
  - `sanitizeAccount`.
- Uses hashed passwords helpers from `passwords.js`.

## `passwords.js`
- Password hashing and verification.
- Uses Node crypto and scrypt.
- Exports:
  - `hashPassword`, `verifyPassword`, `shouldUpgradePasswordHash`, `upgradeLegacyPassword`.

## `session.js`
- Signed session cookie management.
- Exports:
  - `SESSION_COOKIE_NAME`, `createSession(payload)`, `verifySession(cookieHeader)`.
- Used by auth routes.

## `bookingStatusAutomation.js`
- Booking status automation rules:
  - Automatically transitions overdue bookings (confirmed or ongoing) to **Pending Checkout**.
- Used by the internal `/api/internal/booking-status` endpoint.
