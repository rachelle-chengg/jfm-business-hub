import { useEffect, useState } from "react";
import { listClients, saveClient, deleteClient } from "../lib/db.js";
import { listInvoices } from "../lib/db.js";
import { formatCurrency } from "../lib/money.js";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null); // null | "new" | <id>
  const [form, setForm] = useState(emptyForm());

  function load() {
    setClients(listClients());
    setInvoices(listInvoices());
  }

  useEffect(() => {
    load();
  }, []);

  function clientStats(clientId, clientName) {
    // Match by id if available, otherwise by name (for older invoices without clientId)
    const related = invoices.filter(
      (inv) => inv.clientId === clientId || inv.client?.name === clientName
    );
    const total = related.reduce((s, i) => s + (i.total || 0), 0);
    const last = related.sort((a, b) => (b.dateIssued ?? "").localeCompare(a.dateIssued ?? ""))[0];
    return { count: related.length, total, lastDate: last?.dateIssued ?? null };
  }

  function startEdit(client) {
    setForm({ ...emptyForm(), ...client });
    setEditingId(client.id);
  }

  function startNew() {
    setForm(emptyForm());
    setEditingId("new");
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!window.confirm(editingId === "new" ? "Add this client?" : `Save changes to ${form.name}?`)) return;
    saveClient({ ...form, id: editingId === "new" ? undefined : editingId });
    setEditingId(null);
    load();
  }

  function handleDelete(client) {
    if (!window.confirm(`Delete ${client.name}? This only removes the client record — invoices are kept.`)) return;
    deleteClient(client.id);
    load();
  }

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (c.name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.phone || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="hub-page">
      <div className="hub-page__head">
        <h1 className="hub-page__title">Clients</h1>
        <button type="button" className="btn btn--primary" onClick={startNew}>
          + Add Client
        </button>
      </div>

      {/* Inline add/edit form */}
      {editingId !== null && (
        <div className="client-form-card">
          <h3 className="client-form-card__title">
            {editingId === "new" ? "New client" : "Edit client"}
          </h3>
          <form onSubmit={handleSave}>
            <div className="field-row">
              <div className="field">
                <label className="field__label">Name *</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
              <div className="field">
                <label className="field__label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field__label">Phone</label>
                <input
                  className="input"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="field">
                <label className="field__label">Address</label>
                <input
                  className="input"
                  value={form.address1}
                  onChange={(e) => setForm((f) => ({ ...f, address1: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn--primary">
                {editingId === "new" ? "Add client" : "Save changes"}
              </button>
              <button type="button" className="btn btn--ghost" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="toolbar">
        <input
          className="input toolbar__search"
          type="search"
          placeholder="Search clients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>{search ? "No clients match your search." : "No clients yet."}</p>
          {!search && (
            <button type="button" className="btn btn--primary" onClick={startNew}>
              Add your first client
            </button>
          )}
        </div>
      ) : (
        <div className="inv-table-wrap">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Invoices</th>
                <th>Total billed</th>
                <th>Last invoice</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const stats = clientStats(c.id, c.name);
                return (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.email || "—"}</td>
                    <td>{c.phone || "—"}</td>
                    <td>{stats.count}</td>
                    <td>{formatCurrency(stats.total)}</td>
                    <td>{stats.lastDate ? stats.lastDate : "—"}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => startEdit(c)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger btn--sm"
                          onClick={() => handleDelete(c)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function emptyForm() {
  return { name: "", email: "", phone: "", address1: "", address2: "" };
}
