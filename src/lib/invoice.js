import { TAX_DEFAULTS, DUE_DATE_OFFSET_DAYS } from "../config/business.js";
import { todayISO, addDays } from "./dates.js";

let idSeed = 0;
export const newId = () => `li-${Date.now().toString(36)}-${idSeed++}`;

export function blankLineItem() {
  return { id: newId(), description: "", amount: "" };
}

export const ADJUSTMENT_DEFAULTS = {
  discount: { enabled: false, type: "percent", value: 0 },
  interest: { enabled: false, label: "Interest / Late Fee", value: 0 },
};

export function createInvoice({ invoiceNumber = "" } = {}) {
  const dateIssued = todayISO();
  return {
    invoiceNumber,
    dateIssued,
    dueDate: addDays(dateIssued, DUE_DATE_OFFSET_DAYS),
    dueDateOverridden: false,
    client: { name: "", address1: "", address2: "", phone: "", email: "" },
    items: [blankLineItem()],
    tax: { ...TAX_DEFAULTS },
    adjustment: { ...ADJUSTMENT_DEFAULTS },
  };
}

/** Increments the trailing digits: 25079 -> 25080, INV-009 -> INV-010 */
export function nextInvoiceNumber(current) {
  const match = String(current).match(/^(.*?)(\d+)$/);
  if (!match) return current;
  const [, prefix, digits] = match;
  return prefix + String(Number(digits) + 1).padStart(digits.length, "0");
}

export function suggestedFilename(invoice) {
  const clean = (s) => String(s || "").trim().replace(/[^\w\- ]+/g, "").replace(/\s+/g, "-");
  const parts = ["Invoice", clean(invoice.invoiceNumber), clean(invoice.client.name)].filter(Boolean);
  return `${parts.join("-")}.pdf`;
}
