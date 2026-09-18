import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { listInvoices, deleteInvoice, updateInvoiceStatus, effectiveStatus } from "../lib/db.js";
import { formatCurrency } from "../lib/money.js";
import { formatShortDate } from "../lib/dates.js";
import { StatusBadge } from "./HubPage.jsx";
import { SearchIcon, SortIcon } from "../components/icons.jsx";
import Select from "../components/Select.jsx";

const STATUSES = ["all", "draft", "sent", "overdue", "paid"];
const STATUS_LABEL = { all: "All", draft: "Draft", sent: "Sent", overdue: "Overdue", paid: "Paid" };

const SORT_OPTIONS = [
  { value: "date-desc", label: "Newest first" },
  { value: "date-asc", label: "Oldest first" },
  { value: "amount-desc", label: "Amount: high to low" },
  { value: "amount-asc", label: "Amount: low to high" },
  { value: "client", label: "Client name" },
  { value: "status", label: "Status" },
];

function sortInvoices(invoices, sortBy) {
  const copy = [...invoices];
  switch (sortBy) {
    case "date-asc": return copy.sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
    case "amount-desc": return copy.sort((a, b) => (b.total || 0) - (a.total || 0));
    case "amount-asc": return copy.sort((a, b) => (a.total || 0) - (b.total || 0));
    case "client": return copy.sort((a, b) => (a.client?.name ?? "").localeCompare(b.client?.name ?? ""));
    case "status": return copy.sort((a, b) => (a._status ?? "").localeCompare(b._status ?? ""));
    default: return copy.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  }
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const filter = STATUSES.includes(searchParams.get("status")) ? searchParams.get("status") : "all";

  function setFilter(s) {
    if (s === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ status: s });
    }
  }

  function load() { setInvoices(listInvoices()); }
  useEffect(() => { load(); }, []);

  const withStatus = invoices.map((inv) => ({ ...inv, _status: effectiveStatus(inv) }));

  const filtered = sortInvoices(
    withStatus.filter((inv) => {
      const matchStatus = filter === "all" || inv._status === filter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (inv.number || "").toLowerCase().includes(q) ||
        (inv.client?.name || "").toLowerCase().includes(q) ||
        (inv.client?.email || "").toLowerCase().includes(q);
      return matchStatus && matchSearch;
    }),
    sortBy
  );

  function handleDelete(inv) {
    if (!window.confirm(`Delete Invoice #${inv.number || "(no number)"}? This cannot be undone.`)) return;
    deleteInvoice(inv.id);
    load();
  }

  function handleStatusChange(inv, newStatus) {
    const label = newStatus === "paid" ? "paid" : "sent";
    if (!window.confirm(`Mark Invoice #${inv.number} as ${label}?`)) return;
    updateInvoiceStatus(inv.id, newStatus);
    load();
  }

  return (
    <div className="hub-page">
      <div className="hub-page__head">
        <h1 className="hub-page__title">Invoices</h1>
        <Link to="/invoices/new" className="btn btn--primary">+ New Invoice</Link>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-field">
          <SearchIcon />
          <input
            className="input"
            type="search"
            placeholder="Search by number, client…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="select-field">
          <SortIcon />
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={SORT_OPTIONS}
            ariaLabel="Sort invoices"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs filter-tabs--row">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className={`filter-tab filter-tab--${s}${filter === s ? " filter-tab--active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {STATUS_LABEL[s]}
            <span className="filter-tab__count">
              {s === "all" ? withStatus.length : withStatus.filter((i) => i._status === s).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>{search || filter !== "all" ? "No invoices match your filters." : "No invoices yet."}</p>
          {!search && filter === "all" && (
            <Link to="/invoices/new" className="btn btn--primary">Create your first invoice</Link>
          )}
        </div>
      ) : (
        <div className="inv-table-wrap">
          <table className="inv-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Issued</th>
                <th>Due</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id}>
                  <td className="inv-table__num">{inv.number || "—"}</td>
                  <td>
                    <div>{inv.client?.name || "—"}</div>
                    {inv.client?.email && <div className="inv-table__sub">{inv.client.email}</div>}
                  </td>
                  <td>{formatCurrency(inv.total || 0)}</td>
                  <td>{formatShortDate(inv.dateIssued)}</td>
                  <td>{formatShortDate(inv.dueDate)}</td>
                  <td><StatusBadge status={inv._status} /></td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/invoices/${inv.id}`} className="btn btn--ghost btn--sm">Edit</Link>
                      {inv.status === "draft" && (
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => handleStatusChange(inv, "sent")}>
                          Mark sent
                        </button>
                      )}
                      {(inv.status === "sent" || inv._status === "overdue") && (
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => handleStatusChange(inv, "paid")}>
                          Mark paid
                        </button>
                      )}
                      <button type="button" className="btn btn--danger btn--sm" onClick={() => handleDelete(inv)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
