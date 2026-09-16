import { formatCurrency } from "../../lib/money.js";

export default function InvoiceTotals({ totals, tax }) {
  return (
    <section className="sheet__totals">
      <div className="sheet__totals-row">
        <span>Subtotal</span>
        <span>{formatCurrency(totals.subtotal)}</span>
      </div>
      {tax.enabled ? (
        <div className="sheet__totals-row">
          <span>
            {tax.label} ({totals.rate}%)
          </span>
          <span>{formatCurrency(totals.taxAmount)}</span>
        </div>
      ) : null}
      <div className="sheet__totals-rule" />
      <div className="sheet__totals-row sheet__totals-row--due">
        <span>Balance Due</span>
        <span className="sheet__balance">{formatCurrency(totals.balanceDue)}</span>
      </div>
    </section>
  );
}
