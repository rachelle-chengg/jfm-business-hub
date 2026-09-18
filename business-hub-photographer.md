# Business Hub: Real Estate Photographer

**Last updated:** September 17, 2026

---

## Overview

A single-user web app for a solo real estate photographer completing at least 5 shoots per week. The goal is to replace a fragmented stack (Google Calendar, InDesign invoices, SMS, WhatsApp, Gmail) with one hub that tracks every job from booking to payment and automates the communication and admin work that currently falls through the cracks.

The hub does **not process payments**. Payments happen externally, and the photographer records payment status inside the hub.

**Primary pain points being solved, ranked:**

1. On-site and late cancellations with no structured follow-up or cancellation fee tracking
2. Invoice creation, late fees, and payment tracking
3. Weather-dependent rescheduling
4. Client and booking management scattered across apps
5. Drone planning and airspace checks

---

## Core Data Model

Everything revolves around the **Job**. Invoices, reminders, weather flags, drone information, cancellation records, and client records are all connected to a shoot rather than managed as completely separate workflows.

This avoids re-entering the same data such as address, client name, package, and shoot date across multiple tools.

```text
Client
  └── Job
        ├── Address
        ├── Date / time
        ├── Package
        ├── Shoot type
        ├── Status
        ├── Access notes
        ├── Drone requirements
        ├── Cancellation
        │     ├── Cancelled date / time
        │     ├── Reason
        │     └── Cancellation fee
        ├── Invoice
        │     ├── Line items
        │     ├── Due date
        │     ├── Late fees
        │     └── Payment status
        ├── Reminders
        │     ├── Sent messages
        │     └── Upcoming scheduled messages
        ├── Weather snapshot
        │     ├── Forecast
        │     └── Weather risk
        └── Delivery
              ├── Gallery link
              └── Delivery date
```

### Job Status Pipeline

`Inquiry → Booked → Confirmed → Shot → Delivered → Invoiced → Paid`

Additional exception statuses:

`Cancelled → Cancellation Fee Pending → Cancellation Fee Invoiced → Paid`

Most automation logic derives from these statuses.

Examples:

* **Invoice needed:** jobs in `Delivered` with no linked invoice
* **Unconfirmed:** jobs in `Booked` approaching the confirmation deadline
* **Payment overdue:** invoice is past its due date and has not been marked paid
* **Late fee required:** overdue invoice meets the configured late-fee rule
* **Cancellation fee required:** cancelled job meets the cancellation policy threshold

---

# Site Map

## `/` — Today Dashboard

The dashboard should answer one question immediately:

**What do I need to deal with today?**

### Today's Schedule

* Today's shoots
* Tomorrow's shoots
* Time and address
* Client
* Package / shoot type
* Drone indicator
* Current job status
* Weather snapshot
* Quick access to job details

### Needs Attention

* Unconfirmed upcoming jobs
* Delivered jobs waiting for invoices
* Overdue invoices
* Late fees that need to be added
* Cancellation fees that need to be invoiced
* Weather-risk shoots
* Drone shoots requiring airspace review

### Quick Actions

* Add job
* Create invoice
* Mark invoice paid
* Record cancellation

---

## `/jobs` — Jobs

### Views

* List
* Calendar
* Filter by status
* Filter by date
* Filter by client
* Filter by shoot type
* Filter drone shoots
* Filter cancelled jobs

### `/jobs/new`

New job form:

* Client
* Property address
* Date
* Time
* Package
* Shoot type
* Drone required
* Access instructions
* Contact on site
* Notes
* Cancellation policy acknowledgment

### `/jobs/[id]` — Job Detail

#### Shoot Information

* Client
* Property address
* Date / time
* Access notes
* Shoot type
* Package
* Status
* Contact on site

#### Weather

* 7-day forecast
* Rain probability
* Cloud conditions
* Wind
* Sunset
* Golden hour
* Weather risk indicator

#### Drone

* Drone required: Yes / No
* Airspace status
* Nearby restrictions
* Manual airspace check link
* Wind conditions
* Drone notes

#### Communication

* Reminder log
* Upcoming reminders
* Send manual message
* Copy message for WhatsApp

#### Invoice

* Create invoice
* View linked invoice
* Invoice status
* Due date
* Outstanding amount
* Late fee status

#### Delivery

* Gallery link
* Delivered date
* Mark delivered

#### Cancellation

If cancelled:

* Cancellation date / time
* Cancellation reason
* Who cancelled
* Notice provided
* Cancellation fee required: Yes / No
* Cancellation fee amount
* Fee invoice status
* Notes

---

## `/clients` — Clients

List of realtors, brokerages, property managers, and other repeat clients.

### Filters

* Outstanding balance
* Overdue invoices
* Last shoot date
* Shoot volume

