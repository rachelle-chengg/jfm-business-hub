import { BUSINESS } from "../../config/business.js";

/** Decorative corners and the branded footer band. Pure presentation. */
export default function InvoiceFrame() {
  return (
    <>
      <svg className="sheet__corner" viewBox="0 0 8.5 11" preserveAspectRatio="none" aria-hidden="true">
        <polygon points="0,0 1.64,0 0,1.64" />
        <polygon points="0.92,11 1.695,10.225 8.5,10.225 8.5,11" />
      </svg>
      <footer className="sheet__footer">
        <span className="sheet__footer-name">{BUSINESS.shortName}</span>
        <a href={`tel:${BUSINESS.phone.replace(/\D/g, "")}`} className="sheet__footer-item sheet__footer-link">
          <PhoneIcon />
          {BUSINESS.phone}
        </a>
        <a href={`mailto:${BUSINESS.email}`} className="sheet__footer-item sheet__footer-link">
          <MailIcon />
          {BUSINESS.email}
        </a>
        {BUSINESS.website && (
          <a
            href={`https://${BUSINESS.website}`}
            className="sheet__footer-item sheet__footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GlobeIcon />
            {BUSINESS.website}
          </a>
        )}
      </footer>
    </>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.5 3.5h3l1.6 4-2 1.2a11 11 0 0 0 6.2 6.2l1.2-2 4 1.6v3a2 2 0 0 1-2.1 2A16.5 16.5 0 0 1 4.5 5.6a2 2 0 0 1 2-2.1z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5.5" width="18" height="13" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 6.5l8.5 6.5 8.5-6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
