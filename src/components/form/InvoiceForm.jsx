import ClientFields from "./ClientFields.jsx";
import InvoiceDetails from "./InvoiceDetails.jsx";
import LineItems from "./LineItems.jsx";
import TaxSettings from "./TaxSettings.jsx";

export default function InvoiceForm({
  invoice,
  onUpdate,
  onUpdateClient,
  onUpdateTax,
  onSetDateIssued,
  onSetDueDate,
  onResetDueDate,
  onSetItems,
}) {
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
    </div>
  );
}