### `/clients/new`

* Name
* Brokerage / company
* Email
* Phone
* Preferred communication channel
* Billing information
* Notes

### `/clients/[id]`

* Contact information
* Preferred communication channel
* Full job history
* Cancelled jobs
* Outstanding invoices
* Overdue invoices
* Paid invoices
* Cancellation fees
* Late fees
* Total billed
* Notes

---

## `/invoices` — Invoices

The hub **creates and tracks invoices but does not process payments**.

Payments happen externally.

### Invoice Statuses

`Draft → Sent → Due → Overdue → Paid`

### Filters

* Draft
* Sent
* Due
* Overdue
* Paid
* Late fee applied
* Cancellation fee

### `/invoices/new`

Invoices are normally created from a Job and automatically prefilled with:

* Client
* Billing information
* Property address
* Shoot date
* Package
* Add-ons
* Drone services
* Cancellation fees if applicable
* Other line items

### `/invoices/[id]`

* View
* Edit
* Duplicate
* Download PDF
* Email invoice
* Mark as sent
* Mark as paid manually
* Record payment date
* Record payment method
* Add late fee
* View payment reminder history

### Payment Methods

Payments are handled outside the platform.

The invoice can display instructions such as:

* Interac e-Transfer
* Cheque
* Other external payment method

The photographer manually marks the invoice as paid once payment is received.

---

# Cancellation Fees

Cancellation management should be tied directly to the Job.

## Cancellation Policy Settings

Configure:

* Cancellation notice threshold
* Cancellation fee type
* Flat fee or percentage
* Fee amount
* Exceptions
* Default policy text

Example:

```text
More than 24 hours notice → No fee
Less than 24 hours notice → $X cancellation fee
On-site cancellation → $Y cancellation fee
```

The exact rules should remain configurable rather than hard-coded.

## Cancellation Flow

When **Cancel Job** is selected:

1. Record when the cancellation occurred.
2. Record the cancellation reason.
3. Calculate how much notice was provided.
4. Compare it with the configured cancellation policy.
5. Flag whether a cancellation fee applies.
6. Allow the photographer to override the fee.
7. Generate an invoice containing the cancellation fee.
8. Track the fee like any other invoice.

The system should **suggest**, not automatically send, cancellation fee invoices.

---

# Late Payment Fees

Late payment fees are attached to invoices.

## Late Fee Settings

Configure:

* Standard invoice payment terms
* Grace period
* Flat or percentage late fee
* Fee amount / percentage
* Whether fees repeat
* Maximum late fee if applicable
* Late payment policy text

Example:

```text
Invoice issued
      ↓
Due date
      ↓
Grace period
      ↓
Invoice becomes overdue
      ↓
Late fee eligible
      ↓
Photographer reviews
      ↓
Late fee added
```

The photographer should remain in control of applying the fee.

The dashboard can show:

**3 invoices eligible for late fees**

rather than automatically charging or modifying invoices.

---

## `/weather` — Weather Planning

Because real estate photography and drone work depend heavily on conditions, this becomes a planning tool rather than simply displaying a forecast.

### 7-Day Job Outlook

Show booked jobs against:

* Rain probability
* Cloud cover
* Wind speed
* Temperature
* Sunset
* Golden hour

### Risk Flags

Example:

```text
LOW RISK
12% rain
8 km/h wind

WEATHER RISK
78% rain
Heavy cloud

DRONE RISK
Wind conditions may affect drone shoot
```

### Rescheduling

For weather-risk jobs:

**Propose New Times**

generates a message using available upcoming schedule openings.

The photographer reviews the message before sending.

---

# Drone Planning

Drone photography is part of the regular workflow and should not be treated as a later nice-to-have.

Every Job should have:

`Drone required: Yes / No`

When enabled, the Job displays:

* Airspace check
* Nearby restrictions
* Wind forecast
* Rain
* Visibility
* Sunrise / sunset
* Golden hour
* Drone-specific notes

### Airspace

The system should initially provide an easy link or shortcut to the appropriate official drone airspace information rather than attempting to determine whether a flight is legally permitted.

The photographer remains responsible for confirming flight requirements and restrictions.

---

## `/automations` — Reminders & Automations

### Reminder Rules

Configure when to send:

* 48h confirmation request
* 24h shoot reminder
* Pre-shoot preparation checklist
* Weather warning
* Post-shoot delivery notification
* Invoice reminder
* Overdue invoice reminder
* Late fee warning

### Channels

Phase 1:

* Email

Phase 2:

* SMS

Later:

* WhatsApp

### Automation Log

Every automated communication records:

* Client
* Job
* Message
* Channel
* Date / time
* Status

Manual messages can also be logged.

---

## `/reports` — Reports

### Revenue

* Monthly billed revenue
* Monthly collected revenue
* Quarterly
* Annual

