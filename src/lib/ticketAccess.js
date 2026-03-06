export function generateTicketAccessToken() {
  const seed = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  return btoa(seed).replace(/=+$/g, "").toLowerCase();
}

export function getTicketAccessExpiry(days = 30) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export function isTicketTokenValid(bookingForm, token) {
  const savedToken = bookingForm?.ticketAccessToken;
  if (!savedToken || !token || savedToken !== token) return false;
  const expiry = bookingForm?.ticketAccessExpiresAt;
  if (!expiry) return true;
  const expiryMs = new Date(expiry).getTime();
  if (Number.isNaN(expiryMs)) return false;
  return expiryMs > Date.now();
}
