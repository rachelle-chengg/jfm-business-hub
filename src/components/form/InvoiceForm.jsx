import ClientFields from "./ClientFields.jsx";
import InvoiceDetails from "./InvoiceDetails.jsx";
import LineItems from "./LineItems.jsx";
import TaxSettings from "./TaxSettings.jsx";
import AdjustmentSettings from "./AdjustmentSettings.jsx";
import { ADJUSTMENT_DEFAULTS } from "../../lib/invoice.js";

export default function InvoiceForm({
  invoice,
  isNew,
  onSelectTemplate,
  onUpdate,
  onUpdateClient,
  onUpdateTax,
  onUpdateAdjustment,
  onSetDateIssued,
  onSetDueDate,
  onResetDueDate,
  onSetItems,
}) {
  const adjustment = invoice.adjustment ?? ADJUSTMENT_DEFAULTS;
  return (
    <div className="form">
      <InvoiceDetails
        invoice={invoice}
        isNew={isNew}
        onSelectTemplate={onSelectTemplate}
        onUpdate={onUpdate}
        onSetDateIssued={onSetDateIssued}
        onSetDueDate={onSetDueDate}
        onResetDueDate={onResetDueDate}
      />
      <ClientFields client={invoice.client} onChange={onUpdateClient} />
      <LineItems items={invoice.items} onChange={onSetItems} />
      <section className="form__section">
        <h2 className="form__heading">Page settings</h2>
        <label className="toggle">
          <input type="checkbox" checked={Boolean(invoice.allowAdditionalPages)}
            onChange={e => onUpdate({ allowAdditionalPages: e.target.checked })} />
          <span>Allow additional pages</span>
        </label>
        <p className="field__hint">Add pages automatically when line items do not fit. Totals and payment details appear on the final page.</p>
      </section>
      <TaxSettings tax={invoice.tax} onChange={onUpdateTax} />
      <AdjustmentSettings adjustment={adjustment} onChange={onUpdateAdjustment} />
    </div>
  );
}
