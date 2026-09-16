import { BUSINESS } from "../../config/business.js";
import logoUrl from "../../assets/logo.png";

export default function InvoiceHeader() {
  return (
    <header className="sheet__header">
      <div>
        <h1 className="sheet__title">INVOICE</h1>
        <address className="sheet__business">
          {BUSINESS.name}
          <br />
          {BUSINESS.phone}
          <br />
          {BUSINESS.email}
          <br />
          {BUSINESS.taxId}
        </address>
      </div>
      <img className="sheet__logo" src={logoUrl} alt={`${BUSINESS.shortName} logo`} />
    </header>
  );
}
