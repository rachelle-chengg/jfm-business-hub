/**
 * Editable business settings, persisted in localStorage.
 * Falls back to the hardcoded business.js values when no override is stored.
 */

import { BUSINESS, SETTLEMENT, TAX_DEFAULTS } from "../config/business.js";

const KEY = "jfm-settings-v1";

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    const stored = raw ? JSON.parse(raw) : {};
    return {
      business: { ...BUSINESS, ...stored.business },
      settlement: {
        heading: SETTLEMENT.heading,
        lines: SETTLEMENT.lines.join("\n"),
        note: SETTLEMENT.note,
        ...stored.settlement,
      },
      taxDefaults: { ...TAX_DEFAULTS, ...stored.taxDefaults },
    };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* quota */
  }
}

function defaultSettings() {
  return {
    business: { ...BUSINESS },
    settlement: {
      heading: SETTLEMENT.heading,
      lines: SETTLEMENT.lines.join("\n"),
      note: SETTLEMENT.note,
    },
    taxDefaults: { ...TAX_DEFAULTS },
  };
}
