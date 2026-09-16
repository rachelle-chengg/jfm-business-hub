import { useEffect, useMemo, useState } from "react";
import InvoiceForm from "./form/InvoiceForm.jsx";
import InvoicePreview from "./preview/InvoicePreview.jsx";
import DownloadPDFButton from "./DownloadPDFButton.jsx";
import { calculateTotals } from "../lib/money.js";
import { addDays } from "../lib/dates.js";
import { loadDraft, saveDraft } from "../lib/storage.js";
import { createInvoice, nextInvoiceNumber } from "../lib/invoice.js";
import { DUE_DATE_OFFSET_DAYS } from "../config/business.js";

const DEFAULT_INVOICE_NUMBER = `${String(new Date().getFullYear()).slice(-2)}001`;

export default function InvoiceGenerator({ exportPdf }) {
  const [invoice, setInvoice] = useState(
    () => loadDraft() ?? createInvoice({ invoiceNumber: DEFAULT_INVOICE_NUMBER })
  );

  useEffect(() => {
    saveDraft(invoice);
  }, [invoice]);

  const totals = useMemo(() => calculateTotals(invoice.items, invoice.tax), [invoice.items, invoice.tax]);

  // Field updates. Due date follows the issue date until the user overrides it.
  const update = (patch) => setInvoice((prev) => ({ ...prev, ...patch }));
  const updateClient = (patch) => setInvoice((prev) => ({ ...prev, client: { ...prev.client, ...patch } }));
  const updateTax = (patch) => setInvoice((prev) => ({ ...prev, tax: { ...prev.tax, ...patch } }));
  const setDateIssued = (dateIssued) =>
    setInvoice((prev) => ({
      ...prev,
      dateIssued,
      dueDate: prev.dueDateOverridden ? prev.dueDate : addDays(dateIssued, DUE_DATE_OFFSET_DAYS),
    }));
  const setDueDate = (dueDate) => update({ dueDate, dueDateOverridden: true });
  const resetDueDate = () =>
    update({ dueDate: addDays(invoice.dateIssued, DUE_DATE_OFFSET_DAYS), dueDateOverridden: false });
  const setItems = (items) => update({ items });

  const startNewInvoice = () => {
    if (!window.confirm("Start a new invoice? The current one will be cleared.")) return;
    setInvoice(createInvoice({ invoiceNumber: nextInvoiceNumber(invoice.invoiceNumber) }));
  };

  return (
    <div className="app">
      <aside className="editor">
        <header className="editor__header">
          <div>
            <h1 className="editor__title">Invoice</h1>
            <p className="editor__subtitle">Changes save automatically in this browser.</p>
          </div>
          <button type="button" className="btn btn--ghost" onClick={startNewInvoice}>
            New invoice
          </button>
        </header>

        <InvoiceForm
          invoice={invoice}
          onUpdate={update}
          onUpdateClient={updateClient}
          onUpdateTax={updateTax}
          onSetDateIssued={setDateIssued}
          onSetDueDate={setDueDate}
          onResetDueDate={resetDueDate}
          onSetItems={setItems}
        />

        <footer className="editor__footer">
          <DownloadPDFButton invoice={invoice} exportPdf={exportPdf} />
        </footer>
      </aside>

      <main className="stage">
        <InvoicePreview invoice={invoice} totals={totals} />
      </main>
    </div>
  );
}
