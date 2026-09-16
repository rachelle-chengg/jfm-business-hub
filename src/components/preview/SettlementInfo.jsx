import { SETTLEMENT } from "../../config/business.js";

export default function SettlementInfo() {
  return (
    <section className="sheet__settlement">
      <h3>{SETTLEMENT.heading}</h3>
      <p>
        {SETTLEMENT.lines.map((line, i) => (
          <span key={i}>
            {line}
            <br />
          </span>
        ))}
      </p>
      {SETTLEMENT.note ? <p className="sheet__settlement-note">{SETTLEMENT.note}</p> : null}
    </section>
  );
}
