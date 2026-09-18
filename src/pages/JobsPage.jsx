import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { listJobs, saveJob, deleteJob, updateJobStatus, JOB_STATUSES, JOB_STATUS_LABEL } from "../lib/jobs.js";
import { listClients } from "../lib/db.js";
import { formatShortDate } from "../lib/dates.js";
import Modal from "../components/Modal.jsx";
import AddressAutocomplete from "../components/AddressAutocomplete.jsx";
import TagInput from "../components/TagInput.jsx";
import { SearchIcon, FilterIcon, SortIcon, MenuIcon } from "../components/icons.jsx";

const FILTER_TABS = ["all", ...JOB_STATUSES];

const SORT_OPTIONS = [
  { value: "date-asc", label: "Date: soonest first" },
  { value: "date-desc", label: "Date: latest first" },
  { value: "client", label: "Client name" },
  { value: "address", label: "Address" },
  { value: "status", label: "Status" },
];

function sortJobs(jobs, sortBy) {
  const copy = [...jobs];
  switch (sortBy) {
    case "date-desc": return copy.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
    case "client": return copy.sort((a, b) => (a.clientName ?? "").localeCompare(b.clientName ?? ""));
    case "address": return copy.sort((a, b) => (a.address ?? "").localeCompare(b.address ?? ""));
    case "status": return copy.sort((a, b) => (a.status ?? "").localeCompare(b.status ?? ""));
    default: return copy.sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  }
}

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date-asc");
  const [droneFilter, setDroneFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [tabMenuOpen, setTabMenuOpen] = useState(false);
  const tabMenuRef = useRef(null);

  function load() {
    setJobs(listJobs());
    setClients(listClients());
  }

  useEffect(() => {
    function handleClick(e) {
      if (tabMenuRef.current && !tabMenuRef.current.contains(e.target)) setTabMenuOpen(false);
    }
    if (tabMenuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [tabMenuOpen]);

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
    saveJob({ ...form, id: editingId === "new" ? undefined : editingId });
    setEditingId(null);
    load();
  }

  function handleDelete(job) {
    if (!window.confirm(`Delete this job at ${job.address || "this address"}? This cannot be undone.`)) return;
    deleteJob(job.id);
    load();
  }

  function handleStatusChange(job, status) {
    updateJobStatus(job.id, status);
    load();
  }

  const filtered = sortJobs(
    jobs.filter((j) => {
      const matchStatus = filter === "all" || j.status === filter;
      const matchDrone = droneFilter === "all" || (droneFilter === "yes" ? !!j.droneRequired : !j.droneRequired);
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (j.address || "").toLowerCase().includes(q) ||
        (j.clientName || "").toLowerCase().includes(q) ||
        (j.package || "").toLowerCase().includes(q);
      return matchStatus && matchDrone && matchSearch;
    }),
    sortBy
  );

  return (
    <div className="hub-page">
      <div className="hub-page__head">
        <h1 className="hub-page__title">Jobs</h1>
        <button type="button" className="btn btn--primary" onClick={startNew}>
          + Add Job
        </button>
      </div>

      {editingId !== null && (
        <Modal title={editingId === "new" ? "New job" : "Edit job"} onClose={cancelEdit}>
          <form onSubmit={handleSave}>
            <div className="field-row">
              <div className="field">
                <label className="field__label">Client</label>
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
                <label className="field__label">Property address</label>
                <AddressAutocomplete
                  className="input"
                  value={form.address}
                  onChange={(v) => setForm((f) => ({ ...f, address: v }))}
                />
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
            <div className="field">
              <label className="field__label">Assigned to</label>
              <input className="input" value={form.assignedTo}
                onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
                placeholder="e.g. Jonathan, or a second shooter's name" />
            </div>
            <label className="toggle">
              <input type="checkbox" checked={!!form.droneRequired}
                onChange={(e) => setForm((f) => ({ ...f, droneRequired: e.target.checked }))} />
              <span>Drone required</span>
            </label>
            <div className="field">
              <label className="field__label">Tags</label>
              <TagInput tags={form.tags} onChange={(tags) => setForm((f) => ({ ...f, tags }))} />
            </div>
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
        </Modal>
      )}

      {/* Toolbar: search, sort, drone filter */}
      <div className="toolbar">
        <div className="search-field">
          <SearchIcon />
          <input
            className="input"
            type="search"
            placeholder="Search by address, client, package…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="select-field">
          <FilterIcon />
          <select
            className="input"
            value={droneFilter}
            onChange={(e) => setDroneFilter(e.target.value)}
            aria-label="Filter by drone requirement"
          >
            <option value="all">All jobs</option>
            <option value="yes">Drone required</option>
            <option value="no">No drone</option>
          </select>
        </div>
        <div className="select-field">
          <SortIcon />
          <select
            className="input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort jobs"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-tabs-row">
        <div className="filter-tabs-menu" ref={tabMenuRef}>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setTabMenuOpen((v) => !v)}
            aria-label="Jump to a status"
            aria-expanded={tabMenuOpen}
          >
            <MenuIcon />
          </button>
          {tabMenuOpen && (
            <div className="filter-tabs-menu__dropdown">
              {FILTER_TABS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`filter-tabs-menu__item${filter === s ? " filter-tabs-menu__item--active" : ""}`}
                  onClick={() => { setFilter(s); setTabMenuOpen(false); }}
                >
                  <span>{s === "all" ? "All" : JOB_STATUS_LABEL[s]}</span>
                  <span>{s === "all" ? jobs.length : jobs.filter((j) => j.status === s).length}</span>
                </button>
              ))}
            </div>
          )}
        </div>
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
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>
            {search || filter !== "all" || droneFilter !== "all"
              ? "No jobs match your filters."
              : "No jobs yet — this is where you'll track shoots from booking through delivery."}
          </p>
          {!search && filter === "all" && droneFilter === "all" && (
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
                  <td>
                    <Link to={`/jobs/${job.id}`} className="link">{job.address || "Untitled job"}</Link>
                    {job.tags?.length > 0 && (
                      <div className="tag-pills" style={{ marginTop: 6 }}>
                        {job.tags.map((t) => <span className="tag-pill" key={t}>{t}</span>)}
                      </div>
                    )}
                  </td>
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
    assignedTo: "",
    tags: [],
    notes: "",
    status: "inquiry",
  };
}