### Payments

* Outstanding total
* Overdue total
* Average days to payment
* Late fees charged
* Late fees collected

### Clients

* Top clients by revenue
* Top clients by shoot volume
* Repeat booking rate

### Jobs

* Shoots per week
* Shoots per month
* Shoot type breakdown
* Drone shoot volume
* Cancellation rate
* Late cancellation rate

### Business Expenses

* Expenses
* Mileage
* GST collected
* GST-related summary

---

## `/settings` — Settings

### Business

* Business name
* Address
* GST number
* Logo
* Contact information

### Packages & Pricing

* Packages
* Add-ons
* Drone rates
* Rush fees
* Default line items

### Invoice Settings

* Invoice template
* Payment terms
* Payment instructions
* Late fee rules
* Invoice numbering

### Cancellation Settings

* Cancellation notice threshold
* Cancellation fee
* On-site cancellation fee
* Cancellation policy text

### Integrations

* Google Calendar
* Email
* Twilio
* Weather API
* Mapping / geocoding
* Drone / airspace resources

### Notifications

* Weather alerts
* Unconfirmed booking alerts
* Invoice alerts
* Overdue invoice alerts
* Cancellation fee alerts

---

# MVP — Phase 1

| Feature                   | Notes                                                       |
| ------------------------- | ----------------------------------------------------------- |
| Client records            | Contact information, billing info, preferred channel, notes |
| Job management            | Full status pipeline, address, access notes                 |
| Drone indicator           | Track which jobs require drone photography                  |
| Cancellation tracking     | Record cancellations and determine fee eligibility          |
| Invoice creation          | Prefilled from Job                                          |
| Cancellation fee invoices | Generate from cancelled Job                                 |
| Invoice tracking          | Draft / Sent / Due / Overdue / Paid                         |
| Late fee tracking         | Flag eligible overdue invoices and manually add fee         |
| External payment tracking | Manual Mark as Paid                                         |
| Today dashboard           | Today/tomorrow + Needs Attention                            |
| Basic weather             | Forecast on Job detail                                      |
| Google Calendar import    | Import existing schedule                                    |

---

# Phase 2

| Feature                 | Notes                                         |
| ----------------------- | --------------------------------------------- |
| Google Calendar mirror  | Hub becomes source of truth                   |
| Automated confirmations | 48h + 24h                                     |
| Pre-shoot checklist     | Automatically send preparation information    |
| Invoice reminders       | Due + overdue reminders                       |
| Late fee reminders      | Notify photographer when fee becomes eligible |
| Weather risk flags      | Flag poor shooting conditions                 |
| SMS                     | Twilio                                        |
| Drone weather           | Wind + weather warnings for drone jobs        |

---

# Phase 3

| Feature                  | Notes                                        |
| ------------------------ | -------------------------------------------- |
| Weather rescheduling     | Generate proposed alternative times          |
| Sunset / golden hour     | Per property                                 |
| Drone airspace shortcuts | Airspace information attached to Job         |
| WhatsApp                 | Add after email and SMS workflows are stable |
| Reports                  | Revenue, clients, jobs, GST                  |
| Expenses                 | Business expense tracking                    |
| Mileage                  | Mileage log for shoots                       |

---

# Later / Nice to Have

| Feature                    | Notes                                                 |
| -------------------------- | ----------------------------------------------------- |
| Online booking form        | Public booking requests enter as Inquiry              |
| Client portal              | View jobs, invoices, and delivery links               |
| Delivery tracking          | Gallery + delivery date                               |
| Advanced drone planning    | More detailed airspace / flight planning integrations |
| Client analytics           | Cancellation and payment history                      |
| Multiple invoice templates | Standard, rush, cancellation, packages                |

---

# Google Calendar Strategy

Avoid full two-way synchronization in the MVP.

### Initial Setup

```text
Existing Google Calendar
        ↓
Import existing shoots
        ↓
Create Jobs in Hub
```

After migration:

```text
Business Hub
   ↓
Source of truth
   ↓
Google Calendar
```

The photographer manages Jobs in the hub while Google Calendar acts primarily as a convenient calendar view.

---

# Payment Strategy

**No payments are processed through the Business Hub.**

The hub is responsible for:

```text
Create invoice
      ↓
Send invoice
      ↓
Track due date
      ↓
Send reminders
      ↓
Flag overdue
      ↓
Suggest late fee
      ↓
Photographer receives payment externally
      ↓
Mark as Paid
```

This keeps financial functionality significantly simpler while still solving the administrative problem.

---

# Recommended Build Sequence

### Weeks 1–2

Clients + Jobs + packages + status pipeline

### Weeks 3–4

Invoice generation + PDF export + manual payment tracking

### Week 5

