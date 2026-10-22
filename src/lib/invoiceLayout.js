/** One-page bounds shared by preview and both PDF export paths. */
export function invoiceOverflows(sheet) {
  const body = sheet.querySelector('.sheet__body');
  const client = sheet.querySelector('.sheet__client');
  const business = sheet.querySelector('.sheet__business');
  const footer = sheet.querySelector('.sheet__footer');
  const bottom = sheet.querySelector('.sheet__bottom');
  const terms = sheet.querySelector('.sheet__payment-terms');
  return (terms && terms.scrollHeight > terms.clientHeight + 1) || body.scrollHeight > body.clientHeight + 1 ||
    body.scrollWidth > body.clientWidth + 1 ||
    client.scrollHeight > client.clientHeight + 1 ||
    business.getBoundingClientRect().bottom > client.getBoundingClientRect().top ||
    footer.scrollWidth > footer.clientWidth + 1 ||
    Boolean(bottom && bottom.scrollWidth > bottom.clientWidth + 1);
}

export async function prepareInvoiceExport() {
  const sheets = Array.from(document.querySelectorAll('[data-invoice-page]'));
  if (!sheets.length) throw new Error('Invoice sheet element not found.');
  // The mobile editor hides the preview. Reveal it for measurement/capture.
  document.documentElement.classList.add('invoice-exporting');
  const restore = () => document.documentElement.classList.remove('invoice-exporting');
  try {
    if (document.fonts?.ready) await document.fonts.ready;
    await Promise.all(Array.from(document.querySelectorAll('[data-invoice-page] img')).map(img => img.decode()));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (Array.from(document.querySelectorAll('[data-invoice-page]')).some(invoiceOverflows)) {
      throw new Error('This invoice exceeds its page bounds. Enable additional pages in Page settings, or shorten oversized content before exporting.');
    }
    return restore;
  } catch (error) {
    restore();
    throw error;
  }
}
