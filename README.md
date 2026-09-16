# Jonathan Folk Media invoice generator

Form on the left, live letter-size invoice preview on the right, one-click PDF.

## Run

```bash
npm install
npm run dev
```

## Where things live

| Purpose | File |
| --- | --- |
| Business details, settlement copy, tax defaults, due-date offset | `src/config/business.js` |
| Money parsing, currency formatting, totals | `src/lib/money.js` |
| Date helpers (ISO storage, "Sep 3/25" display) | `src/lib/dates.js` |
| Draft persistence (localStorage) | `src/lib/storage.js` |
| Invoice model, next-number logic, filename | `src/lib/invoice.js` |
| PDF export (print engine) | `src/lib/pdf.js` |
| Invoice layout, in physical inches | `src/styles/invoice.css` |
| Editor chrome | `src/styles/app.css` |

## PDF export

`Download PDF` opens the browser print dialog with a print stylesheet that hides
the editor and renders only the sheet at 8.5 x 11 with zero margins. Choose
"Save as PDF". The suggested filename is `Invoice-[number]-[client].pdf`. This
yields vector text and embedded fonts, which a canvas rasterizer cannot.

Chrome and Edge give the best result. In Firefox, turn off "Print headers and footers".

## Fonts

The original invoice uses Gotham SSm (Light, Medium, Bold), a licensed font.
Montserrat from Google Fonts is a close geometric substitute. If you own Gotham,
add `@font-face` rules for it and put it first in `--inv-font` in `invoice.css`.
