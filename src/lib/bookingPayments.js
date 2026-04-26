export function normalizeMoney(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100) / 100;
}

export function normalizePercentage(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return 0;
  return Math.min(100, Math.max(0, amount));
}

export function computeRequiredDownpayment({ totalAmount, percentage }) {
  const total = normalizeMoney(totalAmount);
  const rate = normalizePercentage(percentage);
  return normalizeMoney(total * (rate / 100));
}

export function getRequiredDownpaymentRemaining({
  requiredAmount,
  paidAmount,
  pendingAmount = 0,
}) {
  return Math.max(
    0,
    normalizeMoney(requiredAmount) - normalizeMoney(paidAmount) - normalizeMoney(pendingAmount)
  );
}

export function resolveDownpaymentRequirement({
  bookingForm = {},
  totalAmount = 0,
  resortDownpaymentPercentage = 0,
}) {
  const source = bookingForm.downpaymentRequirementSource || "resort_default";
  const defaultAmount = computeRequiredDownpayment({
    totalAmount,
    percentage: resortDownpaymentPercentage,
  });
  const storedAmount = normalizeMoney(bookingForm.downpaymentRequiredAmount);
  const requiredAmount =
    source === "manual_override"
      ? storedAmount
      : defaultAmount > 0
        ? defaultAmount
        : storedAmount;

  return {
    source,
    defaultAmount,
    requiredAmount,
  };
}

export function isCheckoutAmountSettled({ totalAmount, paidAmount }) {
  return normalizeMoney(totalAmount) === normalizeMoney(paidAmount);
}

export function getCheckoutMismatchMessage({ totalAmount, paidAmount }) {
  return `Checkout can only be confirmed when the verified payment equals the total due. Total due: PHP ${normalizeMoney(totalAmount).toLocaleString()}, paid: PHP ${normalizeMoney(paidAmount).toLocaleString()}.`;
}
