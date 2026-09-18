import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout.jsx";
import HubPage from "./pages/HubPage.jsx";
import JobsPage from "./pages/JobsPage.jsx";
import InvoicesPage from "./pages/InvoicesPage.jsx";
import ClientsPage from "./pages/ClientsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import InvoiceEditorPage from "./pages/InvoiceEditorPage.jsx";
import "./styles/app.css";
import "./styles/invoice.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Hub shell — nav + dashboard + list pages */}
        <Route element={<AppLayout />}>
          <Route index element={<HubPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Invoice editor — full-screen 2-column layout, no hub nav */}
        <Route path="invoices/new" element={<InvoiceEditorPage />} />
        <Route path="invoices/:id" element={<InvoiceEditorPage />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
