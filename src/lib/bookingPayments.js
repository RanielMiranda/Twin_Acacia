export function normalizeMoney(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100) / 100;
}

export function isCheckoutAmountSettled({ totalAmount, paidAmount }) {
  return normalizeMoney(totalAmount) === normalizeMoney(paidAmount);
}

export function getCheckoutMismatchMessage({ totalAmount, paidAmount }) {
  return `Checkout can only be confirmed when the verified payment equals the total due. Total due: PHP ${normalizeMoney(totalAmount).toLocaleString()}, paid: PHP ${normalizeMoney(paidAmount).toLocaleString()}.`;
}
