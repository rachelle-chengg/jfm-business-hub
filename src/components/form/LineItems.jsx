import { blankLineItem } from "../../lib/invoice.js";

export default function LineItems({ items, onChange }) {
  const updateItem = (id, patch) => onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const removeItem = (id) => onChange(items.length === 1 ? [blankLineItem()] : items.filter((it) => it.id !== id));
  const addItem = () => onChange([...items, blankLineItem()]);

  return (
    <section className="form__section">
      <h2 className="form__heading">Line items</h2>
      <div className="items">
        <div className="items__head">
          <span>Description</span>
          <span>Amount</span>
        </div>
        {items.map((item, index) => (
          <div className="items__row" key={item.id}>
            <input
              className="input"
              type="text"
              aria-label={`Item ${index + 1} description`}
              placeholder="On Site Half Day Rate - August 19, 2025"
              value={item.description}
              onChange={(e) => updateItem(item.id, { description: e.target.value })}
            />
            <input
              className="input input--mono"
              type="text"
              aria-label={`Item ${index + 1} amount`}
              placeholder="1500 or Included"
              value={item.amount}
              onChange={(e) => updateItem(item.id, { amount: e.target.value })}
            />
            <button
              type="button"
              className="icon-btn"
              aria-label={`Remove item ${index + 1}`}
              title="Remove"
              onClick={() => removeItem(item.id)}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn--ghost btn--block" onClick={addItem}>
        + Add item
      </button>
      <p className="field__hint">Type a number for a dollar amount, or text such as "Included".</p>
    </section>
  );
}
