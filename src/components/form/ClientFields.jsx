import { useState } from "react";
import Field from "./Field.jsx";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ClientFields({ client, onChange }) {
  const [emailTouched, setEmailTouched] = useState(false);

  const bind = (key, extra = {}) => ({
    id: `client-${key}`,
    value: client[key],
    onChange: (e) => onChange({ [key]: e.target.value }),
    ...extra,
  });

  const emailInvalid = emailTouched && client.email && !EMAIL_RE.test(client.email);

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
        <Field
          label="Email"
          id="client-email"
          hint={emailInvalid ? "Please enter a valid email address." : undefined}
          hintError={emailInvalid}
        >
          <input
            className={`input${emailInvalid ? " input--error" : ""}`}
            type="email"
            id="client-email"
            value={client.email}
            onChange={(e) => onChange({ email: e.target.value })}
            onBlur={() => setEmailTouched(true)}
          />
        </Field>
      </div>
    </section>
  );
}
