# Reusable Prompt Guide

Prompts that worked well on this project, written to be copy-pasted into a fresh
conversation on a different project. Ask me to add a new one any time something
here works particularly well and is worth reusing elsewhere.

---

## Rebuild the invoice generator for a different client

Use when: starting an invoicing tool from scratch in a codebase that can't just
fork this repo (if it can, skip the prompt — duplicate the repo and edit
`src/config/business.js` instead, see [design-log.md](design-log.md)).

Key lesson baked in: attach the actual reference file (a PDF of the target
invoice, or the real `invoice.css`) — describing the design in words was not
enough to reproduce it exactly last time.

> Build a client-side invoice generator. Attached is a PDF of an invoice — match it exactly: layout, spacing, fonts, colors, every section, pixel for pixel. A form on one side with client info, line items, tax/GST settings, and due dates, with a live preview on the other side that updates as you type and matches the attached reference exactly. PDF export that preserves vector text (prefer the browser's native print-to-PDF over canvas rasterization, which blurs text). Track invoice status (Draft → Sent → Paid, with Overdue derived automatically from the due date). All business details (name, contact, tax ID, payment instructions) should live in one config file so it's reusable for a different business later. Dashboard showing outstanding balance, overdue/due-soon reminders with pre-written reminder email copy, and a simple client list. Data storage: connect to my Google account — Google Sheets as the backend for invoices/clients, Google Drive for the generated PDFs — not just browser localStorage.

---

## Apply a real brand palette instead of an invented one

Use when: an AI-generated redesign feels generic, or you have an actual brand
palette image/PDF you haven't handed over yet.

> Refer to [attach palette file] for the colours — extract the exact hex values and named colors from it, and replace every color in the design with a token derived from that palette. Don't leave any arbitrary off-palette hex values in — even secondary things like status badges, avatar colors, and hover states should be derived from these colors so the whole system stays coherent.

---

## Ask for a design-system doc alongside a redesign

Use when: you want a durable reference of the tokens/rules chosen, not just the
code.

> As you build this, also create a design-system.md file documenting: the color tokens (name, hex, what each is used for and why), the typography roles and where each is used, any icon style rules, the signature/defining visual element and why it fits the subject, spacing/shape conventions, and responsive breakpoints. Keep it updated as the design evolves so it stays a reliable reference, not a one-time snapshot.

---

## Ask for an ongoing design decision log

Use when: you want to be able to explain *why* something looks the way it does
later, not just what it looks like now.

> Keep a running design decision log as we work — a markdown file, one entry per decision, each with what changed, what was decided and why, any failed attempts and what was learned from them, and specific values confirmed (hex codes, px, font names). Update it after every design decision or revision without me having to ask, and don't just describe the final state — capture the reasoning and anything that didn't work along the way.

---

## Set up every new coding project the same way

Use when: starting any new project, to get self-maintaining docs and a visible
git history from day one instead of requesting each piece separately. Best
saved into a `CLAUDE.md` at the project root (loads automatically every
session) rather than pasted into chat each time.

Note: point 4 deliberately overrides the normal "only commit when asked"
default — that's what makes it work, but it means proactive `git push` in any
project this is dropped into.

> Set this project up with three living docs and a visible version history from day one, and keep maintaining them without me having to ask each time:
>
> 1. **design-system.md** — the current design tokens (colors with hex values and *why* each was chosen, typography roles, icon/shape rules, the signature element, responsive breakpoints). Update it whenever a design decision changes — it should always reflect the current state, not a one-time snapshot.
> 2. **design-log.md** — a running decision journal, one entry per decision/revision/failure: what changed, what was decided and why, what was tried and didn't work (if anything), and specific values confirmed (hex, px, font, copy). Add an entry after every design decision automatically, not just when I ask.
> 3. **prompt-guide.md** — reusable prompts that worked well on this project, written so I can paste them into a different project later. Add one whenever something works particularly well, or whenever I say "save that as a prompt."
> 4. **Git history as a visible record of progress** — commit and push to GitHub after each meaningful milestone (a feature working, a design pass finished, a checkpoint I'd want to look back on), not only when I explicitly ask. Each commit message should explain what changed and why, so the history itself tells the story of how the project evolved.
