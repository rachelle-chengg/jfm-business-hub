# JFM Business Hub — Design & Build Log

Auto-generated. Updated after every design decision, revision, or failure.
**Project:** Redesign and expansion of the JFM invoice generator into a Job-centric business hub for a real estate photographer.
**Started:** 2026-09-17
**Stack:** React 18 + React Router 7, Vite, plain CSS, localStorage (no backend yet), Google Drive/Sheets OAuth scaffolding present but not fully wired.

---

### [01] — Business Hub spec review

**What changed:** User asked to read `business-hub-photographer.md` (a CRM/ops spec for the photography business) and recommend additional features, referencing photography-CRM tools (HoneyBook/Dubsado/Táve) and Asana-style workflow patterns.
**Decision:** Appended a "Recommended Additions" section to the spec with three parts: (A) CRM-category features — digital contracts/e-signatures, lead-source tracking, post-delivery review requests, a lead-intake form, a read-only client portal; (B) Asana-style patterns — Kanban view of the Job pipeline, custom tags, saved views, a quick-add shortcut, an activity log, a standalone task list, soft delete; (C) a concrete fix for the app's biggest structural risk — no backend, localStorage only — by adopting Google Sheets as the structured-data backend and Google Drive as the file store, since OAuth scaffolding for both already existed in `src/lib/googleAuth.js` but was unused for Sheets.
**Values:** New section inserted after "Recommended Build Sequence," before "Key Product Principle," in `business-hub-photographer.md`.

### [02] — Initial visual redesign direction (later overridden)

**What changed:** User invoked the frontend-design skill and asked to redesign the entire existing "Invoice Hub" app (not just the spec).
**Decision:** First pass used an invented "golden hour" theme — warm amber/gold gradient accent, Fraunces serif for hero numbers/titles, IBM Plex Mono for data, viewfinder corner-bracket signature device on the hero card. Grounded in the spec's own weather/golden-hour language.
**Failed attempts:** This entire direction was replaced one turn later once the user supplied an actual brand palette — it was an invented palette, not the real brand identity, and didn't match.
**Values:** (superseded — see [03])

### [03] — Real brand palette applied

**What changed:** User provided `colour-palette.jpg` — an existing brand palette named after building materials — and said to use it instead.
**Decision:** Replaced every color token with values derived from the real palette. Primary/secondary colors mapped directly to design tokens; all derived tones (borders, muted text, status colors, avatar colors) were computed from these four rather than left arbitrary, so nothing in the UI is off-palette.
**Values:**
- Mossed Stone `#2C3930` → `--ui-accent` (primary buttons, active states, "paid" status)
- Polished Concrete `#E9E8E3` → `--ui-stage` (page background)
- Cast Limestone `#DCD7C9` → `--ui-line-strong` (borders)
- Beton Noir `#1A1A1A` → `--ui-text` (ink)
- Danger/overdue color shifted to a muted brick/rust `#9A4632` to stay in the same desaturated material family instead of a stock alert red.

### [04] — Serif swapped for sans-serif

**What changed:** User asked to use a sans-serif font instead of the serif (Fraunces) used in the golden-hour pass.
**Decision:** Replaced Fraunces with Space Grotesk for the display role (page titles, hero balance figure, dashboard greeting) — its structured, slightly technical letterforms fit the concrete/limestone material palette better than a serif would. Inter remains the body/UI font; IBM Plex Mono remains for data (invoice numbers, dates).
**Values:** Google Fonts link updated to `Inter:wght@400;500;600;700`, `Space+Grotesk:wght@500;600;700`, `IBM+Plex+Mono:wght@400;500;600`.

### [05] — Icon style rule set

**What changed:** User stated icons should always be rounded and outline style.
**Decision:** Confirmed all existing hub icons already comply (`fill="none"`, `stroke="currentColor"`, `strokeLinecap="round"`, `strokeLinejoin="round"` across `HubPage.jsx`, `ClientsPage.jsx`, `SettingsPage.jsx`) — no code change needed, but documented as a standing rule in `design-system.md` so future icons stay consistent.

### [06] — Responsiveness confirmed, not rebuilt

**What changed:** User asked for the redesign to work on both desktop and mobile.
**Decision:** Verified the app already had a full responsive system from an earlier "Hub redesign" commit (breakpoints at 900px, 768px, 480px covering nav collapse, editor/preview stacking, table scroll, quick-actions grid reflow). The color/type token rework touched none of these layout rules, so responsiveness carried through untouched — confirmed by listing breakpoints post-edit rather than assuming.