Cancellation workflow + cancellation fee logic + late payment fee logic

### Weeks 6–7

Today dashboard + Needs Attention system

### Weeks 8–9

Google Calendar integration + email reminders

### Weeks 10–11

Weather + drone indicators + weather risk flags

### Week 12+

SMS + weather rescheduling + reporting + mileage

---

# Recommended Additions

Reviewed against two references: established practice in photography-specific business tools (HoneyBook, Dubsado, Táve — the direct competitive category for this product) and workflow-tool design patterns (Asana) that fit the Job Status Pipeline already defined above. These are additions to weigh, not replacements for anything above. In-app payment processing remains explicitly out of scope, consistent with the Payment Strategy section.

## A. CRM Features

| Feature | Notes |
| --- | --- |
| Digital contracts & e-signatures | Shoot agreements, model releases, property-access authorization. Close to universal in competing photographer-business tools and covers a real liability gap the Cancellation and Drone sections don't address. |
| Lead source / referral tracking | A field on Client and/or Job for how they found the photographer (referral, brokerage repeat business, Google, etc.). Feeds the "repeat booking rate" metric already listed under `/reports`. |
| Post-delivery review request | Once a Job reaches `Delivered`, prompt sending a Google/testimonial review link. Fits the existing Reminder Rules pattern under `/automations`. |
| Lead / inquiry intake form | The pipeline starts at `Inquiry`, but there's no capture flow for an inbound inquiry before it becomes a booked Job. Worth pulling forward from "Online booking form" below, since it directly targets pain point #4 (scattered client/booking management). |
| Read-only client portal | Narrower than the client portal listed under Later / Nice to Have: a view-only link for a client to check shoot details, delivery/gallery link, and invoice status — no payment capability, so it stays inside the existing payment boundary. |

## B. Workflow & UX Patterns

| Feature | Notes |
| --- | --- |
| Kanban board view of the Job pipeline | The status pipeline (`Inquiry → Booked → Confirmed → Shot → Delivered → Invoiced → Paid`) maps directly onto a drag-between-columns board, alongside the List and Calendar views already planned for `/jobs`. |
| Custom tags / labels | Free-form labels on Jobs and Clients (e.g. "VIP," "repeat," "difficult access") to supplement the fixed filter dimensions without adding new schema fields for every segmentation need. |
| Saved / custom views | Persisted filter combinations on `/jobs` and `/invoices` (e.g. "This week's shoots," "Needs invoice") instead of re-applying filters each visit. |
| Global quick-add / jump-to | A single shortcut to create a Job or Invoice, or jump to a Client, from anywhere in the hub — supports the "open → see what needs attention → handle it → move on" principle stated below. |
| Per-entity activity log | A history of who changed what and when, particularly for fee overrides and manual "mark paid" actions — the actions this spec already treats as sensitive and reviewable, but doesn't currently log. |
| Standalone task list | A general business-admin checklist not tied to any Job (e.g. "renew drone insurance"), separate from the Job-linked pre-shoot preparation checklist. |
| Soft delete / trash | A recovery window on deleted Jobs, Clients, and Invoices instead of permanent deletion. |

## C. Data Backend: Google Sheets + Drive

Nothing above specifies where the hub's data actually lives. Left unaddressed, that's a real risk: without a backend, database, or backup, a cleared browser cache or a new device means total data loss — and the risk grows as the data model expands to cover Jobs, weather snapshots, and communication logs.

The recommended resolution is to use **Google Sheets** as the structured-data backend and **Google Drive** as the file store, rather than standing up custom server infrastructure:

* **Google Sheets** — one sheet per entity: Clients and Invoices first, Jobs once that entity is built. A Sheet also doubles as the export format the Business Expenses / GST section under `/reports` already wants, since it's naturally shareable with an accountant.
* **Google Drive** — continues holding generated invoice PDFs, extended to also hold signed contracts and model releases (see Digital contracts & e-signatures above) and any delivery/gallery files or links — one photographer-owned Drive as the single file store instead of scattered attachments across email and messaging apps.

This keeps the hub's data backend as something the solo photographer already has — a Google account — rather than a piece of infrastructure to maintain, consistent with the Key Product Principle below.

---

# Key Product Principle

The app should not become another complicated piece of business software that the photographer has to maintain.

With approximately **5+ shoots per week**, the system should optimize for:

**Open dashboard → see what needs attention → handle it → move on.**

Where possible, information should flow from the Job rather than being entered again.

```text
JOB
 ↓
Client
 ↓
Schedule
 ↓
Weather / Drone
 ↓
Shoot
 ↓
Delivery
 ↓
Invoice
 ↓
Payment
```

Automation should handle **reminding and flagging**, while actions involving money, fees, cancellations, or client communication should generally remain reviewable by the photographer before they are finalized.
