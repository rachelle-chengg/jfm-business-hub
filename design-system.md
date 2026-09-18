# Hub Design System

**Scope:** the app shell — nav, dashboard, invoices, clients, settings, and the invoice editor's form panel (`src/styles/app.css`). The invoice PDF/print template (`src/styles/invoice.css`) is a separate, already-tuned client-facing document and is **not** covered by this system.

All tokens live in `:root` at the top of `src/styles/app.css`. Change a value there, not at the point of use.

---

## Color

Source: `colour-palette.jpg` (brand palette — Mossed Stone / Polished Concrete / Cast Limestone / Beton Noir), named after the physical materials of a built property, which is what this business photographs.

| Brand name | Hex | Role | CSS token |
| --- | --- | --- | --- |
| Mossed Stone | `#2C3930` | Primary — accent, primary buttons, active states, "paid" status | `--ui-accent` |
| Polished Concrete | `#E9E8E3` | Primary — page background (light mode), dark-mode text | `--ui-stage` |
| Cast Limestone | `#DCD7C9` | Secondary — strong borders/dividers | `--ui-line-strong` |
| Beton Noir | `#1A1A1A` | Secondary — primary text/ink, dark bold buttons | `--ui-text` |

Everything else is derived to stay in the same family — nothing is an arbitrary off-palette pick:

| Token | Hex / value | Usage |
| --- | --- | --- |
| `--ui-bg` | `#FFFFFF` | Card/surface white, sits on top of the Polished Concrete page background |
| `--ui-muted` | `#6B675C` | Secondary text — a blend between Beton Noir and Cast Limestone |
| `--ui-line` | `#EEEAE0` | Hairline dividers — a lighter tint of Cast Limestone |
| `--ui-accent-hover` | `#3F4D42` | Lightened Mossed Stone, for hover on dark-on-light buttons |
| `--ui-focus` | `rgba(44, 57, 48, 0.28)` | Focus ring — Mossed Stone tint |
| `--ui-danger` | `#9A4632` | Overdue / destructive actions — a muted brick/rust, kept in the same desaturated material family instead of a stock alert red |

Functional status colors (draft / sent / overdue / paid — used by `.status-badge--*` and `.filter-tab--*`) stay semantically conventional (grey / blue / red / green) but every hue is pulled toward the brand's muted, warm-neutral register rather than bright SaaS defaults. "Paid" specifically reuses Mossed Stone directly, since it's both the brand's primary color and the conventional "success" hue — not a coincidence, a deliberate overlap.

**Dark mode** (`prefers-color-scheme: dark` or `[data-theme="dark"]`): background drops toward Beton Noir (`#201F1C` / `#1A1A1A`), text becomes Polished Concrete (`#E9E8E3`), and the focus ring lightens to a legible mossy green (`rgba(120,150,130,0.35)`) since dark-on-dark would disappear.

## Typography

Three roles, used with restraint — most of the UI is Inter; the other two only appear where they earn their place.

| Role | Font | Token | Where |
| --- | --- | --- | --- |
| Body / UI | Inter | `--ui-font` | Everything: nav, labels, buttons, table text, forms |
| Display | Space Grotesk | `--ui-font-display` | Only page titles (`.hub-page__title`), the dashboard greeting (`.dash-greeting__name`), and the hero balance figure (`.hero-card__amount`) |
| Data / mono | IBM Plex Mono | `--ui-mono` | Invoice numbers, dates, anything read as a data value rather than prose |

Sans-serif throughout, no serif — Space Grotesk was chosen over a serif specifically because its slightly technical, structured letterforms suit the concrete/limestone/stone material palette better than an editorial serif would.

## Icons

**Rule: icons are always outline style — `fill="none"`, `stroke="currentColor"`, with `strokeLinecap="round"` and `strokeLinejoin="round"`.** No filled glyphs, no sharp/mitered joins. Every icon currently in the hub (`HubPage.jsx`, `ClientsPage.jsx`, `SettingsPage.jsx`) already follows this — keep any new icon consistent with it.

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

- Controls (buttons, inputs, tags): `--ui-radius: 6px`
- Cards/containers (hero card, sections, tables): 10–14px, set per-component (not tokenized yet — see Open items)

## Responsive

Already built in prior to this redesign; untouched by the color/type rework. Four breakpoints in `app.css`:

| Breakpoint | Behavior |
| --- | --- |
| `900px` | Invoice editor + live preview stack vertically with a toggle instead of a side-by-side split |
| `768px` | Nav collapses to a hamburger dropdown; dashboard, tables, toolbars, and filter tabs restack for narrow screens |
| `480px` | Quick-actions grid drops from 4 to 2 columns; titles shrink slightly |

Any new component should be checked at all three widths, not just desktop.

## Open items / not yet tokenized

- Card border-radius (10px / 14px / 18px appear ad hoc across `.hero-card`, `.hub-section`, `.settings-card`, etc.) — could consolidate into `--ui-radius-lg` in a future pass.
- No dedicated success/warning tokens exist yet beyond the status-badge hex pairs — if more "positive/attention" moments get added outside invoice status, promote these to root tokens instead of repeating hex values.
