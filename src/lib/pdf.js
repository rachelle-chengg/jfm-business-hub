/**
 * PDF export via the browser print engine.
 *
 * Why print rather than a canvas-to-PDF library: the print engine produces
 * vector text with embedded fonts, an exact letter-size page and selectable
 * text. Canvas rasterizers produce blurry, heavy, non-selectable PDFs.
 * The @media print block in invoice.css hides everything except the sheet.
 *
 * The user picks "Save as PDF" in the dialog. document.title becomes the
 * suggested filename in Chrome, Edge and Safari.
 */
export async function exportInvoiceToPdf({ filename }) {
  const previousTitle = document.title;
  document.title = filename.replace(/\.pdf$/i, "");
  if (document.fonts?.ready) await document.fonts.ready;
  const restore = () => {
    document.title = previousTitle;
    window.removeEventListener("afterprint", restore);
  };
  window.addEventListener("afterprint", restore);
  window.print();
  setTimeout(restore, 3000);
}
