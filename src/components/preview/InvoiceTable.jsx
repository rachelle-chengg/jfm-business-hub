import { formatLineAmount } from "../../lib/money.js";

export default function InvoiceTable({ items }) {
  return (
    <table className="sheet__table">
      <thead>
        <tr>
          <th scope="col">Description</th>
          <th scope="col">Total</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.description || "\u00A0"}</td>
            <td>{formatLineAmount(item.amount) || "\u00A0"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
