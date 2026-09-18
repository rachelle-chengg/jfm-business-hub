import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { listClients, saveClient, listInvoices, deleteClient, effectiveStatus } from "../lib/db.js";
import { listJobs, JOB_STATUS_LABEL } from "../lib/jobs.js";
import { formatCurrency } from "../lib/money.js";
import { formatShortDate } from "../lib/dates.js";
import { StatusBadge } from "./HubPage.jsx";
import TagInput from "../components/TagInput.jsx";
import { StarIcon } from "../components/icons.jsx";

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(undefined);
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);

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
          <button type="button" className="btn btn--danger btn--sm" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      {/* Contact info */}
      <div className="hub-section">
        <div className="hub-section__head">
          <h2 className="hub-section__title">Contact Information</h2>
        </div>
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
