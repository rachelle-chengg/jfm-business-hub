import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listClients, saveClient, deleteClient, listInvoices } from "../lib/db.js";
import AddressAutocomplete from "../components/AddressAutocomplete.jsx";
import TagInput from "../components/TagInput.jsx";
import Modal from "../components/Modal.jsx";
import { SearchIcon, SortIcon, FilterIcon, StarIcon } from "../components/icons.jsx";
import { formatCurrency } from "../lib/money.js";
import { formatShortDate } from "../lib/dates.js";
import { effectiveStatus } from "../lib/db.js";

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

const ALL_COLUMNS = {
  name: { label: "Name", width: 220 },
  email: { label: "Email", width: 220 },
  phone: { label: "Phone", width: 140 },
  tags: { label: "Tags", width: 220 },
  invoices: { label: "Invoices", width: 90 },
  total: { label: "Total billed", width: 130 },
  last: { label: "Last invoice", width: 120 },
};
const DEFAULT_COLUMN_ORDER = ["name", "email", "phone", "tags", "invoices", "total", "last"];
const COLUMN_ORDER_KEY = "jfm-clients-columns-v1";

function loadColumnOrder() {
  try {
    const raw = JSON.parse(localStorage.getItem(COLUMN_ORDER_KEY) || "null");
    if (!Array.isArray(raw)) return DEFAULT_COLUMN_ORDER;
    const known = raw.filter((k) => ALL_COLUMNS[k]);
    const missing = DEFAULT_COLUMN_ORDER.filter((k) => !known.includes(k));
    return [...known, ...missing];
  } catch {
    return DEFAULT_COLUMN_ORDER;
  }
}

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [favoriteFilter, setFavoriteFilter] = useState("all");
  const [balanceFilter, setBalanceFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [emailTouched, setEmailTouched] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [columnOrder, setColumnOrder] = useState(loadColumnOrder);
  const [dragKey, setDragKey] = useState(null);
  const emailInvalid = emailTouched && form.email && !EMAIL_RE.test(form.email);

  useEffect(() => {
    localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(columnOrder));
  }, [columnOrder]);

  function moveColumn(fromKey, toKey) {
    if (!fromKey || fromKey === toKey) return;
    setColumnOrder((order) => {
      const next = order.filter((k) => k !== fromKey);
      next.splice(next.indexOf(toKey), 0, fromKey);
      return next;
    });
  }

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
      const outstanding = related
        .filter((inv) => ["sent", "overdue"].includes(effectiveStatus(inv)))
        .reduce((s, i) => s + (i.total || 0), 0);
      const last = [...related].sort((a, b) => (b.dateIssued ?? "").localeCompare(a.dateIssued ?? ""))[0];
      map[c.id] = { count: related.length, total, outstanding, lastDate: last?.dateIssued ?? null };
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

  function updateClient(id, patch) {
    setClients((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...patch } : c));
      saveClient(next.find((c) => c.id === id));
      return next;
    });
  }

  function renderCell(key, c, stats) {
    switch (key) {
      case "name":
        return editMode ? (
          <input className="input" value={c.name}
            onChange={(e) => updateClient(c.id, { name: e.target.value })} />
        ) : (
          <Link to={`/clients/${c.id}`} className="link"><strong>{c.name}</strong></Link>
        );
      case "email":
        return editMode ? (
          <input className="input" type="email" value={c.email || ""}
            onChange={(e) => updateClient(c.id, { email: e.target.value })} />
        ) : c.email ? (
          <a className="link" href={`mailto:${c.email}`}>{c.email}</a>
        ) : "—";
      case "phone":
        return editMode ? (
          <input className="input" value={c.phone || ""}
            onChange={(e) => updateClient(c.id, { phone: e.target.value })} />
        ) : (c.phone || "—");
      case "tags":
        return editMode ? (
          <TagInput tags={c.tags || []} onChange={(tags) => updateClient(c.id, { tags })} />
        ) : c.tags?.length > 0 ? (
          <div className="tag-pills">{c.tags.map((t) => <span className="tag-pill" key={t}>{t}</span>)}</div>
        ) : "—";
      case "invoices":
        return stats.count;
      case "total":
        return formatCurrency(stats.total);
      case "last":
        return stats.lastDate ? formatShortDate(stats.lastDate) : "—";
      default:
        return null;
    }
  }

  const filtered = sortClients(
    clients.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (c.name || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q);
      const matchFavorite = favoriteFilter === "all" || !!c.favorite;
      const matchBalance = balanceFilter === "all" || (allStats[c.id]?.outstanding || 0) > 0;
      return matchSearch && matchFavorite && matchBalance;
    }),
    allStats,
    sortBy
  );

  return (
    <div className="hub-page">
      <div className="hub-page__head">
        <h1 className="hub-page__title">Clients</h1>
        <div className="hub-page__head-actions">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setEditMode((v) => !v)}
          >
            {editMode ? "Done editing" : "Edit"}
          </button>
          <button type="button" className="btn btn--primary" onClick={startNew}>
            + Add Client
          </button>
        </div>
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
          <FilterIcon />
          <select
            className="input"
            value={favoriteFilter}
            onChange={(e) => setFavoriteFilter(e.target.value)}
            aria-label="Filter by favorite"
          >
            <option value="all">All clients</option>
            <option value="favorites">Favorites only</option>
          </select>
        </div>
        <div className="select-field">
          <FilterIcon />
          <select
            className="input"
            value={balanceFilter}
            onChange={(e) => setBalanceFilter(e.target.value)}
            aria-label="Filter by outstanding balance"
          >
            <option value="all">Any balance</option>
            <option value="outstanding">Outstanding balance</option>
          </select>
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
          <p>
            {search || favoriteFilter !== "all" || balanceFilter !== "all"
              ? "No clients match your search and filters."
              : "No clients yet."}
          </p>
          {!search && favoriteFilter === "all" && balanceFilter === "all" && (
            <button type="button" className="btn btn--primary" onClick={startNew}>
              Add your first client
            </button>
          )}
        </div>
      ) : (
        <div className="inv-table-wrap">
          <table className={`inv-table client-table${editMode ? " client-table--editing" : ""}`}>
            <thead>
              <tr>
                <th></th>
                {columnOrder.map((key) => (
                  <th
                    key={key}
                    draggable
                    onDragStart={(e) => { e.dataTransfer.setData("text/plain", key); e.dataTransfer.effectAllowed = "move"; setDragKey(key); }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => { moveColumn(dragKey, key); setDragKey(null); }}
                    onDragEnd={() => setDragKey(null)}
                    className="client-table__th--draggable"
                    title="Drag to reorder columns"
                  >
                    {ALL_COLUMNS[key].label}
                  </th>
                ))}
                {editMode && <th>Remove</th>}
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
                    {columnOrder.map((key) => (
                      <td
                        key={key}
                        style={editMode ? undefined : {
                          maxWidth: ALL_COLUMNS[key].width,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {renderCell(key, c, stats)}
                      </td>
                    ))}
                    {editMode && (
                      <td>
                        <button
                          type="button"
                          className="icon-btn icon-btn--delete"
                          onClick={() => handleDelete(c)}
                          title="Delete client"
                          aria-label={`Delete ${c.name}`}
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    )}
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
