import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import InvoiceForm from "./form/InvoiceForm.jsx";
import InvoicePreview from "./preview/InvoicePreview.jsx";
import DownloadPDFButton from "./DownloadPDFButton.jsx";
import { calculateTotals } from "../lib/money.js";
import { addDays } from "../lib/dates.js";
import { loadDraft, saveDraft } from "../lib/storage.js";
import { createInvoice, nextInvoiceNumber } from "../lib/invoice.js";
import { saveInvoice } from "../lib/db.js";
import { generatePdfBlob, uploadInvoiceToDrive } from "../lib/drive.js";
import { suggestedFilename } from "../lib/invoice.js";
import { DUE_DATE_OFFSET_DAYS } from "../config/business.js";

const DEFAULT_INVOICE_NUMBER = `${String(new Date().getFullYear()).slice(-2)}001`;

export default function InvoiceGenerator({
  exportPdf,
  initialInvoice = null,
  invoiceId,
  onSaved,
}) {
  const [invoice, setInvoice] = useState(() => {
    if (initialInvoice) return { ...initialInvoice };
    return loadDraft() ?? createInvoice({ invoiceNumber: DEFAULT_INVOICE_NUMBER });
  });
  const [mobileView, setMobileView] = useState("editor");
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const [driveState, setDriveState] = useState("idle"); // idle | uploading | done | error

  useEffect(() => {
    // Only auto-save draft for new invoices (not edits of saved ones)
    if (!invoiceId) saveDraft(invoice);
  }, [invoice, invoiceId]);

  const totals = useMemo(
    () => calculateTotals(invoice.items, invoice.tax, invoice.adjustment),
    [invoice.items, invoice.tax, invoice.adjustment]
  );

  const updateAdjustment = (patch) =>
    setInvoice((prev) => ({
      ...prev,
      adjustment: { ...prev.adjustment, ...patch },
    }));

  const update = (patch) => setInvoice((prev) => ({ ...prev, ...patch }));
  const updateClient = (patch) =>
    setInvoice((prev) => ({ ...prev, client: { ...prev.client, ...patch } }));
  const updateTax = (patch) =>
    setInvoice((prev) => ({ ...prev, tax: { ...prev.tax, ...patch } }));
  const setDateIssued = (dateIssued) =>
    setInvoice((prev) => ({
      ...prev,
      dateIssued,
      dueDate: prev.dueDateOverridden ? prev.dueDate : addDays(dateIssued, DUE_DATE_OFFSET_DAYS),
    }));
  const setDueDate = (dueDate) => update({ dueDate, dueDateOverridden: true });
  const resetDueDate = () =>
    update({
      dueDate: addDays(invoice.dateIssued, DUE_DATE_OFFSET_DAYS),
      dueDateOverridden: false,
    });
  const setItems = (items) => update({ items });

  const startNewInvoice = () => {
    if (!window.confirm("Start a new invoice? The current one will be cleared.")) return;
    setInvoice(createInvoice({ invoiceNumber: nextInvoiceNumber(invoice.invoiceNumber) }));
  };

  async function handleSave(status = "draft") {
    setSaveState("saving");
    try {
      const record = {
        ...invoice,
        id: invoiceId,
        number: invoice.invoiceNumber,
        status,
        subtotal: totals.subtotal,
        total: totals.balanceDue,
      };
      const saved = saveInvoice(record);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
      onSaved?.(saved.id);
    } catch (err) {
      console.error(err);
      setSaveState("error");
    }
  }

  async function handleSaveToDrive() {
    setDriveState("uploading");
    try {
      const blob = await generatePdfBlob();
      const filename = suggestedFilename(invoice);
      const file = await uploadInvoiceToDrive({ blob, filename });
      // Attach drive link to the saved invoice
      if (invoiceId) {
        saveInvoice({ ...invoice, id: invoiceId, driveFileId: file.id, driveLink: file.webViewLink });
      }
      setDriveState("done");
      setTimeout(() => setDriveState("idle"), 3000);
    } catch (err) {
      console.error(err);
      setDriveState("error");
      setTimeout(() => setDriveState("idle"), 3000);
    }
  }

  const appClass = `app ${mobileView === "preview" ? "app--show-preview" : "app--show-editor"}`;

  return (
    <div className={appClass}>
      <aside className="editor">
        <header className="editor__header">
          <div>
            <Link to="/" className="editor__back">← Hub</Link>
            <h1 className="editor__title">
              {invoiceId ? `Invoice #${invoice.invoiceNumber}` : "New Invoice"}
            </h1>
            <p className="editor__subtitle">Changes save automatically in this browser.</p>
          </div>
          {/* New invoice only shown in edit mode — Preview panel has its own toggle */}
        </header>

        <InvoiceForm
          invoice={invoice}
          onUpdate={update}
          onUpdateClient={updateClient}
          onUpdateTax={updateTax}
          onUpdateAdjustment={updateAdjustment}
          onSetDateIssued={setDateIssued}
          onSetDueDate={setDueDate}
          onResetDueDate={resetDueDate}
          onSetItems={setItems}
        />

        <footer className="editor__footer">
          {/* Save to hub */}
          <div className="save-row">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => handleSave("draft")}
              disabled={saveState === "saving"}
            >
              {saveState === "saving" ? "Saving…" : saveState === "saved" ? "✓ Saved" : "Save draft"}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                if (!window.confirm("Mark this invoice as sent and save it?")) return;
                handleSave("sent");
              }}
              disabled={saveState === "saving"}
            >
              Save as sent
            </button>
          </div>

          {/* Download PDF */}
          <DownloadPDFButton invoice={invoice} exportPdf={exportPdf} />

          {/* Save to Drive */}
          <button
            type="button"
            className="btn btn--ghost btn--block"
            onClick={handleSaveToDrive}
            disabled={driveState === "uploading"}
          >
            {driveState === "uploading"
              ? "Uploading to Drive…"
              : driveState === "done"
              ? "✓ Saved to Drive"
              : driveState === "error"
              ? "Drive upload failed — try again"
              : "Save PDF to Google Drive"}
          </button>
          <p className="download__hint">Requires connecting your Google account on first use.</p>
        </footer>
      </aside>

      <main className="stage">
        {/* Mobile-only toggle lives on the preview panel */}
        <button
          type="button"
          className="btn btn--ghost preview-toggle stage-preview-toggle"
          onClick={() => setMobileView((v) => (v === "editor" ? "preview" : "editor"))}
          aria-label={mobileView === "editor" ? "Preview invoice" : "Back to edit"}
        >
          {mobileView === "preview" ? (
            "← Back to edit"
          ) : (
            <>
              <EyeIcon />
              &nbsp;Preview
            </>
          )}
        </button>
        <InvoicePreview invoice={invoice} totals={totals} />
      </main>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
