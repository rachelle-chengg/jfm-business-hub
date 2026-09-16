import Field from "./Field.jsx";

export default function TaxSettings({ tax, onChange }) {
  return (
    <section className="form__section">
      <h2 className="form__heading">Tax</h2>
      <div className="field-row field-row--align">
        <label className="toggle">
          <input type="checkbox" checked={tax.enabled} onChange={(e) => onChange({ enabled: e.target.checked })} />
          <span>Apply {tax.label}</span>
        </label>
        <Field label={`${tax.label} rate (%)`} id="tax-rate">
          <input
            className="input input--mono"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={tax.rate}
            disabled={!tax.enabled}
            onChange={(e) => onChange({ rate: e.target.value === "" ? "" : Number(e.target.value) })}
          />
        </Field>
      </div>
    </section>
  );
}
