import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listClients, saveClient, deleteClient, listInvoices } from "../lib/db.js";
import AddressAutocomplete from "../components/AddressAutocomplete.jsx";
import TagInput from "../components/TagInput.jsx";
import Modal from "../components/Modal.jsx";
import { SearchIcon, SortIcon, StarIcon } from "../components/icons.jsx";
import { formatCurrency } from "../lib/money.js";
import { formatShortDate } from "../lib/dates.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SORT_OPTIONS = [
  { value: "name", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "total-desc", label: "Total billed: high to low" },
  { value: "total-asc", label: "Total billed: low to high" },
  { value: "invoices-desc", label: "Most invoices" },
];

function sortClients(clients, allStats, sortBy) {
  const copy = [...clients];
  switch (sortBy) {
    case "name-desc": copy.sort((a, b) => (b.name ?? "").localeCompare(a.name ?? "")); break;
    case "total-desc": copy.sort((a, b) => (allStats[b.id]?.total || 0) - (allStats[a.id]?.total || 0)); break;
    case "total-asc": copy.sort((a, b) => (allStats[a.id]?.total || 0) - (allStats[b.id]?.total || 0)); break;
    case "invoices-desc": copy.sort((a, b) => (allStats[b.id]?.count || 0) - (allStats[a.id]?.count || 0)); break;
    default: copy.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }
  // Favorites always float to the top, regardless of the chosen sort.
  copy.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
  return copy;
}

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [emailTouched, setEmailTouched] = useState(false);
  const emailInvalid = emailTouched && form.email && !EMAIL_RE.test(form.email);

  function load() {
    setClients(listClients());
    setInvoices(listInvoices());
  }

  useEffect(() => { load(); }, []);

  function getStats() {
    const map = {};
    for (const c of clients) {
      const related = invoices.filter(
        (inv) => inv.clientId === c.id || inv.client?.name === c.name
      );
      const total = related.reduce((s, i) => s + (i.total || 0), 0);
      const last = [...related].sort((a, b) => (b.dateIssued ?? "").localeCompare(a.dateIssued ?? ""))[0];
      map[c.id] = { count: related.length, total, lastDate: last?.dateIssued ?? null };
    }
    return map;
  }

  const allStats = getStats();

  function startEdit(client) {
    setForm({ ...emptyForm(), ...client });
    setEditingId(client.id);
    setEmailTouched(false);
  }

  function startNew() {
    setForm(emptyForm());
    setEditingId("new");
    setEmailTouched(false);
  }

  function cancelEdit() { setEditingId(null); }

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

  function toggleFavorite(client) {
    saveClient({ ...client, favorite: !client.favorite });
    load();
  }

  const filtered = sortClients(
    clients.filter((c) => {
      const q = search.toLowerCase();
      return (
        !q ||
        (c.name || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q)
      );
    }),
    allStats,
    sortBy
  );

  return (
    <div className="hub-page">
      <div className="hub-page__head">
        <h1 className="hub-page__title">Clients</h1>
        <button type="button" className="btn btn--primary" onClick={startNew}>
          + Add Client
        </button>
      </div>

      {/* Add/edit modal */}
      {editingId !== null && (
        <Modal title={editingId === "new" ? "New client" : "Edit client"} onClose={cancelEdit}>
          <form onSubmit={handleSave}>
            <div className="field-row">
              <div className="field">
                <label className="field__label">Name *</label>
                <input className="input" value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required autoFocus />
              </div>
              <div className="field">
                <label className="field__label">Email</label>
                <input className={`input${emailInvalid ? " input--error" : ""}`} type="email" value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  onBlur={() => setEmailTouched(true)} />
                {emailInvalid && <p className="field__hint field__hint--error">Please enter a valid email address.</p>}
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field__label">Phone</label>
                <input className="input" value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="field">
                <label className="field__label">Address</label>
                <AddressAutocomplete
                  className="input"
                  value={form.address1}
                  onChange={(v) => setForm((f) => ({ ...f, address1: v }))}
                />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field__label">Website</label>
                <input className="input" type="url" placeholder="https://…" value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
              </div>
              <div className="field">
                <label className="field__label">Social channels</label>
                <input className="input" placeholder="@handle or links, comma separated" value={form.social}
                  onChange={(e) => setForm((f) => ({ ...f, social: e.target.value }))} />
              </div>
            </div>
            <div className="field">
              <label className="field__label">Tags</label>
              <TagInput tags={form.tags} onChange={(tags) => setForm((f) => ({ ...f, tags }))} />
            </div>
            <div className="field">
              <label className="field__label">Notes</label>
              <textarea className="input settings-textarea" rows={3} value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn--primary">
                {editingId === "new" ? "Add client" : "Save changes"}
              </button>
              <button type="button" className="btn btn--ghost" onClick={cancelEdit}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-field">
          <SearchIcon />
          <input
            className="input"
            type="search"
            placeholder="Search clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="select-field">
          <SortIcon />
          <select
            className="input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort clients"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
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
                <th></th>
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
                const stats = allStats[c.id] || { count: 0, total: 0, lastDate: null };
                return (
                  <tr key={c.id}>
                    <td>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => toggleFavorite(c)}
                        title={c.favorite ? "Unfavorite" : "Favorite"}
                        aria-label={c.favorite ? `Unfavorite ${c.name}` : `Favorite ${c.name}`}
                        style={{ color: c.favorite ? "#C9AE7C" : undefined }}
                      >
                        <StarIcon filled={!!c.favorite} />
                      </button>
                    </td>
                    <td>
                      <Link to={`/clients/${c.id}`} className="link"><strong>{c.name}</strong></Link>
                      {c.tags?.length > 0 && (
                        <div className="tag-pills" style={{ marginTop: 6 }}>
                          {c.tags.map((t) => <span className="tag-pill" key={t}>{t}</span>)}
                        </div>
                      )}
                    </td>
                    <td>{c.email || "—"}</td>
                    <td>{c.phone || "—"}</td>
                    <td>{stats.count}</td>
                    <td>{formatCurrency(stats.total)}</td>
                    <td>{stats.lastDate ? formatShortDate(stats.lastDate) : "—"}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="icon-btn icon-btn--edit"
                          onClick={() => startEdit(c)}
                          title="Edit client"
                          aria-label={`Edit ${c.name}`}
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn--delete"
                          onClick={() => handleDelete(c)}
                          title="Delete client"
                          aria-label={`Delete ${c.name}`}
                        >
                          <TrashIcon />
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
  return {
    name: "", email: "", phone: "", address1: "", address2: "",
    website: "", social: "", tags: [], notes: "", favorite: false,
  };
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
