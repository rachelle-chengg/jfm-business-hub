import ClientFields from "./ClientFields.jsx";
import InvoiceDetails from "./InvoiceDetails.jsx";
import LineItems from "./LineItems.jsx";
import TaxSettings from "./TaxSettings.jsx";
import AdjustmentSettings from "./AdjustmentSettings.jsx";
import { ADJUSTMENT_DEFAULTS } from "../../lib/invoice.js";

export default function InvoiceForm({
  invoice,
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
        onUpdate={onUpdate}
        onSetDateIssued={onSetDateIssued}
        onSetDueDate={onSetDueDate}
        onResetDueDate={onResetDueDate}
      />
      <ClientFields client={invoice.client} onChange={onUpdateClient} />
      <LineItems items={invoice.items} onChange={onSetItems} />
      <TaxSettings tax={invoice.tax} onChange={onUpdateTax} />
      <AdjustmentSettings adjustment={adjustment} onChange={onUpdateAdjustment} />
    </div>
  );
}
