export function generateConfirmationStub(bookingId, resortName = "", guestName = "") {
  const safeResort = String(resortName || "RESORT")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4)
    .padEnd(4, "X");
  const safeGuest = String(guestName || "GUEST")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 2)
    .padEnd(2, "X");
  const idTail = String(bookingId || "").replace(/[^A-Z0-9]/gi, "").slice(-6).toUpperCase() || "000000";
  const code = `${safeResort}-${safeGuest}-${idTail}`;

  return {
    code,
    generatedAt: new Date().toISOString(),
  };
}
