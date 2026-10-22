# Invoice design system

Scope: the client-facing invoice document, independent of the business hub UI.
Source: screenshot supplied October 21, 2026. A business owner prepares an invoice on screen; a client reads the same light, letter-size document on screen or paper.

## Foundations

The authoritative tokens live in `src/styles/invoice.css`, prefixed `--inv-`.

| Role | Token / value |
| --- | --- |
| Page | `--inv-page-width`: 8.5in; `--inv-page-height`: 11in |
| Content | `--inv-margin`: 1in; `--inv-content-width`: 6.5in |
| Olive | `--inv-olive`: #647849 |
| Paper | `--inv-paper`: #F1F1F1 |
| Ink | `--inv-ink`: #1C1C1C |
| Table cells / reversed text | `--inv-white`: #FFFFFF |
| Font | Montserrat; Gotham SSm/Gotham and system sans fallbacks |
| Body | 15px, weight 300, 19px line height |
| Settlement | 12.5px / 16px; heading weight 700 |
| Table / footer labels | 15.5px, weight 700 |
| Section heading | 22px, weight 700 |
| Document title | 58px, weight 700 |
| Rules | 1px ink; balance outline 1.5px |

These colors deliberately preserve the supplied reference. The original font is Gotham SSm, which is licensed and is not bundled. Montserrat is a substitute, so exact font matching requires licensed font files.

## Page regions

All dimensions refer to the unscaled page. The browser preview scales the whole document; it never reflows the invoice to the window width. Native print uses the same layout at scale 1, with no page margins.

- Header: anchored 0.8in from the top, between the content margins. Title and business block left, existing transparent logo right.
- Client: anchored at 2.97in, width 4.6in, available height 1.30in. Long words wrap.
- Metadata: anchored at 2.34in, right-aligned to the content margin, width 1.12in.
- Divider: anchored at 4.45in.
- Body: begins at 4.78in and ends 1in above the page bottom. Table grows downward; settlement and totals follow at a 0.38in gap.
- Footer: anchored to the page bottom, height 0.775in. The olive polygon and footer never move with line-item count.

Fixed means fixed relative to the invoice sheet, not the browser viewport. Preserve the two decorative corner polygons and the original logo asset.

## Components

`InvoiceHeader`: document title, business contact and logo.
`ClientInfo`: issued heading and client contact lines.
`InvoiceMeta`: invoice number, issue date, due date.
`InvoiceTable`: semantic two-column table, 0.4in header, minimum 0.5in item rows, fixed 1.13in amount column. Descriptions wrap and preserve entered line breaks.
`SettlementInfo` and `InvoiceTotals`: grid columns 3.75in / 2.6in with a 0.15in gap. Monetary values remain right aligned.
`InvoiceFrame`: page decoration and bottom contact band.

## Content limits

This is a one-page template. Do not shrink fonts to squeeze in extra content. Preview warns when body, client, business or footer content exceeds its region. Both native-print and Drive PDF export refuse an overflowing document instead of silently producing clipped content. Automatic multi-page invoices are a separate extension; browser print shortcuts bypass the app export guard.

## Verification

Check the blank reference state, populated client, multiline descriptions, multiple rows, large amounts and over-capacity content. Header, divider, table start and footer coordinates must remain constant. Use print backgrounds and disable browser headers/footers when saving PDF.

Mobile print explicitly reveals the preview even when the editor is selected. Drive capture renders the sheet at its full 816 × 1056 CSS pixels at 2× resolution, independently of preview scaling.

Line-item geometry uses `--inv-item-height`, `--inv-amount-width` and `--inv-cell-padding`. All rows share the same minimum height and column boundaries; longer descriptions expand a row rather than clip. The client/details region has an additional 0.12in of clearance before the divider.
