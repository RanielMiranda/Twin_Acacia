/**
 * Generates a short booking reference number in format: {RESORT_INITIALS}{2-digit random}
 * Examples: BW-42, PA-07, RX-89
 * Resort initials: first 2 uppercase letters from resort name (non-alphanumeric stripped)
 * Random: 2 digits (00-99), zero-padded
 */
export function generateShortBookingReference(resortName = "RESORT") {
  // Extract first 2 uppercase letters from resort name
  const cleanName = String(resortName || "RESORT")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  const initials = cleanName.length >= 2
    ? cleanName.slice(0, 2)
    : cleanName.padEnd(2, "X");

  const randomTwoDigits = String(Math.floor(Math.random() * 100)).padStart(2, "0");
  return `${initials}-${randomTwoDigits}`;
}
