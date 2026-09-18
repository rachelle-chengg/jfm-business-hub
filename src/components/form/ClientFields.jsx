import { useEffect, useState } from "react";
import Field from "./Field.jsx";
import { listClients } from "../../lib/db.js";
import AddressAutocomplete from "../AddressAutocomplete.jsx";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ClientFields({ client, onChange }) {
  const [emailTouched, setEmailTouched] = useState(false);
  const [savedClients, setSavedClients] = useState([]);

  useEffect(() => { setSavedClients(listClients()); }, []);

  const bind = (key, extra = {}) => ({
    id: `client-${key}`,
    value: client[key],
    onChange: (e) => onChange({ [key]: e.target.value }),
    ...extra,
  });

  const emailInvalid = emailTouched && client.email && !EMAIL_RE.test(client.email);

  function handlePickClient(e) {
    const id = e.target.value;
    e.target.value = ""; // reset the picker itself; it's an action, not a bound field
    if (!id) return;
    const c = savedClients.find((sc) => sc.id === id);
    if (!c) return;
    onChange({
      name: c.name || "",
      address1: c.address1 || "",
      address2: c.address2 || "",
      phone: c.phone || "",
      email: c.email || "",
    });
  }

  return (
    <section className="form__section">
      <h2 className="form__heading">Client</h2>
      <Field
        label="Autofill from an existing client"
        id="client-picker"
        hint={
          savedClients.length > 0
            ? "Optional — pick a saved client to fill in the fields below, or type them from scratch."
            : "No saved clients yet — add one from the Clients page, or just fill in the fields below."
        }
      >
        <select
          className="input"
          id="client-picker"
          defaultValue=""
          onChange={handlePickClient}
          disabled={savedClients.length === 0}
        >
          <option value="">Start from scratch…</option>
          {savedClients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Company or client name" id="client-name">
        <input className="input" type="text" autoComplete="organization" {...bind("name")} />
      </Field>
      <Field label="Address line 1" id="client-address1">
        <AddressAutocomplete
          id="client-address1"
          className="input"
          value={client.address1}
          onChange={(v) => onChange({ address1: v })}
          placeholder="460-1200 W 73rd Ave"
        />
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