### [07] — Design system documented

**What changed:** User asked for a design-system.md file to be created alongside the redesign work.
**Decision:** Wrote `design-system.md` covering: color tokens with brand-name → hex → CSS-token mapping and rationale, typography roles, the icon rule, the corner-registration-mark signature element (with its CSS), shape/radius, responsive breakpoints, and an "open items" section (radius not yet tokenized, no dedicated success/warning tokens beyond status-badge pairs) so future work has a clear punch list.

### [08] — GitHub repo and Vercel project renamed

**What changed:** User asked to rename the GitHub repo and Vercel project to `jfm-business-hub`, reflecting the shift from "just an invoicing tool" to the fuller business hub.
**Decision:** Checked live tooling first (`gh auth status`, `vercel whoami`, `vercel domains ls`) before acting, since the live Vercel URL had no custom domain — only the auto-generated `.vercel.app` subdomain — which meant a project rename could plausibly break the URL in active use. Confirmed with the user before proceeding given that risk. Renamed both; verified afterward that the production alias `jfm-invoice.vercel.app` is a manually pinned alias independent of the project name, so it kept resolving (200) through the rename with no actual breakage.
**Values:** GitHub: `rachelle-chengg/invoice-generator` → `rachelle-chengg/jfm-business-hub` (local `origin` remote auto-updated by `gh repo rename`). Vercel: project `jfm-invoice-generator` → `jfm-business-hub`; live URL unchanged (`https://jfm-invoice.vercel.app`).

### [09] — Job-centric IA restructure

**What changed:** User said they want to take the project further than "just an invoicing tool" and, when asked where to start, chose to restructure the nav/dashboard around Jobs now (ahead of building out the full Job data model), explicitly protecting the working invoice generator from breakage.
**Decision:** Added a minimal but real `Job` entity (`src/lib/jobs.js`, localStorage-backed, mirroring the existing `db.js` patterns) and a new `/jobs` page (`JobsPage.jsx`) with inline add/edit, a status-pipeline filter, and a table view — deliberately scoped to list-view CRUD only, no Kanban/weather/drone/cancellation-fee logic yet, since that was explicitly deferred in favor of the IA change. Reordered the hub nav to Dashboard → Jobs → Clients → Invoices → Settings per the spec's own site map. Restructured the dashboard (`HubPage.jsx`) to lead with "Today's Schedule" (jobs due today/tomorrow) and a merged "Needs Attention" section (unconfirmed jobs + the existing invoice overdue/due-soon reminders, unchanged), before the existing hero balance card and Recent Invoices — both of which were left fully intact, since those are the parts of the invoice feature the user said were "working amazing."
**Values:** Job status pipeline: `inquiry → booked → confirmed → shot → delivered → invoiced → paid`, plus `cancelled`. Status-badge colors grouped by meaning rather than one hue per status (grey=not started, blue=in progress, Mossed-Stone-green=positive/complete, rust=cancelled) to keep the palette from fragmenting as more statuses were added.
**Failed attempts:** None — build verified clean (`npm run build`) after the full JSX restructure before treating it as done.

### [21:20] — Real structural redesign, after a false start

