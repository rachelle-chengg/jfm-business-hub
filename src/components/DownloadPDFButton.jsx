import { useState } from "react";
import { exportInvoiceToPdf } from "../lib/pdf.js";
import { suggestedFilename } from "../lib/invoice.js";

/**
 * exportPdf lets a host swap the export strategy (e.g. a hosted demo that
 * cannot open the print dialog). Defaults to the print-based export.
 */
export default function DownloadPDFButton({ invoice, exportPdf = exportInvoiceToPdf }) {
  const [state, setState] = useState("idle"); // idle | working | error
  const filename = suggestedFilename(invoice);

  const handleClick = async () => {
    setState("working");
    try {
      await exportPdf({ filename, invoice });
      setState("idle");
    } catch (err) {
      console.error(err);
      setState("error");
    }
  };

  return (
    <div className="download">
      <button type="button" className="btn btn--primary btn--block" onClick={handleClick} disabled={state === "working"}>
        {state === "working" ? "Preparing PDF\u2026" : "Export"}
      </button>
      <p className="download__hint">
        {state === "error" ? "The PDF could not be created. Try again." : filename}
      </p>
    </div>
  );
}
