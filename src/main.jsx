import React from "react";
import ReactDOM from "react-dom/client";
import InvoiceGenerator from "./components/InvoiceGenerator.jsx";
import "./styles/app.css";
import "./styles/invoice.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <InvoiceGenerator />
  </React.StrictMode>
);
