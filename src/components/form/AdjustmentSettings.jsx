import Field from "./Field.jsx";
import Select from "../Select.jsx";

/**
 * Optional discount and interest/late-fee adjustments.
 *
 * adjustment: {
 *   discount: { enabled, type: "percent"|"flat", value },
 *   interest: { enabled, label, value },
 * }
 */
export default function AdjustmentSettings({ adjustment, onChange }) {
  const { discount, interest } = adjustment;

  const setDiscount = (patch) => onChange({ discount: { ...discount, ...patch } });
  const setInterest = (patch) => onChange({ interest: { ...interest, ...patch } });

  return (
    <section className="form__section">
      <h2 className="form__heading">Adjustments</h2>

      {/* Discount */}
      <label className="toggle">
        <input
          type="checkbox"
          checked={discount.enabled}
          onChange={(e) => setDiscount({ enabled: e.target.checked })}
        />
        <span>Apply discount</span>
      </label>

      {discount.enabled && (
        <div className="field-row field-row--align">
          <Field label="Discount type" id="discount-type">
            <Select
              value={discount.type}
              onChange={(type) => setDiscount({ type })}
              options={[
                { value: "percent", label: "Percentage (%)" },
                { value: "flat", label: "Flat amount ($)" },
              ]}
              ariaLabel="Discount type"
            />
          </Field>
          <Field
            label={discount.type === "percent" ? "Discount (%)" : "Discount ($)"}
            id="discount-value"
          >
            <input
              className="input input--mono"
              id="discount-value"
              type="number"
              min="0"
              step={discount.type === "percent" ? "0.1" : "0.01"}
              value={discount.value}
              onChange={(e) =>
                setDiscount({ value: e.target.value === "" ? "" : Number(e.target.value) })
              }
            />
          </Field>
        </div>
      )}

      {/* Interest / late fee */}
      <label className="toggle">
        <input
          type="checkbox"
          checked={interest.enabled}
          onChange={(e) => setInterest({ enabled: e.target.checked })}
        />
        <span>Add interest / late fee</span>
      </label>

      {interest.enabled && (
        <div className="field-row field-row--align">
          <Field label="Label" id="interest-label">
            <input
              className="input"
              id="interest-label"
              type="text"
              value={interest.label}
              onChange={(e) => setInterest({ label: e.target.value })}
            />
          </Field>
          <Field label="Amount ($)" id="interest-value">
            <input
              className="input input--mono"
              id="interest-value"
              type="number"
              min="0"
              step="0.01"
              value={interest.value}
              onChange={(e) =>
                setInterest({ value: e.target.value === "" ? "" : Number(e.target.value) })
              }
            />
          </Field>
        </div>
      )}
    </section>
  );
}
