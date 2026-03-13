export function generateTicketAccessToken() {
  const seed = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  return btoa(seed).replace(/=+$/g, "").toLowerCase();
}

export function getTicketAccessExpiry(days = 30) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function isTokenActive(savedToken, expiry, token) {
  if (!savedToken || !token || savedToken !== token) return false;
  if (!expiry) return true;
  const expiryMs = new Date(expiry).getTime();
  if (Number.isNaN(expiryMs)) return false;
  return expiryMs > Date.now();
}

export function getTicketTokenRole(bookingForm, token) {
  if (isTokenActive(bookingForm?.ticketAccessToken, bookingForm?.ticketAccessExpiresAt, token)) {
    return "client";
  }
  if (isTokenActive(bookingForm?.agentTicketAccessToken, bookingForm?.agentTicketAccessExpiresAt, token)) {
    return "agent";
  }
  return "";
}

export function isTicketTokenValid(bookingForm, token) {
  return !!getTicketTokenRole(bookingForm, token);
}
