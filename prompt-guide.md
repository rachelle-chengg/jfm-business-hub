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
