/**
 * localStorage database for invoices and clients.
 *
 * Invoices schema:
 *   { id, number, status, client, items, tax, subtotal, total,
 *     dateIssued, dueDate, driveFileId, createdAt, updatedAt }
 *
 * Status values: "draft" | "sent" | "paid"
 * "overdue" is derived at runtime: status === "sent" && dueDate < today
 *
 * Clients schema:
 *   { id, name, email, phone, address1, address2, createdAt }
 */

const INVOICES_KEY = "jfm-invoices-v1";
const CLIENTS_KEY = "jfm-clients-v1";

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* quota or private mode */
  }
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export function listInvoices() {
  return read(INVOICES_KEY);
}

export function getInvoice(id) {
  return listInvoices().find((inv) => inv.id === id) ?? null;
}

export function saveInvoice(invoice) {
  const invoices = listInvoices();
  const now = new Date().toISOString();
  const existing = invoices.findIndex((inv) => inv.id === invoice.id);

  if (existing >= 0) {
    invoices[existing] = { ...invoice, updatedAt: now };
  } else {
    invoices.unshift({ ...invoice, id: invoice.id ?? uid(), createdAt: now, updatedAt: now });
  }
  write(INVOICES_KEY, invoices);
  return invoices[existing >= 0 ? existing : 0];
}

export function updateInvoiceStatus(id, status) {
  const invoices = listInvoices();
  const idx = invoices.findIndex((inv) => inv.id === id);
  if (idx < 0) return;
  invoices[idx] = { ...invoices[idx], status, updatedAt: new Date().toISOString() };
  write(INVOICES_KEY, invoices);
}

export function deleteInvoice(id) {
  write(INVOICES_KEY, listInvoices().filter((inv) => inv.id !== id));
}

/** Derived status — adds "overdue" on top of the stored status. */
export function effectiveStatus(invoice) {
  if (invoice.status === "sent" && invoice.dueDate < todayISO()) return "overdue";
  return invoice.status ?? "draft";
}

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ─── Clients ─────────────────────────────────────────────────────────────────

export function listClients() {
  return read(CLIENTS_KEY);
}

export function saveClient(client) {
  const clients = listClients();
  const now = new Date().toISOString();
  const existing = clients.findIndex((c) => c.id === client.id);

  if (existing >= 0) {
    clients[existing] = { ...client, updatedAt: now };
  } else {
    clients.unshift({ ...client, id: client.id ?? uid(), createdAt: now, updatedAt: now });
  }
  write(CLIENTS_KEY, clients);
}

export function deleteClient(id) {
  write(CLIENTS_KEY, listClients().filter((c) => c.id !== id));
}
