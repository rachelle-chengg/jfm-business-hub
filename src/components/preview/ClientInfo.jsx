export default function ClientInfo({ client }) {
  const lines = [client.name, client.address1, client.address2, client.phone, client.email].filter(
    (l) => l && l.trim()
  );
  return (
    <section className="sheet__client">
      <h2 className="sheet__issued">ISSUED</h2>
      <address className="sheet__client-lines">
        {lines.length ? (
          lines.map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))
        ) : (
          <span className="sheet__placeholder">Client details</span>
        )}
      </address>
    </section>
  );
}
