// src/pages/sme/InvoiceDetail.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type Invoice = { id: string; supplier?: string; amount?: number; date?: string; invoiceNumber?: string; notes?: string };

const mockFetch = (id?: string): Promise<Invoice> =>
  new Promise((res) => setTimeout(() => res({ id: id || "INV-000", supplier: "Demo Supplier", amount: 12345, date: "2025-11-30", invoiceNumber: "S-123" }), 300));

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    mockFetch(id).then(setInvoice);
  }, [id]);

  if (!invoice) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Invoice {invoice.id}</h2>
        <div className="text-sm text-slate-500">{invoice.date}</div>
      </div>

      <div className="mt-4 bg-white border rounded p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><div className="text-xs text-slate-500">Supplier</div><div className="font-medium">{invoice.supplier}</div></div>
          <div><div className="text-xs text-slate-500">Invoice #</div><div className="font-medium">{invoice.invoiceNumber}</div></div>
          <div><div className="text-xs text-slate-500">Amount</div><div className="font-medium">₹{invoice.amount?.toLocaleString()}</div></div>
        </div>

        <div className="mt-4">
          <label className="block text-xs text-slate-500">Notes</label>
          <textarea className="w-full border rounded p-2 mt-1 text-sm" value={invoice.notes || ""} onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })} />
        </div>

        <div className="mt-4 flex gap-2">
          <button className="px-3 py-2 bg-indigo-600 text-white rounded" onClick={() => { setSaving(true); setTimeout(() => { setSaving(false); navigate("/invoices"); }, 600); }}>{saving ? "Saving..." : "Save"}</button>
          <button className="px-3 py-2 bg-white border rounded" onClick={() => navigate(-1)}>Close</button>
        </div>
      </div>
    </div>
  );
}