**What changed:** User sent screenshots of the live dashboard and Clients page and called the UI "very outdated," questioning whether the frontend-design skill had actually been used properly.
**Decision:** It hadn't been, not fully — [02]/[03]/[04] only ever swapped color tokens and fonts on top of the original "Invoice Hub" template layout; the actual structure (card shapes, quick-action tiles, filter tabs, type hierarchy) was untouched, and every change had been made blind since this environment has no screenshot/browser tool. With the screenshots as ground truth, did a real structural pass: removed the 4-tile icon-grid quick actions entirely (identified as the single most generic AI-dashboard pattern on the page, and redundant with the nav) in favor of two real primary/secondary buttons; introduced actual typographic hierarchy (page titles much bigger/bolder, section headings shrunk to small tracked uppercase "eyebrow" labels, dashboard greeting demoted to quiet/muted) where before every heading was roughly the same size and weight; converted filter tabs from pill buttons to an underline-tab treatment; tightened every container's border-radius to a single consistent 6px instead of the previous scattered 6/10/14/18/20px mix, for a more drafted/architectural feel that fits the material-named brand palette; enlarged the hero card's corner-mark signature from a barely-visible 20px/1.5px hairline to a legible 36px/2px mark, and made the balance figure itself much bigger (38px → 60px) so the hero card reads as a real statement instead of a generic stat-card widget.
**Failed attempts:** The [02]–[04] passes — recoloring/refonting the existing generic template and calling it a redesign. Root cause: treated a visual-identity task (palette, type) as separable from and sufficient without a structural/compositional pass (layout, hierarchy, component shapes), and had no way to self-verify since there's no visual tooling in this environment — should have asked for a screenshot much earlier instead of iterating blind across multiple turns.
**Values:** Hero amount: 38px → 60px (34px → 40px at 768px, 34px at 480px). Corner marks: 20px/1.5px → 36px/2px (26px at 768px). Page title: 24px → 34px. Section-label pattern: 12.5px, 700 weight, 0.08em tracking, uppercase, `--ui-muted` — applied consistently to `.dash-section-title`, `.hub-section__title`, `.client-form-card__title`, `.settings-card__title`. Container radius standardized to 6px (was 6/10/14/18/20px). Filter tabs: pill → 2px bottom-border underline, colored per status.

### [21:33] — Site structure gap analysis: added Job Detail and Client Detail pages

**What changed:** User pushed back again — "site structure optimized for the project, not only for invoicing/features I designed in the past" — then asked directly to determine whether more subpages were needed. Also asked for jfm-business-hub.vercel.app as the canonical URL, a left-aligned desktop layout to suit the new sidebar, and removal of the "+ New Invoice" nav CTA.
**Decision:** Compared the live site's structure against `business-hub-photographer.md`'s own site map. Found Jobs, Clients, and Invoices existed only as three parallel, unconnected localStorage lists — no linking between them at all, which contradicts the spec's central premise ("everything revolves around the Job... this avoids re-entering the same data"). Added the two structurally-missing pieces: `/jobs/:id` (Job Detail — Shoot Information, Invoice, Delivery, Cancellation sub-sections, matching the spec's Job Detail layout) and `/clients/:id` (Client Detail — contact info, job history, invoice history, totals). Wired a real cross-link: Job Detail's "Create invoice from this job" prefills the invoice form (client name, one line item from the job's package/address) via React Router navigation state, and tags the resulting invoice with a `jobId` so the Job Detail page can find and show it afterward. This required a two-line additive change to `InvoiceEditorPage.jsx` (read `location.state.initialInvoice` when creating new) that leaves the plain "+ New Invoice" flow byte-for-byte identical when no state is passed — deliberately minimal touch to the component the user explicitly wants protected.
Also: confirmed `.vercel.app` subdomains are globally unique (not per-account) before assuming `jfm-business-hub.vercel.app` was available — it was, claimed it via `vercel alias set`. Confirmed `jfm-invoice.vercel.app` is NOT a static pin as assumed in [08] — production aliases actually do follow the latest `--prod` deploy automatically, corrected that understanding here rather than leaving the wrong mental model in the log.
**Failed attempts:** None this entry, but flagging scope explicitly: did NOT build `/weather`, `/automations`, or `/reports` (all listed in the spec's site map) — those are Phase 2/3 in the spec's own roadmap and depend on integrations (weather API, SMS) that don't exist yet. Cancellation on the new Job Detail page also stops at recording reason/date — no fee calculation, matching the scope boundary already set when Jobs was first built.
**Values:** New routes: `/jobs/:id`, `/clients/:id`. Invoice schema gains an optional `jobId` field (present only on invoices created via the new flow). Vercel: production alias behavior corrected — `jfm-invoice.vercel.app` auto-follows `--prod` deploys; `jfm-business-hub.vercel.app` is now also live pointing at the same deployment.

### [10] — Design decision log started

**What changed:** User asked for a running design decision log/journal to explain choices later and spot room for improvement.
**Decision:** Started this file (`design-log.md`) at the repo root rather than the skill's default `/mnt/user-data/outputs/` path, since this is a local git repo the user owns and reads directly — the log belongs alongside `design-system.md` and `business-hub-photographer.md`, not in a sandboxed output folder that doesn't exist in this environment. Backfilled entries [01]–[09] from the session so far since real per-decision timestamps weren't captured at the time; entries from here on will use real `HH:MM` timestamps.
