const KEY = "jfm-invoice-draft-v1";

export function loadDraft() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDraft(invoice) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(invoice));
  } catch {
    // Storage unavailable (private mode, quota). The app still works in memory.
  }
}
