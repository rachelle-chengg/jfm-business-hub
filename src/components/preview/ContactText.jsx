/** Link contact details without altering the surrounding invoice text. */
export default function ContactText({ children = "" }) {
  return String(children).split(/([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4})/gi).map((part, index) => {
    const email = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(part);
    const phone = /^\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}$/.test(part);
    return email || phone ? (
      <a key={index} className="sheet__contact-link" href={email ? `mailto:${part}` : `tel:${part.replace(/\D/g, "")}`}>
        {part}
      </a>
    ) : part;
  });
}
