import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { listClients, saveClient, listInvoices, deleteClient, effectiveStatus } from "../lib/db.js";
import { listJobs, JOB_STATUS_LABEL } from "../lib/jobs.js";
import { formatCurrency } from "../lib/money.js";
import { formatShortDate } from "../lib/dates.js";
import { StatusBadge } from "./HubPage.jsx";
import TagInput from "../components/TagInput.jsx";
import AddressAutocomplete from "../components/AddressAutocomplete.jsx";
import { StarIcon } from "../components/icons.jsx";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(undefined);
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const emailInvalid = emailTouched && form?.email && !EMAIL_RE.test(form.email);

  useEffect(() => {
    const c = listClients().find((cl) => cl.id === id);
    setClient(c ?? null);
    if (c) {
      setJobs(listJobs().filter((j) => j.clientId === c.id || j.clientName === c.name));
      setInvoices(listInvoices().filter((inv) => inv.clientId === c.id || inv.client?.name === c.name));
    }
  }, [id]);

  if (client === undefined) return null;

  if (client === null) {
    return (
      <div className="hub-page">
        <p>Client not found. <Link to="/clients" className="link">Back to clients</Link></p>
      </div>
    );
  }

  const withStatus = invoices.map((inv) => ({ ...inv, _status: effectiveStatus(inv) }));
  const totalBilled = withStatus.reduce((s, i) => s + (i.total || 0), 0);
  const outstanding = withStatus
    .filter((i) => i._status === "sent" || i._status === "overdue")
    .reduce((s, i) => s + (i.total || 0), 0);

  function handleDelete() {
    if (!window.confirm(`Delete ${client.name}? This only removes the client record — jobs and invoices are kept.`)) return;
    deleteClient(client.id);
    navigate("/clients");
  }

  function updateTags(tags) {
    saveClient({ ...client, tags });
    setClient((c) => ({ ...c, tags }));
  }

  function toggleFavorite() {
    const favorite = !client.favorite;
    saveClient({ ...client, favorite });
    setClient((c) => ({ ...c, favorite }));
  }

  function startEdit() {
    setForm({ ...client });
    setEmailTouched(false);
    setEditMode(true);
  }

  function cancelEdit() {
    setEditMode(false);
    setForm(null);
  }

  function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    saveClient(form);
    setClient(form);
    setEditMode(false);
    setForm(null);
  }

  return (
    <div className="hub-page">
      <Link to="/clients" className="editor__back">← Back to clients</Link>
      <div className="hub-page__head">
        <h1 className="hub-page__title">{client.name}</h1>
        <div className="hub-page__head-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={toggleFavorite}
            title={client.favorite ? "Unfavorite" : "Favorite"}
            aria-label={client.favorite ? "Unfavorite this client" : "Favorite this client"}
            style={{ color: client.favorite ? "#C9AE7C" : undefined }}
          >
            <StarIcon filled={!!client.favorite} />
          </button>
          {!editMode && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={startEdit}>Edit</button>
          )}
          <button type="button" className="btn btn--danger btn--sm" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      {/* Contact info */}
      <div className="hub-section">
        <div className="hub-section__head">
          <h2 className="hub-section__title">Contact Information</h2>
        </div>
        {editMode ? (
          <form onSubmit={handleSave} style={{ padding: "16px 20px" }}>
            <div className="field">
              <label className="field__label">Name *</label>
              <input className="input" value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required autoFocus />
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field__label">Email</label>
                <input className={`input${emailInvalid ? " input--error" : ""}`} type="email" value={form.email || ""}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  onBlur={() => setEmailTouched(true)} />
                {emailInvalid && <p className="field__hint field__hint--error">Please enter a valid email address.</p>}
              </div>
              <div className="field">
                <label className="field__label">Phone</label>
                <input className="input" value={form.phone || ""}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="field">
              <label className="field__label">Address</label>
              <AddressAutocomplete
                className="input"
                value={form.address1 || ""}
                onChange={(v) => setForm((f) => ({ ...f, address1: v }))}
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field__label">Website</label>
                <input className="input" type="url" placeholder="https://…" value={form.website || ""}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
              </div>
              <div className="field">
                <label className="field__label">Social channels</label>
                <input className="input" placeholder="@handle or links, comma separated" value={form.social || ""}
                  onChange={(e) => setForm((f) => ({ ...f, social: e.target.value }))} />
              </div>
            </div>
            <div className="field">
              <label className="field__label">Notes</label>
              <textarea className="input settings-textarea" rows={3} value={form.notes || ""}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn--primary">Save changes</button>
              <button type="button" className="btn btn--ghost" onClick={cancelEdit}>Cancel</button>
            </div>
          </form>
        ) : (
          <div style={{ padding: "16px 20px" }}>
            <div className="field-row">
              <div className="field">
                <span className="field__label">Email</span>
                <div className="settings-readonly">
                  {client.email ? <a className="link" href={`mailto:${client.email}`}>{client.email}</a> : "—"}
                </div>
              </div>
              <div className="field">
                <span className="field__label">Phone</span>
                <div className="settings-readonly">{client.phone || "—"}</div>
              </div>
            </div>
            <div className="field">
              <span className="field__label">Address</span>
              <div className="settings-readonly">{client.address1 || "—"}</div>
            </div>
            <div className="field-row">
              <div className="field">
                <span className="field__label">Website</span>
                <div className="settings-readonly">{client.website || "—"}</div>
              </div>
              <div className="field">
                <span className="field__label">Social channels</span>
                <div className="settings-readonly">{client.social || "—"}</div>
              </div>
            </div>
            {client.notes && (
              <div className="field">
                <span className="field__label">Notes</span>
                <div className="settings-readonly settings-readonly--pre">{client.notes}</div>
              </div>
            )}
            <div className="field">
              <span className="field__label">Tags</span>
              <TagInput tags={client.tags || []} onChange={updateTags} />
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="hub-section">
        <div className="hub-section__head">
          <h2 className="hub-section__title">Summary</h2>
        </div>
        <div style={{ padding: "16px 20px" }} className="field-row">
          <div className="field">
            <span className="field__label">Total billed</span>
            <div className="settings-readonly">{formatCurrency(totalBilled)}</div>
          </div>
          <div className="field">
            <span className="field__label">Outstanding</span>
            <div className="settings-readonly">{formatCurrency(outstanding)}</div>
          </div>
        </div>
      </div>

      {/* Job history */}
      <div className="hub-section">
        <div className="hub-section__head">
          <h2 className="hub-section__title">Job History</h2>
          <Link to="/jobs" className="dash-see-all">All jobs</Link>
        </div>
        {jobs.length === 0 ? (
          <div style={{ padding: "20px" }} className="settings-card__hint">No jobs for this client yet.</div>
        ) : (
          <div className="inv-table-wrap">
            <table className="inv-table">
              <thead>
                <tr><th>Date</th><th>Address</th><th>Status</th></tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id}>
                    <td>{j.date ? formatShortDate(j.date) : "—"}</td>
                    <td><Link to={`/jobs/${j.id}`} className="link">{j.address}</Link></td>
                    <td><span className={`status-badge status-badge--${j.status}`}>{JOB_STATUS_LABEL[j.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="hub-section">
        <div className="hub-section__head">
          <h2 className="hub-section__title">Invoices</h2>
          <Link to="/invoices" className="dash-see-all">All invoices</Link>
        </div>
        {withStatus.length === 0 ? (
          <div style={{ padding: "20px" }} className="settings-card__hint">No invoices for this client yet.</div>
        ) : (
          <div className="inv-table-wrap">
            <table className="inv-table">
              <thead>
                <tr><th>#</th><th>Amount</th><th>Due</th><th>Status</th></tr>
              </thead>
              <tbody>
                {withStatus.map((inv) => (
                  <tr key={inv.id}>
                    <td className="inv-table__num"><Link to={`/invoices/${inv.id}`} className="link">{inv.number || "—"}</Link></td>
                    <td>{formatCurrency(inv.total || 0)}</td>
                    <td>{formatShortDate(inv.dueDate)}</td>
                    <td><StatusBadge status={inv._status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
