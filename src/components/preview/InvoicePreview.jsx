import { invoiceOverflows } from "../../lib/invoiceLayout.js";
import { useEffect, useRef, useState } from "react";
import InvoiceHeader from "./InvoiceHeader.jsx";
import ClientInfo from "./ClientInfo.jsx";
import InvoiceMeta from "./InvoiceMeta.jsx";
import InvoiceTable from "./InvoiceTable.jsx";
import SettlementInfo, { SettlementTerms } from "./SettlementInfo.jsx";
import InvoiceTotals from "./InvoiceTotals.jsx";
import InvoiceFrame from "./InvoiceFrame.jsx";

const SHEET_WIDTH_PX = 816; // 8.5in at 96dpi
const SHEET_HEIGHT_PX = 1056; // 11in

/**
 * Renders the sheet at true letter size and scales it to fit its container,
 * so the preview always keeps an exact 8.5 x 11 ratio. Print uses scale 1.
 */
export default function InvoicePreview({ invoice, totals }) {
  const hostRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const sheet = hostRef.current?.querySelector(".sheet");
    if (!sheet) return;
    let active = true;
    const check = () => {
      if (!active) return;
      if (!sheet.getClientRects().length) return;
      const tooLong = invoiceOverflows(sheet);
      sheet.dataset.overflow = String(tooLong);
      setOverflow(tooLong);
    };
    const observer = new ResizeObserver(check);
    sheet.querySelectorAll(".sheet__body, .sheet__table, .sheet__bottom, .sheet__client, .sheet__business, .sheet__footer, .sheet__payment-terms").forEach(node => observer.observe(node));
    check();
    document.fonts?.ready.then(check);
    return () => { active = false; observer.disconnect(); };
  }, [invoice, totals]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const fit = () => {
      const { width, height } = host.getBoundingClientRect();
      setScale(Math.min(width / SHEET_WIDTH_PX, height / SHEET_HEIGHT_PX, 1.25));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="preview" ref={hostRef}>
      <div
        className="preview__scaler"
        style={{ width: SHEET_WIDTH_PX * scale, height: SHEET_HEIGHT_PX * scale }}
      >
        <div className="sheet" id="invoice-sheet" style={{ transform: `scale(${scale})` }}>
          <InvoiceFrame business={invoice.businessInfo} />
          <InvoiceHeader business={invoice.businessInfo} />
          <ClientInfo client={invoice.client} />
          <InvoiceMeta invoice={invoice} />
          <hr className="sheet__divider" />
          <main className="sheet__body">
            <InvoiceTable items={invoice.items} />
            <div className="sheet__bottom">
              <SettlementInfo settlement={invoice.settlementInfo} />
              <InvoiceTotals totals={totals} tax={invoice.tax} />
            </div>
          </main>
          <SettlementTerms note={invoice.settlementInfo.note} />
        </div>
      </div>
      {overflow && <p className="preview__warning" role="alert">
        This invoice exceeds the one-page template. Shorten the text or reduce the line items before exporting.
      </p>}
    </div>
  );
}
