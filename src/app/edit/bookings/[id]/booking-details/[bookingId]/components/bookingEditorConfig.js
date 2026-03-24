export const STATUS_PHASES = [
  "Inquiry",
  "Approved Inquiry",
  "Pending Payment",
  "Confirmed",
  "Ongoing",
  "Pending Checkout",
  "Checked Out",
  "Cancelled",
  "Declined",
];

export const PREVIOUS_STATUS = {
  "Approved Inquiry": "Inquiry",
  "Pending Payment": "Approved Inquiry",
  "Confirmed": "Pending Payment",
  "Ongoing": "Pending Payment",
  "Pending Checkout": "Ongoing",
  "Checked Out": "Pending Checkout",
};

export const PAYMENT_CHANNELS = ["Pending", "GCash", "Bank", "Cash"];
