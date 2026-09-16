/** Label + input pair. Keeps every field in the form identical. */
export default function Field({ label, id, hint, hintError, children }) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {children}
      {hint ? <p className={`field__hint${hintError ? " field__hint--error" : ""}`}>{hint}</p> : null}
    </div>
  );
}
