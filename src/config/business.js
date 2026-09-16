// Fixed business information. Edit here, nowhere else.

export const BUSINESS = {
  name: "Jonathan Folk Media",
  shortName: "Jonathan Folk",
  phone: "(778) 708-5335",
  email: "info@jonathanfolk.ca",
  taxId: "GST/HST: 734845001 RT0001",
};

export const SETTLEMENT = {
  heading: "Settlement of Invoice",
  lines: [
    "Jonathan accepts EMT or Cheques.",
    "Direct EMT payments to info@jonathanfolk.ca",
    "Please mark your Invoice No. on the EMT.",
    "Issue cheques payable to \u201CJonathan Folk Media\u201D.",
    "Please mark your Invoice No. on the cheque.",
    "If neither option works, please request a payment link for fulfillment via credit card.",
  ],
  // Appears on the reference PDF. Set to "" to hide.
  note: "Carrying charges after 30 days are 1.5% per month, compounded monthly, annual interest rate of 19.56%.",
};

export const TAX_DEFAULTS = {
  label: "GST",
  rate: 5, // percent
  enabled: true,
};

export const DUE_DATE_OFFSET_DAYS = 30;

export const CURRENCY = { locale: "en-CA" };
