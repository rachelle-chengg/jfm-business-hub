/** One-page bounds shared by preview and both PDF export paths. */
export function invoiceOverflows(sheet) {
  const body = sheet.querySelector('.sheet__body');
  const client = sheet.querySelector('.sheet__client');
  const business = sheet.querySelector('.sheet__business');
  const footer = sheet.querySelector('.sheet__footer');
  const bottom = sheet.querySelector('.sheet__bottom');
  return body.scrollHeight > body.clientHeight + 1 ||
    body.scrollWidth > body.clientWidth + 1 ||
    client.scrollHeight > client.clientHeight + 1 ||
    business.getBoundingClientRect().bottom > client.getBoundingClientRect().top ||
    footer.scrollWidth > footer.clientWidth + 1 ||
    bottom.scrollWidth > bottom.clientWidth + 1;
}

export async function prepareInvoiceExport() {
  const sheet = document.getElementById('invoice-sheet');
  if (!sheet) throw new Error('Invoice sheet element not found.');
  // The mobile editor hides the preview. Reveal it for measurement/capture.
  document.documentElement.classList.add('invoice-exporting');
  const restore = () => document.documentElement.classList.remove('invoice-exporting');
  try {
    if (document.fonts?.ready) await document.fonts.ready;
    await Promise.all(Array.from(sheet.querySelectorAll('img')).map(img => img.decode()));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (invoiceOverflows(sheet)) {
      throw new Error('This invoice exceeds the one-page template. Shorten the text or reduce the line items before exporting.');
    }
    return restore;
  } catch (error) {
    restore();
    throw error;
  }
}
