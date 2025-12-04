// src/pages/ca/Payments.tsx

const demo = [
  { id: "T-001", date: "2025-11-25", client: "Bright Foods", amount: 15000, status: "Paid" },
  { id: "T-002", date: "2025-11-28", client: "Anirudh Textiles", amount: 5000, status: "Pending" },
];

export default function CAPayments() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Payments</h2>
      <div className="bg-white border rounded p-4">
        <table className="w-full text-sm">
          <thead className="text-xs text-slate-500">
            <tr><th className="py-2 text-left">Txn</th><th className="py-2 text-left">Date</th><th className="py-2 text-left">Client</th><th className="py-2 text-left">Amount</th><th className="py-2 text-left">Status</th></tr>
          </thead>
          <tbody>
            {demo.map(d => (
              <tr key={d.id} className="border-t hover:bg-slate-50">
                <td className="py-2">{d.id}</td>
                <td className="py-2">{d.date}</td>
                <td className="py-2">{d.client}</td>
                <td className="py-2">₹{d.amount.toLocaleString()}</td>
                <td className="py-2">{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
