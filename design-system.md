# Hub Design System

**Scope:** the app shell — nav, dashboard, invoices, clients, settings, and the invoice editor's form panel (`src/styles/app.css`). The invoice PDF/print template (`src/styles/invoice.css`) is a separate, already-tuned client-facing document and is **not** covered by this system.

All tokens live in `:root` at the top of `src/styles/app.css`. Change a value there, not at the point of use.

---

## Color

Source palette: `colour-palette.jpg` (Mossed Stone / Polished Concrete / Cast Limestone / Beton Noir), named after the physical materials of a built property, which is what this business photographs.

**Mossed Stone (green) is reserved for brand moments only** — currently just the dashboard hero card's gradient. Everyday UI (buttons, links, active nav/filter states, focus rings) runs on a neutral black/white/gray scale instead, per an explicit request to move toward a neutral palette after seeing reference designs built that way.

| Brand name | Hex | Role | CSS token |
| --- | --- | --- | --- |
| Beton Noir | `#1A1A1A` | Primary text/ink, **and** the everyday-UI accent (buttons, active states, links) | `--ui-text`, `--ui-accent` |
| Polished Concrete | `#E9E8E3` | Page background (light mode); becomes the dark-mode accent (see below) | `--ui-stage` |
| Cast Limestone | `#DCD7C9` | Strong borders/dividers | `--ui-line-strong` |
| Mossed Stone | `#2C3930` | Brand moment only — the hero card gradient, nowhere else | (hardcoded on `.hero-card`, not a reusable token) |

Everything else, derived to stay neutral:

| Token | Hex / value | Usage |
| --- | --- | --- |
| `--ui-bg` | `#FFFFFF` | Card/surface white |
| `--ui-muted` | `#6B6B6B` | Secondary text — a clean neutral gray (an earlier warm-beige version, `#6B675C`, was explicitly rejected as looking "beige" rather than gray) |
| `--ui-line` | `#EEEAE0` | Hairline dividers — a lighter tint of Cast Limestone |
| `--ui-accent` | `#1A1A1A` | Primary buttons, active nav/sidebar links, links, checkbox tint, focus-ring base — black in light mode |
| `--ui-accent-hover` | `#333330` | Hover state for accent-colored buttons |
| `--ui-accent-contrast` | `#FFFFFF` | Text/icon color drawn *on top of* `--ui-accent` — exists as its own token specifically so dark mode can flip it (see below) |
| `--ui-focus` | `rgba(26, 26, 26, 0.16)` | Focus ring — neutral, not colored |
| `--ui-danger` | `#9A4632` | Overdue / destructive actions — a muted brick/rust, kept in the same desaturated material family instead of a stock alert red |

Functional status colors (draft / sent / overdue / paid — used by `.status-badge--*` and `.filter-tab--*`) stay semantically conventional (grey / blue / red / green) — these are data-state colors, a separate design question from the brand-accent one above, and weren't part of the neutral-palette change. "Paid" still reuses Mossed Stone's hex directly, since green-for-success is the universal convention and the overlap with the brand color is intentional.

