import { useState } from "react";
import { loadSettings, saveSettings } from "../lib/settings.js";
import { revokeToken } from "../lib/googleAuth.js";

export default function SettingsPage() {
  const [settings, setSettings] = useState(() => loadSettings());
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [googleDisconnected, setGoogleDisconnected] = useState(false);

  function handleDisconnectGoogle() {
    if (!window.confirm("Disconnect your Google account? You'll be asked to sign in again next time you save an invoice to Drive.")) return;
    revokeToken();
    setGoogleDisconnected(true);
    setTimeout(() => setGoogleDisconnected(false), 3000);
  }

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
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleCancel() {
    setSettings(loadSettings());
    setEditing(false);
  }

  const { business, settlement, taxDefaults } = settings;

  return (
    <div className="hub-page">
      <div className="hub-page__head">
        <h1 className="hub-page__title">Settings</h1>
        <div className="hub-page__head-actions">
          {saved && !editing && <span className="settings-saved-badge">✓ Saved</span>}
          {!editing ? (
            <button type="button" className="btn btn--ghost" onClick={() => setEditing(true)}>
              <PencilIcon /> Edit
            </button>
          ) : (
            <>
              <button type="button" className="btn btn--ghost" onClick={handleCancel}>Cancel</button>
              <button type="submit" form="settings-form" className="btn btn--primary">Save settings</button>
            </>
          )}
        </div>
      </div>

      <form id="settings-form" onSubmit={handleSave}>
        {/* Business info */}
        <div className="settings-card">
          <h2 className="settings-card__title">Business information</h2>
          <p className="settings-card__hint">Appears on every invoice header and footer.</p>
          <div className="field-row">
            <ReadOnlyOrInput editing={editing} label="Business name" id="s-name" value={business.name}
              onChange={(e) => setBusiness({ name: e.target.value })} />
            <ReadOnlyOrInput editing={editing} label="Short name" id="s-short" value={business.shortName}
              onChange={(e) => setBusiness({ shortName: e.target.value })} />
          </div>
          <div className="field-row">
            <ReadOnlyOrInput editing={editing} label="Phone" id="s-phone" type="tel" value={business.phone}
              onChange={(e) => setBusiness({ phone: e.target.value })} />
            <ReadOnlyOrInput editing={editing} label="Email" id="s-email" type="email" value={business.email}
              onChange={(e) => setBusiness({ email: e.target.value })} />
          </div>
          <div className="field-row">
            <ReadOnlyOrInput editing={editing} label="Website" id="s-website" value={business.website || ""}
              onChange={(e) => setBusiness({ website: e.target.value })} />
            <ReadOnlyOrInput editing={editing} label="Tax ID" id="s-taxid" value={business.taxId || ""}
              onChange={(e) => setBusiness({ taxId: e.target.value })} />
          </div>
        </div>

        {/* Settlement */}
        <div className="settings-card">
          <h2 className="settings-card__title">Payment instructions</h2>
          <p className="settings-card__hint">Shown in the "Settlement of Invoice" section. One instruction per line.</p>
          <ReadOnlyOrInput editing={editing} label="Section heading" id="s-heading" value={settlement.heading}
            onChange={(e) => setSettlement({ heading: e.target.value })} />
          {editing ? (
            <div className="field">
              <label className="field__label" htmlFor="s-lines">Instructions (one per line)</label>
              <textarea className="input settings-textarea" id="s-lines" rows={6}
                value={settlement.lines} onChange={(e) => setSettlement({ lines: e.target.value })} />
            </div>
          ) : (
            <div className="field">
              <span className="field__label">Instructions</span>
              <div className="settings-readonly settings-readonly--pre">{settlement.lines || "—"}</div>
            </div>
          )}
          <ReadOnlyOrInput editing={editing} label="Carrying charges / interest note" id="s-note"
            value={settlement.note} onChange={(e) => setSettlement({ note: e.target.value })}
            hint="Appears as a footnote below the payment instructions." />
        </div>

        {/* Tax defaults */}
        <div className="settings-card">
          <h2 className="settings-card__title">Default tax settings</h2>
          <p className="settings-card__hint">Applied to all new invoices. You can override per invoice.</p>
          <div className="field-row">
            <ReadOnlyOrInput editing={editing} label="Tax label" id="s-taxlabel" value={taxDefaults.label}
              onChange={(e) => setTax({ label: e.target.value })} />
            <ReadOnlyOrInput editing={editing} label="Default rate (%)" id="s-taxrate" type="number"
              mono value={taxDefaults.rate} onChange={(e) => setTax({ rate: Number(e.target.value) })}
              inputProps={{ min: 0, max: 100, step: 0.1 }} />
          </div>
          {editing ? (
            <label className="toggle">
              <input type="checkbox" checked={taxDefaults.enabled}
                onChange={(e) => setTax({ enabled: e.target.checked })} />
              <span>Enable tax on new invoices by default</span>
            </label>
          ) : (
            <div className="settings-readonly">
              Tax on new invoices: <strong>{taxDefaults.enabled ? "Enabled" : "Disabled"}</strong>
            </div>
          )}
        </div>
      </form>

      {/* Integrations — not part of the save/cancel form above, since it's
          an immediate action rather than an editable field. */}
      <div className="settings-card">
        <h2 className="settings-card__title">Google account</h2>
        <p className="settings-card__hint">
          Connecting happens automatically the first time you save an invoice PDF to Google Drive.
        </p>
        <div className="hub-page__head-actions">
          {googleDisconnected && <span className="settings-saved-badge">✓ Disconnected</span>}
          <button type="button" className="btn btn--ghost" onClick={handleDisconnectGoogle}>
            Disconnect Google account
          </button>
        </div>
      </div>
    </div>
  );
}

function ReadOnlyOrInput({ editing, label, id, value, onChange, type = "text", hint, mono, inputProps = {} }) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>{label}</label>
      {editing ? (
        <input className={`input${mono ? " input--mono" : ""}`} id={id} type={type}
          value={value} onChange={onChange} {...inputProps} />
      ) : (
        <div className="settings-readonly">{value || "—"}</div>
      )}
      {hint && <p className="field__hint">{hint}</p>}
    </div>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ width: 14, height: 14, marginRight: 4 }}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
