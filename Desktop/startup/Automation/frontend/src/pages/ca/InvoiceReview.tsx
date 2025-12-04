// src/pages/ca/InvoiceReview.tsx
import { useState } from "react";

type Invoice = { id: string; client: string; amount: number; date: string; lineItems?: { desc: string; rate: number; qty: number; }[]; notes?: string };

const demo: Invoice[] = [
  { id: "INV-001", client: "Anirudh Textiles", amount: 50240, date: "2025-11-29", lineItems: [{ desc: "Fabric Roll", rate: 4200, qty: 10 }] },
];

export default function CAInvoiceReview() {
  const [invoices] = useState<Invoice[]>(demo);
  const [selected, setSelected] = useState<Invoice | null>(null);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Invoice Review</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white p-3 border rounded">
          <div className="text-xs text-slate-500 mb-2">Queue</div>
          <ul className="space-y-2">
            {invoices.map(i => (
              <li key={i.id} className="p-2 border rounded cursor-pointer" onClick={() => setSelected(i)}>
                <div className="font-medium">{i.id}</div>
                <div className="text-xs text-slate-400">{i.client} • ₹{i.amount.toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2 bg-white p-4 border rounded">
          {!selected ? <div className="text-sm text-slate-500">Select an invoice to review</div> : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{selected.id}</div>
                  <div className="text-xs text-slate-400">{selected.client} • {selected.date}</div>
                </div>
                <div>₹{selected.amount.toLocaleString()}</div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium">Line items</div>
                <ul className="mt-2 space-y-2">
                  {selected.lineItems?.map((li, idx) => (
                    <li key={idx} className="p-2 border rounded">
                      <div className="font-medium">{li.desc}</div>
                      <div className="text-xs text-slate-400">Qty: {li.qty} • Rate: ₹{li.rate}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="py-2 px-3 bg-emerald-600 text-white rounded">Approve</button>
                <button className="py-2 px-3 bg-amber-100 text-amber-800 rounded">Request changes</button>
                <button className="py-2 px-3 bg-white border rounded" onClick={() => setSelected(null)}>Close</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
