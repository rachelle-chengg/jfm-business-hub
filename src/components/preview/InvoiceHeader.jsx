import logoUrl from "../../assets/logo.png";

export default function InvoiceHeader({ business }) {
  return (
    <header className="sheet__header">
      <div>
        <h1 className="sheet__title">INVOICE</h1>
        <address className="sheet__business">
          {business.name}
          <br />
          <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="sheet__business-link">
            {business.phone}
          </a>
          <br />
          <a href={`mailto:${business.email}`} className="sheet__business-link">
            {business.email}
          </a>
          <br />
          {business.taxId}
        </address>
      </div>
      <img className="sheet__logo" src={logoUrl} alt={`${business.shortName} logo`} />
    </header>
  );
}
