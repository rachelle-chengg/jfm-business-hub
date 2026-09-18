import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", end: true, label: "Dashboard" },
  { to: "/jobs", label: "Jobs" },
  { to: "/clients", label: "Clients" },
  { to: "/invoices", label: "Invoices" },
  { to: "/settings", label: "Settings" },
];

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  function close() { setMenuOpen(false); }

  return (
    <div className="hub">
      {/* Desktop: persistent side navigation */}
      <aside className="hub-sidebar">
        <div className="hub-sidebar__brand">JFM Business Hub</div>
        <nav className="hub-sidebar__links">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={sidebarClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile: top bar + hamburger dropdown */}
      <nav className="hub-nav" ref={menuRef}>
        <span className="hub-nav__brand">JFM Business Hub</span>
        <button
          className={`hub-nav__hamburger${menuOpen ? " hub-nav__hamburger--open" : ""}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>

        {menuOpen && (
          <div className="hub-nav__dropdown">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={dropClass} onClick={close}>
                {l.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <main className="hub-content">
        <Outlet />
      </main>
    </div>
  );
}

function sidebarClass({ isActive }) {
  return `hub-sidebar__link${isActive ? " hub-sidebar__link--active" : ""}`;
}

function dropClass({ isActive }) {
  return `hub-nav__drop-link${isActive ? " hub-nav__drop-link--active" : ""}`;
}
