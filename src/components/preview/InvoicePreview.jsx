import { useEffect, useRef, useState } from "react";
import InvoiceHeader from "./InvoiceHeader.jsx";
import ClientInfo from "./ClientInfo.jsx";
import InvoiceMeta from "./InvoiceMeta.jsx";
import InvoiceTable from "./InvoiceTable.jsx";
import SettlementInfo from "./SettlementInfo.jsx";
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
          <InvoiceTable items={invoice.items} />
          <div className="sheet__bottom">
            <SettlementInfo settlement={invoice.settlementInfo} />
            <InvoiceTotals totals={totals} tax={invoice.tax} />
          </div>
        </div>
      </div>
    </div>
  );
}
