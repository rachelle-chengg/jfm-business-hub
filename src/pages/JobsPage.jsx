import { useEffect, useState } from "react";
import { listJobs, saveJob, deleteJob, updateJobStatus, JOB_STATUSES, JOB_STATUS_LABEL } from "../lib/jobs.js";
import { listClients } from "../lib/db.js";
import { formatShortDate } from "../lib/dates.js";

const FILTER_TABS = ["all", ...JOB_STATUSES];

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());

  function load() {
    setJobs(listJobs());
    setClients(listClients());
  }

  useEffect(() => { load(); }, []);

  function startEdit(job) {
    setForm({ ...emptyForm(), ...job });
    setEditingId(job.id);
  }

  function startNew() {
    setForm(emptyForm());
    setEditingId("new");
  }

  function cancelEdit() { setEditingId(null); }

  function handleSave(e) {
    e.preventDefault();
    if (!form.clientName.trim() || !form.address.trim()) return;
    saveJob({ ...form, id: editingId === "new" ? undefined : editingId });
    setEditingId(null);
    load();
  }

  function handleDelete(job) {
    if (!window.confirm(`Delete this job at ${job.address}? This cannot be undone.`)) return;
    deleteJob(job.id);
    load();
  }

  function handleStatusChange(job, status) {
    updateJobStatus(job.id, status);
    load();
  }

  const filtered = jobs
    .filter((j) => filter === "all" || j.status === filter)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

  return (
    <div className="hub-page">
      <div className="hub-page__head">
        <h1 className="hub-page__title">Jobs</h1>
        <button type="button" className="btn btn--primary" onClick={startNew}>
          + Add Job
        </button>
      </div>

      {editingId !== null && (
        <div className="client-form-card">
          <h3 className="client-form-card__title">
            {editingId === "new" ? "New job" : "Edit job"}
          </h3>
          <form onSubmit={handleSave}>
            <div className="field-row">
              <div className="field">
                <label className="field__label">Client *</label>
                <select
                  className="input"
                  value={form.clientId || ""}
                  onChange={(e) => {
                    const c = clients.find((cl) => cl.id === e.target.value);
                    setForm((f) => ({ ...f, clientId: e.target.value, clientName: c?.name || f.clientName }));
                  }}
                >
                  <option value="">Select a client…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="field__label">Property address *</label>
                <input className="input" value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} required />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field__label">Date</label>
                <input className="input" type="date" value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="field">
                <label className="field__label">Time</label>
                <input className="input" type="time" value={form.time}
                  onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field__label">Package / shoot type</label>
                <input className="input" value={form.package}
                  onChange={(e) => setForm((f) => ({ ...f, package: e.target.value }))}
                  placeholder="e.g. Standard listing package" />
              </div>
              <div className="field">
                <label className="field__label">Status</label>
                <select className="input" value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  {JOB_STATUSES.map((s) => (
                    <option key={s} value={s}>{JOB_STATUS_LABEL[s]}</option>
                  ))}
                </select>
              </div>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={!!form.droneRequired}
                onChange={(e) => setForm((f) => ({ ...f, droneRequired: e.target.checked }))} />
              <span>Drone required</span>
            </label>
            <div className="field">
              <label className="field__label">Notes</label>
              <input className="input" value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn--primary">
                {editingId === "new" ? "Add job" : "Save changes"}
              </button>
              <button type="button" className="btn btn--ghost" onClick={cancelEdit}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="filter-tabs">
        {FILTER_TABS.map((s) => (
          <button
            key={s}
            type="button"
            className={`filter-tab${filter === s ? " filter-tab--active filter-tab--all" : ""}`}
            onClick={() => setFilter(s)}
          >
            {s === "all" ? "All" : JOB_STATUS_LABEL[s]}
            <span className="filter-tab__count">
              {s === "all" ? jobs.length : jobs.filter((j) => j.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>{filter !== "all" ? `No ${JOB_STATUS_LABEL[filter].toLowerCase()} jobs.` : "No jobs yet — this is where you'll track shoots from booking through delivery."}</p>
          {filter === "all" && (
            <button type="button" className="btn btn--primary" onClick={startNew}>Add your first job</button>
          )}
        </div>
      ) : (
        <div className="inv-table-wrap">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Client</th>
                <th>Address</th>
                <th>Package</th>
                <th>Drone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((job) => (
                <tr key={job.id}>
                  <td>
                    <div>{job.date ? formatShortDate(job.date) : "—"}</div>
                    {job.time && <div className="inv-table__sub">{job.time}</div>}
                  </td>
                  <td>{job.clientName || "—"}</td>
                  <td>{job.address}</td>
                  <td>{job.package || "—"}</td>
                  <td>{job.droneRequired ? "Yes" : "—"}</td>
                  <td>
                    <span className={`status-badge status-badge--${job.status}`}>
                      {JOB_STATUS_LABEL[job.status] ?? job.status}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => startEdit(job)}>Edit</button>
                      {job.status !== "cancelled" && (
                        <select
                          className="input btn--sm"
                          style={{ width: "auto", height: 28, fontSize: "12.5px" }}
                          value={job.status}
                          onChange={(e) => handleStatusChange(job, e.target.value)}
                          aria-label="Change status"
                        >
                          {JOB_STATUSES.map((s) => (
                            <option key={s} value={s}>{JOB_STATUS_LABEL[s]}</option>
                          ))}
                        </select>
                      )}
                      <button type="button" className="btn btn--danger btn--sm" onClick={() => handleDelete(job)}>Delete</button>
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

function emptyForm() {
  return {
    clientId: "",
    clientName: "",
    address: "",
    date: "",
    time: "",
    package: "",
    droneRequired: false,
    notes: "",
    status: "inquiry",
  };
}
