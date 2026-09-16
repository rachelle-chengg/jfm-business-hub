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

export function calculateTotals(items, tax) {
  const subtotal = items.reduce((sum, item) => {
    const n = parseAmount(item.amount);
    return n === null ? sum : sum + n;
  }, 0);
  const rate = tax.enabled ? Number(tax.rate) || 0 : 0;
  const taxAmount = round2(subtotal * (rate / 100));
  return { subtotal: round2(subtotal), taxAmount, rate, balanceDue: round2(subtotal + taxAmount) };
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
