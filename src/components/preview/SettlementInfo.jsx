/** settlement.lines is stored as a newline-joined string (matches the
 *  Settings page's textarea), split back into an array here for rendering. */
export default function SettlementInfo({ settlement }) {
  const lines = (settlement.lines || "").split("\n").filter(Boolean);
  return (
    <section className="sheet__settlement">
      <h3>{settlement.heading}</h3>
      <p>
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            <br />
          </span>
        ))}
      </p>
      {settlement.note ? <p className="sheet__settlement-note">{settlement.note}</p> : null}
    </section>
  );
}
