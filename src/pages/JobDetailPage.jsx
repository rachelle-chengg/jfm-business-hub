import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getJob, saveJob, deleteJob, JOB_STATUSES, JOB_STATUS_LABEL } from "../lib/jobs.js";
import { listClients, listInvoices } from "../lib/db.js";
import { createInvoice } from "../lib/invoice.js";
import { formatShortDate, todayISO } from "../lib/dates.js";
import { formatCurrency } from "../lib/money.js";

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(undefined);
  const [clients, setClients] = useState([]);
  const [linkedInvoice, setLinkedInvoice] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelForm, setCancelForm] = useState({ reason: "", date: todayISO() });

  function load() {
    const j = getJob(id);
    setJob(j ?? null);
    setClients(listClients());
    if (j) {
      const inv = listInvoices().find((i) => i.jobId === j.id);
      setLinkedInvoice(inv ?? null);
    }
  }

  useEffect(() => { load(); }, [id]);

  if (job === undefined) return null;

  if (job === null) {
    return (
      <div className="hub-page">
        <p>Job not found. <Link to="/jobs" className="link">Back to jobs</Link></p>
      </div>
    );
  }

  const client = clients.find((c) => c.id === job.clientId);

  function updateJob(patch) {
    saveJob({ ...job, ...patch });
    load();
  }

  function handleDelete() {
    if (!window.confirm(`Delete this job at ${job.address}? This cannot be undone.`)) return;
    deleteJob(job.id);
    navigate("/jobs");
  }

  function createInvoiceFromJob() {
    const base = createInvoice({ invoiceNumber: `${String(new Date().getFullYear()).slice(-2)}001` });
    const prefill = {
      ...base,
      jobId: job.id,
      client: {
        ...base.client,
        name: job.clientName || "",
      },
      items: [
        {
          id: `li-${Date.now().toString(36)}`,
          description: job.package ? `${job.package} — ${job.address}` : job.address,
          amount: "",
        },
      ],
    };
    navigate("/invoices/new", { state: { initialInvoice: prefill } });
  }

  function markDelivered() {
    updateJob({ status: "delivered", deliveredDate: todayISO() });
  }

  function submitCancellation(e) {
    e.preventDefault();
    updateJob({
      status: "cancelled",
      cancellationReason: cancelForm.reason,
      cancelledDate: cancelForm.date,
    });
    setCancelling(false);
  }

  return (
    <div className="hub-page">
      <Link to="/jobs" className="editor__back">← Back to jobs</Link>
      <div className="hub-page__head">
        <div>
          <h1 className="hub-page__title">{job.address}</h1>
        </div>
        <div className="hub-page__head-actions">
          <span className={`status-badge status-badge--${job.status}`}>{JOB_STATUS_LABEL[job.status]}</span>
          <button type="button" className="btn btn--danger btn--sm" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      {/* Shoot Information */}
      <div className="hub-section">
        <div className="hub-section__head">
          <h2 className="hub-section__title">Shoot Information</h2>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <div className="field-row">
            <div className="field">
              <span className="field__label">Client</span>
              <div className="settings-readonly">
                {client ? <Link to={`/clients/${client.id}`} className="link">{client.name}</Link> : (job.clientName || "—")}
              </div>
            </div>
            <div className="field">
              <span className="field__label">Date &amp; time</span>
              <div className="settings-readonly">
                {job.date ? formatShortDate(job.date) : "—"}{job.time ? ` · ${job.time}` : ""}
              </div>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <span className="field__label">Package / shoot type</span>
              <div className="settings-readonly">{job.package || "—"}</div>
            </div>
            <div className="field">
              <span className="field__label">Drone required</span>
              <div className="settings-readonly">{job.droneRequired ? "Yes" : "No"}</div>
            </div>
          </div>
          {job.notes && (
            <div className="field">
              <span className="field__label">Notes</span>
              <div className="settings-readonly">{job.notes}</div>
            </div>
          )}
          <div className="field">
            <span className="field__label">Status</span>
            <select
              className="input"
              style={{ maxWidth: 220 }}
              value={job.status}
              onChange={(e) => updateJob({ status: e.target.value })}
            >
              {JOB_STATUSES.map((s) => (
                <option key={s} value={s}>{JOB_STATUS_LABEL[s]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Invoice */}
      <div className="hub-section">
        <div className="hub-section__head">
          <h2 className="hub-section__title">Invoice</h2>
        </div>
        <div style={{ padding: "16px 20px" }}>
          {linkedInvoice ? (
            <div className="inv-list-item" style={{ padding: 0 }}>
              <div className="inv-list-item__body">
                <span className="inv-list-item__name">#{linkedInvoice.number || "—"}</span>
                <span className="inv-list-item__sub">{formatCurrency(linkedInvoice.total || 0)}</span>
              </div>
              <Link to={`/invoices/${linkedInvoice.id}`} className="btn btn--ghost btn--sm">View invoice</Link>
            </div>
          ) : (
            <>
              <p className="settings-card__hint" style={{ margin: "0 0 12px" }}>
                No invoice linked to this job yet.
              </p>
              <button type="button" className="btn btn--primary btn--sm" onClick={createInvoiceFromJob}>
                Create invoice from this job
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delivery */}
      <div className="hub-section">
        <div className="hub-section__head">
          <h2 className="hub-section__title">Delivery</h2>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <div className="field-row">
            <div className="field">
              <label className="field__label">Gallery link</label>
              <input
                className="input"
                placeholder="https://…"
                value={job.galleryLink || ""}
                onChange={(e) => updateJob({ galleryLink: e.target.value })}
              />
            </div>
            <div className="field">
              <span className="field__label">Delivered date</span>
              <div className="settings-readonly">{job.deliveredDate ? formatShortDate(job.deliveredDate) : "—"}</div>
            </div>
          </div>
          {job.status !== "delivered" && job.status !== "cancelled" && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={markDelivered}>Mark delivered</button>
          )}
        </div>
      </div>

      {/* Cancellation */}
      <div className="hub-section">
        <div className="hub-section__head">
          <h2 className="hub-section__title">Cancellation</h2>
        </div>
        <div style={{ padding: "16px 20px" }}>
          {job.status === "cancelled" ? (
            <>
              <div className="field">
                <span className="field__label">Cancelled</span>
                <div className="settings-readonly">{job.cancelledDate ? formatShortDate(job.cancelledDate) : "—"}</div>
              </div>
              <div className="field">
                <span className="field__label">Reason</span>
                <div className="settings-readonly">{job.cancellationReason || "—"}</div>
              </div>
            </>
          ) : cancelling ? (
            <form onSubmit={submitCancellation}>
              <div className="field-row">
                <div className="field">
                  <label className="field__label">Cancellation date</label>
                  <input className="input" type="date" value={cancelForm.date}
                    onChange={(e) => setCancelForm((f) => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="field__label">Reason</label>
                  <input className="input" value={cancelForm.reason}
                    onChange={(e) => setCancelForm((f) => ({ ...f, reason: e.target.value }))} />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn--danger">Confirm cancellation</button>
                <button type="button" className="btn btn--ghost" onClick={() => setCancelling(false)}>Back</button>
              </div>
            </form>
          ) : (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setCancelling(true)}>
              Cancel this job
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
