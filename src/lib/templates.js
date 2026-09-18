/**
 * Multiple invoice templates — same invoice layout, swappable business info,
 * payment instructions, and tax defaults.
 *
 * An invoice snapshots its chosen template's data at creation time (the same
 * way client info is already copied onto an invoice rather than referenced
 * live) — editing a template later never changes invoices already created
 * from it.
 */

import { BUSINESS, SETTLEMENT, TAX_DEFAULTS } from "../config/business.js";

const KEY = "jfm-templates-v1";
const DEFAULT_TEMPLATE_ID = "default";

function defaultTemplate() {
  return {
    id: DEFAULT_TEMPLATE_ID,
    name: "Default",
    business: { ...BUSINESS },
    settlement: {
      heading: SETTLEMENT.heading,
      lines: SETTLEMENT.lines.join("\n"),
      note: SETTLEMENT.note,
    },
    taxDefaults: { ...TAX_DEFAULTS },
  };
}

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const stored = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(stored) || stored.length === 0) return [defaultTemplate()];
    return stored;
  } catch {
    return [defaultTemplate()];
  }
}

function write(templates) {
  try {
    localStorage.setItem(KEY, JSON.stringify(templates));
  } catch {
    /* quota or private mode */
  }
}

function uid() {
  return `tpl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function listTemplates() {
  return read();
}

export function getTemplate(id) {
  const templates = read();
  return templates.find((t) => t.id === id) ?? templates[0];
}

export function saveTemplate(template) {
  const templates = read();
  const idx = templates.findIndex((t) => t.id === template.id);
  if (idx >= 0) {
    templates[idx] = { ...templates[idx], ...template };
  } else {
    templates.push({ ...template, id: template.id ?? uid() });
  }
  write(templates);
  return templates[idx >= 0 ? idx : templates.length - 1];
}

export function createTemplate(name) {
  const templates = read();
  const base = defaultTemplate();
  const template = { ...base, id: uid(), name: name || "New template" };
  templates.push(template);
  write(templates);
  return template;
}

export function duplicateTemplate(id, name) {
  const source = getTemplate(id);
  const templates = read();
  const copy = { ...source, id: uid(), name: name || `${source.name} copy` };
  templates.push(copy);
  write(templates);
  return copy;
}

export function deleteTemplate(id) {
  const remaining = read().filter((t) => t.id !== id);
  write(remaining.length > 0 ? remaining : [defaultTemplate()]);
}
