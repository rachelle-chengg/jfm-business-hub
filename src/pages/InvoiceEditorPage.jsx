import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import InvoiceGenerator from "../components/InvoiceGenerator.jsx";
import { getInvoice } from "../lib/db.js";

export default function InvoiceEditorPage() {
  const { id } = useParams(); // undefined = new invoice
  const navigate = useNavigate();
  const [initialInvoice, setInitialInvoice] = useState(undefined); // undefined = loading
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setInitialInvoice(null); // null = create new
      return;
    }
    const inv = getInvoice(id);
    if (!inv) {
      setNotFound(true);
    } else {
      setInitialInvoice(inv);
    }
  }, [id]);

  if (notFound) {
    return (
      <div className="hub-page">
        <p>Invoice not found. <Link to="/invoices" className="link">Back to invoices</Link></p>
      </div>
    );
  }

  if (initialInvoice === undefined) return null; // loading

  return (
    <InvoiceGenerator
      key={id ?? "new"} // remount when navigating between invoices
      initialInvoice={initialInvoice}
      invoiceId={id}
      onSaved={(savedId) => navigate(`/invoices/${savedId}`, { replace: true })}
    />
  );
}
