import { NavLink, Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="hub">
      <nav className="hub-nav">
        <span className="hub-nav__brand">Invoice Hub</span>
        <div className="hub-nav__links">
          <NavLink to="/" end className={navClass}>
            Dashboard
          </NavLink>
          <NavLink to="/invoices" className={navClass}>
            Invoices
          </NavLink>
          <NavLink to="/clients" className={navClass}>
            Clients
          </NavLink>
          <NavLink to="/settings" className={navClass}>
            Settings
          </NavLink>
        </div>
        <NavLink to="/invoices/new" className="btn btn--primary hub-nav__cta">
          + New Invoice
        </NavLink>
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
