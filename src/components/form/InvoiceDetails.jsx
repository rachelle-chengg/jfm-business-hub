import Field from "./Field.jsx";
import { DUE_DATE_OFFSET_DAYS } from "../../config/business.js";
import { listTemplates } from "../../lib/templates.js";

export default function InvoiceDetails({ invoice, isNew, onSelectTemplate, onUpdate, onSetDateIssued, onSetDueDate, onResetDueDate }) {
  const templates = listTemplates();

  return (
    <section className="form__section">
      <h2 className="form__heading">Invoice</h2>
      {isNew && templates.length > 1 && (
        <Field
          label="Template"
          id="invoice-template"
          hint="Sets the business info and payment instructions this invoice will use — locked in once you save it."
        >
          <select
            className="input"
            id="invoice-template"
            value={invoice.templateId || templates[0].id}
            onChange={(e) => onSelectTemplate(e.target.value)}
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </Field>
      )}
      {!isNew && templates.length > 1 && (
        <Field label="Template" id="invoice-template-readonly">
          <div className="settings-readonly">
            {templates.find((t) => t.id === invoice.templateId)?.name || "Default"}
          </div>
        </Field>
      )}
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
