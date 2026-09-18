import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "./icons.jsx";

/**
 * Drop-in replacement for a native <select> — same value/onChange shape
 * (onChange receives the raw value, not an event) but renders its own
 * dropdown so the open menu matches the rest of the design system instead
 * of the browser/OS's native picker chrome.
 */
export default function Select({
  value,
  onChange,
  options,
  ariaLabel,
  className = "",
  style,
  disabled = false,
  placeholder = "",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="select" ref={ref}>
      <button
        type="button"
        className={`input select__trigger ${className}`}
        style={style}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
      >
        <span className="select__value">{selected ? selected.label : placeholder}</span>
        <ChevronDownIcon />
      </button>
      {open && (
        <ul className="select__dropdown" role="listbox">
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                className={`select__option${o.value === value ? " select__option--active" : ""}`}
                onClick={() => { onChange(o.value); setOpen(false); }}
                disabled={o.disabled}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
