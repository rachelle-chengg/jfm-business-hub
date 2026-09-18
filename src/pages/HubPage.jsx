import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listInvoices, effectiveStatus } from "../lib/db.js";
import { listJobs, JOB_STATUS_LABEL } from "../lib/jobs.js";
import { buildReminders } from "../lib/reminders.js";
import { formatCurrency } from "../lib/money.js";
import { formatShortDate, todayISO, addDays } from "../lib/dates.js";
import { loadSettings } from "../lib/settings.js";

const STATUS_LABEL = { draft: "Draft", sent: "Sent", paid: "Paid", overdue: "Overdue" };
const AVATAR_COLORS = ["#2C3930", "#35507D", "#9A4632", "#6B675C", "#5B4636", "#4A5D52"];

function avatarColor(name) {
  if (!name) return "#948C7E";
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function HubPage() {
  const [invoices, setInvoices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [listFilter, setListFilter] = useState("all");
  const [balanceVisible, setBalanceVisible] = useState(true);
  const businessName = loadSettings().business.shortName || loadSettings().business.name || "there";

  useEffect(() => {
    setInvoices(listInvoices());
    setJobs(listJobs());
  }, []);

  const withStatus = invoices.map((inv) => ({ ...inv, _status: effectiveStatus(inv) }));
  const reminders = buildReminders(invoices);

  const today = todayISO();
  const tomorrow = addDays(today, 1);
  const todaysJobs = jobs.filter((j) => j.date === today).sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
  const tomorrowsJobs = jobs.filter((j) => j.date === tomorrow).sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
  const scheduleJobs = [...todaysJobs, ...tomorrowsJobs];

  const unconfirmedJobs = jobs
    .filter((j) => j.status === "booked")
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

  const attentionCount = reminders.length + unconfirmedJobs.length;

  const outstanding = withStatus
    .filter((i) => i._status === "sent" || i._status === "overdue")
    .reduce((s, i) => s + (i.total || 0), 0);
  const sentCount = withStatus.filter((i) => i._status === "sent").length;
  const overdueCount = withStatus.filter((i) => i._status === "overdue").length;
  const paid = withStatus.filter((i) => i._status === "paid").reduce((s, i) => s + (i.total || 0), 0);
  const total = withStatus.reduce((s, i) => s + (i.total || 0), 0);

  const filtered = [...withStatus]
    .filter((i) => listFilter === "all" || i._status === listFilter)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 8);

  function copyEmail(reminder, id) {
    const text = `Subject: ${reminder.emailSubject}\n\n${reminder.emailBody}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  }

  const LIST_TABS = ["all", "draft", "sent", "overdue", "paid"];

  return (
    <div className="hub-page hub-page--dashboard">
      {/* Greeting */}
      <div className="dash-greeting">
        <div>
          <h1 className="dash-greeting__name">Hi, {businessName} 👋</h1>
          <p className="dash-greeting__sub">Welcome back</p>
        </div>
        {attentionCount > 0 && (
          <div className="dash-greeting__bell" title={`${attentionCount} item${attentionCount !== 1 ? "s" : ""} need attention`}>
            <BellIcon />
            <span className="dash-greeting__bell-badge">{attentionCount}</span>
          </div>
        )}
      </div>

      {/* Today's Schedule */}
      {scheduleJobs.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <div className="dash-section-head">
            <h2 className="dash-section-title">Today's Schedule</h2>
            <Link to="/jobs" className="dash-see-all">See all</Link>
          </div>
          <div className="inv-list">
            {todaysJobs.map((job) => (
              <div className="job-row" key={job.id}>
                <span className="job-row__time">{job.time || "—"}</span>
                <div className="job-row__body">
                  <div className="job-row__address">{job.address}</div>
                  <div className="job-row__sub">{job.clientName || "—"}{job.package ? ` · ${job.package}` : ""}</div>
                </div>
                <span className={`status-badge status-badge--${job.status}`}>{JOB_STATUS_LABEL[job.status]}</span>
              </div>
            ))}
            {tomorrowsJobs.map((job) => (
              <div className="job-row" key={job.id}>
                <span className="job-row__time">Tmrw {job.time || ""}</span>
                <div className="job-row__body">
                  <div className="job-row__address">{job.address}</div>
                  <div className="job-row__sub">{job.clientName || "—"}{job.package ? ` · ${job.package}` : ""}</div>
                </div>
                <span className={`status-badge status-badge--${job.status}`}>{JOB_STATUS_LABEL[job.status]}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Needs Attention */}
      {attentionCount > 0 && (
        <section className="reminders">
          {unconfirmedJobs.map((job) => (
            <div key={job.id} className="reminder reminder--info">
              <div className="reminder__body">
                <div className="reminder__icon">📅</div>
                <div>
                  <p className="reminder__title">
                    {job.address} needs confirmation{job.date ? ` — ${formatShortDate(job.date)}` : ""}
                  </p>
                  <p className="reminder__sub">{job.clientName || "—"} &bull; Booked</p>
                </div>
              </div>
              <Link to="/jobs" className="btn btn--ghost reminder__copy">Review</Link>
            </div>
          ))}
          {reminders.map((r) => {
            const id = r.invoice.id + r.type;
            const isOverdue = r.type === "overdue";
            return (
              <div key={id} className={`reminder reminder--${isOverdue ? "overdue" : "soon"}`}>
                <div className="reminder__body">
                  <div className="reminder__icon">{isOverdue ? "⚠️" : "🔔"}</div>
                  <div>
                    <p className="reminder__title">
                      {isOverdue
                        ? `Invoice #${r.invoice.number} is ${r.daysOverdue} day${r.daysOverdue === 1 ? "" : "s"} overdue`
                        : `Invoice #${r.invoice.number} is due in ${r.daysUntilDue} day${r.daysUntilDue === 1 ? "" : "s"}`}
                    </p>
                    <p className="reminder__sub">
                      {r.invoice.client?.name || "—"} &bull; {formatCurrency(r.invoice.total)}
                      {isOverdue && (
                        <> &bull; Interest: {formatCurrency(r.interest)} &bull; <strong>Total: {formatCurrency(r.totalOwing)}</strong></>
                      )}
                    </p>
                  </div>
                </div>
                <button type="button" className="btn btn--ghost reminder__copy" onClick={() => copyEmail(r, id)}>
                  {copiedId === id ? "✓ Copied!" : "Copy email"}
                </button>
              </div>
            );
          })}
        </section>
      )}

      {/* Hero card */}
      <div className="hero-card">
        <p className="hero-card__label">Outstanding balance</p>
        <div className="hero-card__amount-row">
          <span className="hero-card__amount">
            {balanceVisible ? formatCurrency(outstanding) : "••••••"}
          </span>
          <button className="hero-card__eye" onClick={() => setBalanceVisible((v) => !v)} aria-label="Toggle visibility">
            <EyeIcon open={balanceVisible} />
          </button>
        </div>
        <div className="hero-card__meta">
          {sentCount > 0 && <span>{sentCount} sent</span>}
          {overdueCount > 0 && <span className="hero-card__meta--warn">{overdueCount} overdue</span>}
          {sentCount === 0 && overdueCount === 0 && <span>All clear</span>}
        </div>
        <div className="hero-card__footer">
          <span className="hero-card__footer-label">Total invoiced</span>
          <span className="hero-card__footer-value">{formatCurrency(total)}</span>
          <span className="hero-card__footer-sep">·</span>
          <span className="hero-card__footer-label">Collected</span>
          <span className="hero-card__footer-value">{formatCurrency(paid)}</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="quick-actions">
        <Link to="/jobs" className="quick-action">
          <span className="quick-action__icon"><PlusIcon /></span>
          <span>Add Job</span>
        </Link>
        <Link to="/invoices/new" className="quick-action">
          <span className="quick-action__icon"><ListIcon /></span>
          <span>New Invoice</span>
        </Link>
        <Link to="/clients" className="quick-action">
          <span className="quick-action__icon"><PersonIcon /></span>
          <span>Clients</span>
        </Link>
        <Link to="/settings" className="quick-action">
          <span className="quick-action__icon"><GearIcon /></span>
          <span>Settings</span>
        </Link>
      </div>

      {/* Recent invoices */}
      <section>
        <div className="dash-section-head">
          <h2 className="dash-section-title">Recent Invoices</h2>
          <Link to="/invoices" className="dash-see-all">See all</Link>
        </div>

        {/* Filter tabs */}
        <div className="filter-tabs filter-tabs--compact">
          {LIST_TABS.map((s) => (
            <button
              key={s}
              type="button"
              className={`filter-tab filter-tab--${s}${listFilter === s ? " filter-tab--active" : ""}`}
              onClick={() => setListFilter(s)}
            >
              {s === "all" ? "All" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>{listFilter !== "all" ? `No ${listFilter} invoices.` : "No invoices yet."}</p>
            {listFilter === "all" && (
              <Link to="/invoices/new" className="btn btn--primary">Create your first invoice</Link>
            )}
          </div>
        ) : (
          <div className="inv-list">
            {filtered.map((inv) => {
              const clientName = inv.client?.name || "—";
              const initial = clientName[0]?.toUpperCase() ?? "?";
              return (
                <Link to={`/invoices/${inv.id}`} key={inv.id} className="inv-list-item">
                  <span
                    className="inv-list-item__avatar"
                    style={{ background: avatarColor(clientName) }}
                  >
                    {initial}
                  </span>
                  <span className="inv-list-item__body">
                    <span className="inv-list-item__name">{clientName}</span>
                    <span className="inv-list-item__sub">
                      #{inv.number || "—"} &bull; {formatShortDate(inv.dueDate) || "No due date"}
                    </span>
                  </span>
                  <span className="inv-list-item__right">
                    <span className={`inv-list-item__amount inv-list-item__amount--${inv._status}`}>
                      {formatCurrency(inv.total || 0)}
                    </span>
                    <StatusBadge status={inv._status} />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export function StatusBadge({ status }) {
  const labels = { draft: "Draft", sent: "Sent", paid: "Paid", overdue: "Overdue" };
  return (
    <span className={`status-badge status-badge--${status}`}>
      {labels[status] ?? status}
    </span>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function PlusIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}

function ListIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="3" cy="6" r="1" fill="currentColor" /><circle cx="3" cy="12" r="1" fill="currentColor" /><circle cx="3" cy="18" r="1" fill="currentColor" /></svg>;
}

function PersonIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
}

function GearIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
}
