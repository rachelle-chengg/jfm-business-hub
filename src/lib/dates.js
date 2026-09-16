// Dates are stored as ISO strings (YYYY-MM-DD) so <input type="date"> binds directly.

export function todayISO() {
  return toISO(new Date());
}

export function addDays(iso, days) {
  const d = fromISO(iso);
  if (!d) return "";
  d.setDate(d.getDate() + days);
  return toISO(d);
}

/** Matches the reference invoice: "Sep 3/25" */
export function formatShortDate(iso) {
  const d = fromISO(iso);
  if (!d) return "";
  const month = d.toLocaleString("en-CA", { month: "short" }).replace(".", "");
  return `${month} ${d.getDate()}/${String(d.getFullYear()).slice(-2)}`;
}

function fromISO(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toISO(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