**Dark mode** (`prefers-color-scheme: dark` or `[data-theme="dark"]`): background drops toward Beton Noir, text becomes Polished Concrete. Because the light-mode accent is now literally black (`--ui-text`'s color), it can't just stay black in dark mode — it would vanish against a dark background. `--ui-accent` flips to Polished Concrete (`#E9E8E3`, light) in dark mode, and `--ui-accent-contrast` flips to `#1A1A1A` (dark text on the now-light accent). Any component drawing accent-colored text on an accent background **must** use `var(--ui-accent-contrast)`, never a hardcoded `#fff` — that hardcoding was the bug that would have made primary-button text invisible in dark mode.

## Typography

Three roles, used with restraint — most of the UI is Inter; the other two only appear where they earn their place.

| Role | Font | Token | Where |
| --- | --- | --- | --- |
| Body / UI | Inter | `--ui-font` | Everything: nav, labels, buttons, table text, forms |
| Display | Space Grotesk | `--ui-font-display` | Only page titles (`.hub-page__title`), the dashboard greeting (`.dash-greeting__name`), and the hero balance figure (`.hero-card__amount`) |
| Data / mono | IBM Plex Mono | `--ui-mono` | Invoice numbers, dates, anything read as a data value rather than prose |

Sans-serif throughout, no serif — Space Grotesk was chosen over a serif specifically because its slightly technical, structured letterforms suit the concrete/limestone/stone material palette better than an editorial serif would.

## Icons

**Rule: icons are always outline style — `fill="none"`, `stroke="currentColor"`, with `strokeLinecap="round"` and `strokeLinejoin="round"`.** No filled glyphs, no sharp/mitered joins. Every icon in the hub follows this — keep any new icon consistent with it.

Shared, reused-across-pages icons (`SearchIcon`, `FilterIcon`, `SortIcon`, `MenuIcon`, `ListIcon`, `HomeIcon`, `PersonIcon`, `DocumentIcon`, `GearIcon`) live in `src/components/icons.jsx`. One-off icons used on a single page stay defined locally in that page file, matching the existing convention (e.g. `PencilIcon`/`TrashIcon` duplicated in `ClientsPage.jsx`/`SettingsPage.jsx`) — only promote an icon to the shared file once it's actually used in more than one place. Nav icons are chosen for what they mean in this specific business, not generic defaults: Jobs uses a plain list icon, Clients a person, Invoices a document.

## Shared components

Beyond `Modal.jsx`, two more general-purpose components exist and should be reused rather than reimplemented:

- **`TagInput.jsx`** — free-form tags (type + Enter/comma to add, click × or Backspace to remove). Used on Jobs and Clients. A read-only variant for list/table display doesn't need a component — just render `.tag-pills > .tag-pill` directly (see `JobsPage.jsx`/`ClientsPage.jsx` table cells).
- **`AddressAutocomplete.jsx`** — a drop-in replacement for a plain address `<input>`, debounced (400ms, 3-char minimum) against OpenStreetMap's free Nominatim search API. No API key or billing required, chosen explicitly over Google Places Autocomplete for that reason. Used on the invoice form's Client fields, the Clients page form, and the Jobs form. If quality ever becomes an issue (Nominatim is decent but not as complete as Google's data, especially outside major cities), swapping to Google Places would mean replacing this component's fetch call, not its call sites.

## Jump-to-tab menu

When a `.filter-tabs` row has enough tabs that horizontal scrolling alone makes some hard to find (Jobs has 9 status tabs), pair it with a `.filter-tabs-menu` — a small icon button (`MenuIcon`) that opens a popover listing every tab with its count, letting the user jump directly instead of scrolling. See `JobsPage.jsx` for the reference implementation; adopt the same pattern if another page's tab row grows past what fits on one screen width.

## Signature element: corner registration marks

The one deliberate flourish in the system, used exactly once — on the dashboard's outstanding-balance hero card (`.hero-card::before` / `::after`). Two diagonal L-shaped brackets in a light, translucent tone sit at the top-left and bottom-right corners of the card, over a dark Mossed Stone → Beton Noir gradient. It reads as a registration/crop mark, which fits a business built on property material names and photographic framing without being literal about either. It is not reused as a generic utility class elsewhere — restraint is the point.

```css
.hero-card {
  background: linear-gradient(135deg, #2C3930 0%, #23291F 55%, #1A1A1A 100%);
}
.hero-card::before, .hero-card::after {
  width: 20px; height: 20px;
  border: 1.5px solid rgba(233, 232, 227, 0.5);
}
.hero-card::before { top: 14px; left: 14px; border-right: 0; border-bottom: 0; }
.hero-card::after  { bottom: 14px; right: 14px; border-left: 0; border-top: 0; }
```

## Shape

Two tokens, two tiers — chosen after explicit feedback that an earlier "tight, architectural" 6px pass read as too sharp, with reference designs pointing toward fully rounded/pill controls instead:

- `--ui-radius: 999px` — controls: buttons, inputs (text + select), icon buttons, nav links, badges. This is a real pill/circle, not a subtle rounding — `.icon-btn` and the hamburger button become perfect circles, `.btn` and `.input` become true stadium-shaped pills.
- `--ui-radius-lg: 18px` — larger surfaces: hero card, `.hub-section`, `.client-form-card`, `.settings-card`, `.inv-table-wrap`, `.modal-dialog`, `.empty-state`, `.reminder`, `.inv-list`. Generously rounded, but not literal pill/stadium shape — a big rectangle at 999px radius would look like a giant capsule, not "rounded."

Base control sizing was bumped alongside this (`.input`/`.btn` height 36px → 44px, padding increased) — pill shapes need more generous padding and height to read as intentional rather than a thin sliver with rounded ends.

Search and select inputs that need a leading icon (search bar, filter/sort dropdowns) use the `.search-field` / `.select-field` wrapper pattern — an absolutely-positioned icon plus `padding-left: 44px` on the `.input` inside. See `SearchIcon`/`FilterIcon`/`SortIcon` in `src/components/icons.jsx`.

## Spacing

Every `padding`/`margin`/`gap` value in `app.css` sits on a 4px grid (4, 8, 12, 16, 20, 24, 28, 32...). This wasn't the case for most of this file's history — values like 6, 10, 14, 18, 22px crept in incrementally across earlier passes and were audited and rounded up to the nearest 4px in one pass after explicit feedback that things read as "too close together." Icon dimensions (`width`/`height` on an icon's `<svg>`) follow the same grid for the same reason — inconsistent icon sizing (14 vs 15 vs 16px scattered around) contributes to the same slightly-off feeling as inconsistent spacing, so icons are now consistently 16px (small) or 20px (medium, e.g. dashboard quick-action icons).

**Exceptions, deliberate:** border/stroke widths (1px, 1.5px, 2px) and focus-ring `outline-offset` (1-2px) are not on this grid — they serve definition/accessibility purposes, not layout rhythm, and forcing them to 4px would make borders/rings look chunky rather than crisp.

When adding new CSS, pick from the grid rather than eyeballing a value — if 14px looks right, use 16px; if 10px looks right, use 12px. Round up, not down, per the same reasoning as the audit.

## Dashboard quick actions

Icon-circle + label, like a banking app's quick actions (this replaced two earlier attempts: a 4-tile icon-grid, then plain pill buttons — see the design log for why each didn't work). `.dash-action--primary`/`--secondary` preserve the primary/secondary distinction the actions had as buttons: a solid black circle (`--ui-accent` background) for the primary action, an outlined white circle for the secondary one. Deliberately not colored per-action like typical banking-app references (red/green/blue/yellow) — that would reintroduce the multi-color palette the neutral black/white/gray decision removed.

## Form sectioning (invoice editor)

The invoice form's fields (Client, Invoice, Line items, Tax, Adjustments — one `<section className="form__section">` per group already in the JSX) used to sit on one continuous white background separated only by hairline dividers, which read as an undifferentiated wall of fields. `.form` now has its own gray (`--ui-stage`) background, and each `.form__section` is its own white bordered card (`--ui-radius-lg`) — the same "cards on a gray canvas" pattern used elsewhere in the app, applied here for the same reason: visual grouping without touching any of the form's actual field logic.

## Mobile preview (invoice editor)

The eye-icon "Mobile preview" button in the invoice editor's header (top-right) wraps `InvoicePreview` in a fixed 390×700px framed container (`.stage__mobile-frame`) when active. This works with zero changes to `InvoicePreview.jsx` itself — that component already measures its container via `ResizeObserver` and scales the invoice sheet to fit, so constraining the container to phone width is enough to simulate a mobile view. If the preview's scaling logic ever needs touching, check `SHEET_WIDTH_PX`/`fit()` in `InvoicePreview.jsx` — the mobile-frame CSS doesn't duplicate that logic, it just changes what the observer sees.

## Responsive

Already built in prior to this redesign; untouched by the color/type rework. Four breakpoints in `app.css`:

| Breakpoint | Behavior |
| --- | --- |
| `900px` | Invoice editor + live preview stack vertically with a toggle instead of a side-by-side split |
| `768px` | Nav collapses to a hamburger dropdown; dashboard, tables, toolbars, and filter tabs restack for narrow screens |
| `480px` | Quick-actions grid drops from 4 to 2 columns; titles shrink slightly |

Any new component should be checked at all three widths, not just desktop.

## Open items

- **Dashboard hero card is commented out** (`src/pages/HubPage.jsx`, in the JSX, not deleted) — its treatment is undecided. It was the one place Mossed Stone green still appeared; if it comes back changed, reconsider whether it should.
- No dedicated success/warning tokens exist yet beyond the status-badge hex pairs — if more "positive/attention" moments get added outside invoice status, promote these to root tokens instead of repeating hex values.
- The per-row status-change `<select>` in `JobsPage.jsx`'s table (inline-styled, `width:auto; height:28px`) is still a quick hack, not a proper component — flagged, not yet fixed.
