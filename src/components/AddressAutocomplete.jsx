import { useEffect, useRef, useState } from "react";

/**
 * Free address suggestions via OpenStreetMap's Nominatim search API — no API
 * key, no billing. Debounced to stay well under Nominatim's rate limits.
 */
export default function AddressAutocomplete({ id, className, value, onChange, placeholder }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => { setQuery(value || ""); }, [value]);

  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleInput(e) {
    const v = e.target.value;
    setQuery(v);
    onChange(v);
    clearTimeout(debounceRef.current);
    if (v.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=0&limit=5&q=${encodeURIComponent(v)}`
        );
        const data = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, 400);
  }

  function pick(s) {
    setQuery(s.display_name);
    onChange(s.display_name);
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div className="address-autocomplete" ref={wrapRef}>
      <input
        id={id}
        className={className}
        type="text"
        value={query}
        onChange={handleInput}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && (
        <ul className="address-autocomplete__list">
          {suggestions.map((s) => (
            <li key={s.place_id}>
              <button type="button" onClick={() => pick(s)}>{s.display_name}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
