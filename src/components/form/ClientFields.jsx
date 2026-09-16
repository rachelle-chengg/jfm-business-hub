import Field from "./Field.jsx";

export default function ClientFields({ client, onChange }) {
  const bind = (key, extra = {}) => ({
    id: `client-${key}`,
    value: client[key],
    onChange: (e) => onChange({ [key]: e.target.value }),
    ...extra,
  });

  return (
    <section className="form__section">
      <h2 className="form__heading">Client</h2>
      <Field label="Company or client name" id="client-name">
        <input className="input" type="text" autoComplete="organization" {...bind("name")} />
      </Field>
      <Field label="Address line 1" id="client-address1">
        <input className="input" type="text" placeholder="460-1200 W 73rd Ave" {...bind("address1")} />
      </Field>
      <Field label="Address line 2" id="client-address2" hint="City, province, postal code">
        <input className="input" type="text" placeholder="Vancouver, BC, V6P 6G5" {...bind("address2")} />
      </Field>
      <div className="field-row">
        <Field label="Phone" id="client-phone">
          <input className="input" type="tel" {...bind("phone")} />
        </Field>
        <Field label="Email" id="client-email">
          <input className="input" type="email" {...bind("email")} />
        </Field>
      </div>
    </section>
  );
}
