import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet } from "react-router-dom";

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
      <nav className="hub-nav" ref={menuRef}>
        <span className="hub-nav__brand">Invoice Hub</span>

        <div className="hub-nav__links">
          <NavLink to="/" end className={navClass}>Dashboard</NavLink>
          <NavLink to="/jobs" className={navClass}>Jobs</NavLink>
          <NavLink to="/clients" className={navClass}>Clients</NavLink>
          <NavLink to="/invoices" className={navClass}>Invoices</NavLink>
          <NavLink to="/settings" className={navClass}>Settings</NavLink>
        </div>

        <div className="hub-nav__right">
          <NavLink to="/invoices/new" className="hub-nav__cta">
            + New Invoice
          </NavLink>
          <button
            className={`hub-nav__hamburger${menuOpen ? " hub-nav__hamburger--open" : ""}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>

        {menuOpen && (
          <div className="hub-nav__dropdown">
            <NavLink to="/" end className={dropClass} onClick={close}>Dashboard</NavLink>
            <NavLink to="/jobs" className={dropClass} onClick={close}>Jobs</NavLink>
            <NavLink to="/clients" className={dropClass} onClick={close}>Clients</NavLink>
            <NavLink to="/invoices" className={dropClass} onClick={close}>Invoices</NavLink>
            <NavLink to="/settings" className={dropClass} onClick={close}>Settings</NavLink>
          </div>
        )}
      </nav>

      <main className="hub-content">
        <Outlet />
      </main>
    </div>
  );
}

function navClass({ isActive }) {
  return `hub-nav__link${isActive ? " hub-nav__link--active" : ""}`;
}

function dropClass({ isActive }) {
  return `hub-nav__drop-link${isActive ? " hub-nav__drop-link--active" : ""}`;
}
