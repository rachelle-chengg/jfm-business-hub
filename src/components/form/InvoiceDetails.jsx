import Field from "./Field.jsx";
import { DUE_DATE_OFFSET_DAYS } from "../../config/business.js";

export default function InvoiceDetails({ invoice, onUpdate, onSetDateIssued, onSetDueDate, onResetDueDate }) {
  return (
    <section className="form__section">
      <h2 className="form__heading">Invoice</h2>
      <Field label="Invoice number" id="invoice-number">
        <input
          className="input input--mono"
          type="text"
          inputMode="numeric"
          value={invoice.invoiceNumber}
          onChange={(e) => onUpdate({ invoiceNumber: e.target.value })}
        />
      </Field>
      <div className="field-row">
        <Field label="Date issued" id="invoice-date-issued">
          <input
            className="input"
            type="date"
            value={invoice.dateIssued}
            onChange={(e) => onSetDateIssued(e.target.value)}
          />
        </Field>
        <Field
          label="Due date"
          id="invoice-due-date"
          hint={
            invoice.dueDateOverridden ? (
              <>
                Set manually.{" "}
                <button type="button" className="link" onClick={onResetDueDate}>
                  Reset to {DUE_DATE_OFFSET_DAYS} days
                </button>
              </>
            ) : (
              `${DUE_DATE_OFFSET_DAYS} days after date issued`
            )
          }
        >
          <input className="input" type="date" value={invoice.dueDate} onChange={(e) => onSetDueDate(e.target.value)} />
        </Field>
      </div>
    </section>
  );
}
