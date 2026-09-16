/**
 * Due-date reminder logic and pre-written email copy.
 *
 * Interest rate sourced from business.js settlement note:
 * 1.5% per month, compounded monthly (= 19.56% annual).
 */

import { BUSINESS, SETTLEMENT } from "../config/business.js";
import { formatCurrency } from "./money.js";

const INTEREST_RATE_MONTHLY = 0.015; // 1.5 % per month
const WARN_DAYS_BEFORE = 7;          // show "due soon" banner

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function daysBetween(isoA, isoB) {
  const msPerDay = 86_400_000;
  return Math.round((new Date(isoB) - new Date(isoA)) / msPerDay);
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}

/** Compound interest: P * ((1 + r)^t - 1), t in months (fractional). */
function calcInterest(principal, daysOverdue) {
  const months = daysOverdue / 30.44;
  return principal * (Math.pow(1 + INTEREST_RATE_MONTHLY, months) - 1);
}

/**
 * Returns reminder objects for invoices that are overdue or due within WARN_DAYS_BEFORE days.
 * Only "sent" invoices are checked (drafts and paid are ignored).
 *
 * Each reminder: { type: "overdue"|"due_soon", invoice, daysOverdue, interest, totalOwing, emailSubject, emailBody }
 */
export function buildReminders(invoices) {
  const today = todayISO();
  const reminders = [];

  for (const inv of invoices) {
    if (inv.status !== "sent") continue;

    const daysUntilDue = daysBetween(today, inv.dueDate); // negative = overdue

    if (daysUntilDue < 0) {
      const daysOverdue = -daysUntilDue;
      const interest = calcInterest(inv.total, daysOverdue);
      const totalOwing = inv.total + interest;

      reminders.push({
        type: "overdue",
        invoice: inv,
        daysOverdue,
        interest,
        totalOwing,
        ...overdueEmail(inv, daysOverdue, interest, totalOwing),
      });
    } else if (daysUntilDue <= WARN_DAYS_BEFORE) {
      reminders.push({
        type: "due_soon",
        invoice: inv,
        daysUntilDue,
        ...dueSoonEmail(inv, daysUntilDue),
      });
    }
  }

  // Overdue first, then due soon; each group sorted most urgent first
  return [
    ...reminders.filter((r) => r.type === "overdue").sort((a, b) => b.daysOverdue - a.daysOverdue),
    ...reminders.filter((r) => r.type === "due_soon").sort((a, b) => a.daysUntilDue - b.daysUntilDue),
  ];
}

function overdueEmail(inv, daysOverdue, interest, totalOwing) {
  const clientFirst = (inv.client?.name || "").split(" ")[0] || "there";
  const subject = `Overdue Invoice #${inv.number} — Payment Required`;
  const body = `Hi ${clientFirst},

I'm following up on Invoice #${inv.number} for ${formatCurrency(inv.total)}, which was due on ${formatDate(inv.dueDate)} and is now ${daysOverdue} day${daysOverdue === 1 ? "" : "s"} overdue.

As noted in our invoice terms, carrying charges of 1.5% per month (compounded monthly, 19.56% annually) are applied to outstanding balances past the due date.

  Original amount:     ${formatCurrency(inv.total)}
  Interest accrued:    ${formatCurrency(interest)}
  Total now owing:     ${formatCurrency(totalOwing)}

Please arrange payment at your earliest convenience. If you have any questions or need to discuss payment arrangements, don't hesitate to reach out.

${BUSINESS.name}
${BUSINESS.phone}
${BUSINESS.email}`;

  return { emailSubject: subject, emailBody: body };
}

function dueSoonEmail(inv, daysUntilDue) {
  const clientFirst = (inv.client?.name || "").split(" ")[0] || "there";
  const dueStr = formatDate(inv.dueDate);
  const dayWord = daysUntilDue === 1 ? "tomorrow" : `in ${daysUntilDue} days`;
  const subject = `Reminder: Invoice #${inv.number} Due ${dueStr}`;
  const body = `Hi ${clientFirst},

Just a friendly reminder that Invoice #${inv.number} for ${formatCurrency(inv.total)} is due ${dayWord} (${dueStr}).

If you have any questions about the invoice, please don't hesitate to get in touch.

${BUSINESS.name}
${BUSINESS.phone}
${BUSINESS.email}`;

  return { emailSubject: subject, emailBody: body };
}
