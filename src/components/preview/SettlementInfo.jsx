import { SETTLEMENT } from "../../config/business.js";
import ContactText from "./ContactText.jsx";

/** Keep custom template instructions intact; structure the original copy. */
export default function SettlementInfo({ settlement }) {
  const lines = (settlement.lines || "").split("\n").filter(Boolean);
  const original = lines.join("\n") === SETTLEMENT.lines.join("\n") && settlement.heading === SETTLEMENT.heading;
  if (!original) {
    return (
      <section className="sheet__settlement">
        <h3>{settlement.heading}</h3>
        <p>{lines.map((line, i) => <span key={i}><ContactText>{line}</ContactText><br /></span>)}</p>
      </section>
    );
  }
  return (
    <section className="sheet__settlement sheet__settlement--structured">
      <h3>Invoice settlement</h3>
      <ul className="sheet__payment-methods">
        <li>
          <h4>E-transfer</h4>
          <div className="sheet__payment-email"><ContactText>info@jonathanfolk.ca</ContactText></div>
        </li>
        <li>
          <h4>Cheque</h4>
          <div>Payable to <strong>Jonathan Folk Media</strong></div>
        </li>
        <li>
          <h4>Credit card</h4>
          <p>Contact us to request a payment link.</p>
        </li>
      </ul>
      <p className="sheet__payment-reference">Include your invoice number with payment.</p>
    </section>
  );
}

export function SettlementTerms({ note }) {
  if (!note) return null;
  return <aside className="sheet__payment-terms">
    <h4>Late-payment terms</h4>
    <p><ContactText>{note}</ContactText></p>
  </aside>;
}
