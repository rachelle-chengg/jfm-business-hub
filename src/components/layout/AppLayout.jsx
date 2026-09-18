import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { HomeIcon, ListIcon, PersonIcon, DocumentIcon, GearIcon } from "../icons.jsx";

const NAV_LINKS = [
  { to: "/", end: true, label: "Dashboard", Icon: HomeIcon },
  { to: "/jobs", label: "Jobs", Icon: ListIcon },
  { to: "/clients", label: "Clients", Icon: PersonIcon },
  { to: "/invoices", label: "Invoices", Icon: DocumentIcon },
  { to: "/settings", label: "Settings", Icon: GearIcon },
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
              <l.Icon />
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
        <p className="hub-sidebar__credit">
          Designed by littlebytedesigns.com
          <br />
          © 2026 All rights reserved.
        </p>
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
                <l.Icon />
                <span>{l.label}</span>
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
