import { paginateRows } from "../../lib/pagination.js";
import { invoiceOverflows } from "../../lib/invoiceLayout.js";
import { useLayoutEffect, useRef, useState } from "react";
import InvoiceHeader from "./InvoiceHeader.jsx";
import ClientInfo from "./ClientInfo.jsx";
import InvoiceMeta from "./InvoiceMeta.jsx";
import InvoiceTable from "./InvoiceTable.jsx";
import SettlementInfo, { SettlementTerms } from "./SettlementInfo.jsx";
import InvoiceTotals from "./InvoiceTotals.jsx";
import InvoiceFrame from "./InvoiceFrame.jsx";

const WIDTH = 816;
const HEIGHT = 1056;

function InvoicePage({ invoice, totals, items, final = true, page, count, measure = false, scale = 1 }) {
  return <div className={`sheet${measure ? " sheet--measure" : ""}`} data-invoice-page={measure ? undefined : "true"}
    id={measure ? undefined : page === 0 ? "invoice-sheet" : `invoice-sheet-${page + 1}`}
    style={measure ? undefined : { transform: `scale(${scale})` }}>
    <InvoiceFrame business={invoice.businessInfo} />
    <InvoiceHeader business={invoice.businessInfo} />
    <ClientInfo client={invoice.client} />
    <InvoiceMeta invoice={invoice} />
    <hr className="sheet__divider" />
    <main className="sheet__body">
      {items.length > 0 && <InvoiceTable items={items} />}
      {final && <div className={`sheet__bottom${items.length ? "" : " sheet__bottom--only"}`}>
        <SettlementInfo settlement={invoice.settlementInfo} />
        <InvoiceTotals totals={totals} tax={invoice.tax} />
      </div>}
    </main>
    {final && <SettlementTerms note={invoice.settlementInfo.note} />}
    {!measure && count > 1 && <div className="sheet__page-number">Page {page + 1} of {count}</div>}
  </div>;
}

export default function InvoicePreview({ invoice, totals }) {
  const hostRef = useRef(null);
  const measureRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [groups, setGroups] = useState([invoice.items.map((_, i) => i)]);
  const [overflow, setOverflow] = useState(false);

  useLayoutEffect(() => {
    const host = hostRef.current;
    const fit = () => {
      // Use width only: additional pages scroll vertically rather than shrink.
      if (host.clientWidth) setScale(Math.min(host.clientWidth / WIDTH, 1.25));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const sheet = measureRef.current.querySelector('.sheet');
    let active = true;
    const measure = () => {
      if (!active) return;
      const rows = Array.from(sheet.querySelectorAll('tbody tr'), row => row.getBoundingClientRect().height);
      const body = sheet.querySelector('.sheet__body');
      if (!body.clientHeight) return;
      const header = sheet.querySelector('thead')?.getBoundingClientRect().height || 0;
      const closing = sheet.querySelector('.sheet__bottom');
      const closingHeight = closing.getBoundingClientRect().height + parseFloat(getComputedStyle(closing).marginTop);
      const next = invoice.allowAdditionalPages
        ? paginateRows(rows, body.clientHeight - 2, header + 1, closingHeight)
        : [invoice.items.map((_, i) => i)];
      setGroups(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    sheet.querySelectorAll('.sheet__body, tbody, .sheet__bottom').forEach(el => observer.observe(el));
    document.fonts?.ready.then(measure);
    return () => { active = false; observer.disconnect(); };
  }, [invoice, totals]);

  useLayoutEffect(() => {
    let active = true;
    const check = () => {
      if (!active) return;
      const sheets = Array.from(hostRef.current.querySelectorAll('[data-invoice-page]'));
      if (!sheets[0]?.getClientRects().length) return;
      let any = false;
      sheets.forEach(sheet => {
        const invalid = invoiceOverflows(sheet);
        sheet.dataset.overflow = String(invalid);
        any ||= invalid;
      });
      setOverflow(any);
    };
    check();
    const observer = new ResizeObserver(check);
    hostRef.current.querySelectorAll('[data-invoice-page], .sheet__body, .sheet__bottom, .sheet__payment-terms').forEach(el => observer.observe(el));
    document.fonts?.ready.then(check);
    return () => { active = false; observer.disconnect(); };
  }, [groups, invoice, totals, scale]);

  return <>
    <div className="invoice-measure" ref={measureRef} aria-hidden="true" inert="">
      <InvoicePage invoice={invoice} totals={totals} items={invoice.items} measure />
    </div>
    <div className="preview" ref={hostRef}>
      <div className="preview__pages">
        {groups.map((indices, page) => <div className="preview__scaler" key={page} style={{ width: WIDTH * scale, height: HEIGHT * scale }}>
          <InvoicePage invoice={invoice} totals={totals} items={indices.map(i => invoice.items[i]).filter(Boolean)}
            final={page === groups.length - 1} page={page} count={groups.length} scale={scale} />
        </div>)}
        {overflow && <p className="preview__warning" role="alert">{invoice.allowAdditionalPages
          ? "Some content is too large for a page. Shorten the long description or contact details before exporting."
          : "This invoice exceeds one page. Enable additional pages in Page settings, or shorten the content before exporting."}</p>}
      </div>
    </div>
  </>;
}
