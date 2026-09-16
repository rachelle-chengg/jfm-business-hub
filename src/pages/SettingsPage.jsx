import { useState } from "react";
import { loadSettings, saveSettings } from "../lib/settings.js";

export default function SettingsPage() {
  const [settings, setSettings] = useState(() => loadSettings());
  const [saved, setSaved] = useState(false);

  const setBusiness = (patch) =>
    setSettings((s) => ({ ...s, business: { ...s.business, ...patch } }));
  const setSettlement = (patch) =>
    setSettings((s) => ({ ...s, settlement: { ...s.settlement, ...patch } }));
  const setTax = (patch) =>
    setSettings((s) => ({ ...s, taxDefaults: { ...s.taxDefaults, ...patch } }));

  function handleSave(e) {
    e.preventDefault();
    if (!window.confirm("Save these settings? They will apply to all new invoices.")) return;
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const { business, settlement, taxDefaults } = settings;

  return (
    <div className="hub-page">
      <div className="hub-page__head">
        <h1 className="hub-page__title">Settings</h1>
      </div>

      <form onSubmit={handleSave}>
        {/* Business info */}
        <div className="settings-card">
          <h2 className="settings-card__title">Business information</h2>
          <p className="settings-card__hint">Appears on every invoice header and footer.</p>
          <div className="field-row">
            <div className="field">
              <label className="field__label" htmlFor="s-name">Business name</label>
              <input className="input" id="s-name" value={business.name}
                onChange={(e) => setBusiness({ name: e.target.value })} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="s-short">Short name</label>
              <input className="input" id="s-short" value={business.shortName}
                onChange={(e) => setBusiness({ shortName: e.target.value })} />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field__label" htmlFor="s-phone">Phone</label>
              <input className="input" id="s-phone" type="tel" value={business.phone}
                onChange={(e) => setBusiness({ phone: e.target.value })} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="s-email">Email</label>
              <input className="input" id="s-email" type="email" value={business.email}
                onChange={(e) => setBusiness({ email: e.target.value })} />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field__label" htmlFor="s-website">Website</label>
              <input className="input" id="s-website" value={business.website || ""}
                onChange={(e) => setBusiness({ website: e.target.value })} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="s-taxid">Tax ID</label>
              <input className="input" id="s-taxid" value={business.taxId || ""}
                onChange={(e) => setBusiness({ taxId: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Settlement / payment notes */}
        <div className="settings-card">
          <h2 className="settings-card__title">Payment instructions</h2>
          <p className="settings-card__hint">Shown in the "Settlement of Invoice" section. One instruction per line.</p>
          <div className="field">
            <label className="field__label" htmlFor="s-heading">Section heading</label>
            <input className="input" id="s-heading" value={settlement.heading}
              onChange={(e) => setSettlement({ heading: e.target.value })} />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="s-lines">Instructions (one per line)</label>
            <textarea
              className="input settings-textarea"
              id="s-lines"
              rows={6}
              value={settlement.lines}
              onChange={(e) => setSettlement({ lines: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="s-note">Carrying charges / interest note</label>
            <input className="input" id="s-note" value={settlement.note}
              onChange={(e) => setSettlement({ note: e.target.value })} />
            <p className="field__hint">Appears as a footnote below the payment instructions.</p>
          </div>
        </div>

        {/* Tax defaults */}
        <div className="settings-card">
          <h2 className="settings-card__title">Default tax settings</h2>
          <p className="settings-card__hint">Applied to all new invoices. You can override per invoice.</p>
          <div className="field-row">
            <div className="field">
              <label className="field__label" htmlFor="s-taxlabel">Tax label</label>
              <input className="input" id="s-taxlabel" value={taxDefaults.label}
                onChange={(e) => setTax({ label: e.target.value })} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="s-taxrate">Default rate (%)</label>
              <input className="input input--mono" id="s-taxrate" type="number"
                min="0" max="100" step="0.1" value={taxDefaults.rate}
                onChange={(e) => setTax({ rate: Number(e.target.value) })} />
            </div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={taxDefaults.enabled}
              onChange={(e) => setTax({ enabled: e.target.checked })} />
            <span>Enable tax on new invoices by default</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn--primary" style={{ width: "auto" }}>
            {saved ? "✓ Settings saved" : "Save settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
