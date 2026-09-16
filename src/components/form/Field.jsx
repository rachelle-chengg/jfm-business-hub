/** Label + input pair. Keeps every field in the form identical. */
export default function Field({ label, id, hint, children }) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {children}
      {hint ? <p className="field__hint">{hint}</p> : null}
    </div>
  );
}
