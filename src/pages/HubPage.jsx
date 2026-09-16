import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listInvoices, effectiveStatus } from "../lib/db.js";
import { buildReminders } from "../lib/reminders.js";
import { formatCurrency } from "../lib/money.js";
import { formatShortDate } from "../lib/dates.js";

const STATUS_LABEL = { draft: "Draft", sent: "Sent", paid: "Paid", overdue: "Overdue" };

export default function HubPage() {
  const [invoices, setInvoices] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    setInvoices(listInvoices());
  }, []);

  const withStatus = invoices.map((inv) => ({ ...inv, _status: effectiveStatus(inv) }));
  const reminders = buildReminders(invoices);

  // Stats
  const total = withStatus.reduce((s, i) => s + (i.total || 0), 0);
  const outstanding = withStatus
    .filter((i) => i._status === "sent" || i._status === "overdue")
    .reduce((s, i) => s + (i.total || 0), 0);
  const paid = withStatus
    .filter((i) => i._status === "paid")
    .reduce((s, i) => s + (i.total || 0), 0);
  const overdueCount = withStatus.filter((i) => i._status === "overdue").length;

  const recent = [...withStatus]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 5);

  function copyEmail(reminder, id) {
    const text = `Subject: ${reminder.emailSubject}\n\n${reminder.emailBody}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  }

  return (
    <div className="hub-page">
      {/* Reminder banners */}
      {reminders.length > 0 && (
        <section className="reminders">
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
                        <>
                          {" "}&bull; Interest: {formatCurrency(r.interest)} &bull;{" "}
                          <strong>Total owing: {formatCurrency(r.totalOwing)}</strong>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn--ghost reminder__copy"
                  onClick={() => copyEmail(r, id)}
                >
                  {copiedId === id ? "✓ Copied!" : "Copy email"}
                </button>
              </div>
            );
          })}
        </section>
      )}

      {/* Stats */}
      <section className="stats">
        <StatCard label="Total invoiced" value={formatCurrency(total)} />
        <StatCard label="Outstanding" value={formatCurrency(outstanding)} accent />
        <StatCard label="Collected" value={formatCurrency(paid)} />
        <StatCard label="Overdue" value={overdueCount} danger={overdueCount > 0} unit="invoice" />
      </section>

      {/* Recent invoices */}
      <section className="hub-section">
        <div className="hub-section__head">
          <h2 className="hub-section__title">Recent invoices</h2>
          <Link to="/invoices" className="link">View all</Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            msg="No invoices yet."
            action={<Link to="/invoices/new" className="btn btn--primary">Create your first invoice</Link>}
          />
        ) : (
          <div className="inv-table-wrap">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {recent.map((inv) => (
                  <tr key={inv.id}>
                    <td className="inv-table__num">{inv.number || "—"}</td>
                    <td>{inv.client?.name || "—"}</td>
                    <td>{formatCurrency(inv.total || 0)}</td>
                    <td>{formatShortDate(inv.dueDate)}</td>
                    <td><StatusBadge status={inv._status} /></td>
                    <td>
                      <Link to={`/invoices/${inv.id}`} className="link">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, accent, danger, unit }) {
  const count = typeof value === "number";
  const display = count ? value : value;
  return (
    <div className={`stat-card${accent ? " stat-card--accent" : ""}${danger ? " stat-card--danger" : ""}`}>
      <span className="stat-card__value">{display}{count && unit ? ` ${unit}${value !== 1 ? "s" : ""}` : ""}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function EmptyState({ msg, action }) {
  return (
    <div className="empty-state">
      <p>{msg}</p>
      {action}
    </div>
  );
}
