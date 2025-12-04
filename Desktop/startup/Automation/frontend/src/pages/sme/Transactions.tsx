// src/pages/sme/Transactions.tsx

type Tx = { id: string; date: string; type: string; amount: number };

const demo: Tx[] = [
  { id: "T-1", date: "2025-11-30", type: "Payment", amount: 5000 },
  { id: "T-2", date: "2025-10-25", type: "Refund", amount: 1200 },
];

export default function Transactions() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">Transactions</h2>
      <div className="bg-white border rounded p-4">
        <ul className="divide-y">
          {demo.map(t => (
            <li key={t.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{t.type}</div>
                <div className="text-xs text-slate-500">{t.date}</div>
              </div>
              <div className="font-medium">₹{t.amount.toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
