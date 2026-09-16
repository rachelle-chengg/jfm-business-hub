import { formatShortDate } from "../../lib/dates.js";

export default function InvoiceMeta({ invoice }) {
  const rows = [
    ["Invoice No.", invoice.invoiceNumber],
    ["Date Issued", formatShortDate(invoice.dateIssued)],
    ["Due Date", formatShortDate(invoice.dueDate)],
  ];
  return (
    <dl className="sheet__meta">
      {rows.map(([label, value]) => (
        <div className="sheet__meta-row" key={label}>
          <dt>{label}</dt>
          <dd>{value || "\u00A0"}</dd>
        </div>
      ))}
    </dl>
  );
}
