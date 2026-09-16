import { CURRENCY } from "../config/business.js";

/** Parse a line item amount. Number for dollar values, null for free text such as "Included". */
export function parseAmount(raw) {
  if (raw == null) return null;
  const cleaned = String(raw).replace(/[$,\s]/g, "");
  if (cleaned === "" || !/^-?\d*\.?\d+$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function formatCurrency(n) {
  const value = Number.isFinite(n) ? n : 0;
  const abs = Math.abs(value).toLocaleString(CURRENCY.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${value < 0 ? "-" : ""}$${abs}`;
}

/** Total column display: currency if numeric, otherwise the text as typed. */
export function formatLineAmount(raw) {
  const n = parseAmount(raw);
  return n === null ? String(raw ?? "") : formatCurrency(n);
}

export function calculateTotals(items, tax, adjustment = {}) {
  const subtotal = items.reduce((sum, item) => {
    const n = parseAmount(item.amount);
    return n === null ? sum : sum + n;
  }, 0);

  // Discount applied before tax
  const disc = adjustment.discount;
  let discountAmount = 0;
  if (disc?.enabled && disc.value) {
    discountAmount =
      disc.type === "percent"
        ? round2(subtotal * (Number(disc.value) / 100))
        : round2(Number(disc.value));
  }
  const afterDiscount = round2(subtotal - discountAmount);

  const rate = tax.enabled ? Number(tax.rate) || 0 : 0;
  const taxAmount = round2(afterDiscount * (rate / 100));

  // Interest / late fee added after tax
  const int_ = adjustment.interest;
  const interestAmount = int_?.enabled ? round2(Number(int_.value) || 0) : 0;

  const balanceDue = round2(afterDiscount + taxAmount + interestAmount);

  return {
    subtotal: round2(subtotal),
    discountAmount,
    afterDiscount,
    taxAmount,
    rate,
    interestAmount,
    interestLabel: int_?.label || "Interest / Late Fee",
    balanceDue,
  };
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
