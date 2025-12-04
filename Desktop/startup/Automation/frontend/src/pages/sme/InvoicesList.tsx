// src/pages/sme/InvoicesList.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Invoice = {
  id: string;
  supplier: string;
  amount: number;
  status: "Pending" | "Processing" | "Extracted" | "Error" | "Approved" | "Rejected";
  date: string;
  gstin?: string;
  invoiceNumber?: string;
};

const demo: Invoice[] = [
  { id: "INV-001", supplier: "Siddhi Suppliers", amount: 50240, status: "Pending", date: "2025-11-29", gstin: "27ABCDE1234F1Z5", invoiceNumber: "S-1001" },
  { id: "INV-002", supplier: "Global Food Traders", amount: 75000, status: "Extracted", date: "2025-11-28", gstin: "07PQRSX5678Y2Z3", invoiceNumber: "GFT-234" },
  { id: "INV-003", supplier: "Karnataka Supplies", amount: 30000, status: "Error", date: "2025-11-27", gstin: "29KARNATAKA9876", invoiceNumber: "K-330" },
];

function fmt(n: number) {
  return "₹" + n.toLocaleString();
}

function statusClass(s: Invoice["status"]) {
  switch (s) {
    case "Pending": return "bg-yellow-100 text-yellow-800";
    case "Processing": return "bg-sky-100 text-sky-800";
    case "Extracted": return "bg-green-100 text-green-800";
    case "Error": return "bg-rose-100 text-rose-700";
    case "Approved": return "bg-indigo-100 text-indigo-800";
    default: return "bg-slate-100 text-slate-700";
  }
}

export default function InvoicesList() {
  const [invoices, setInvoices] = useState<Invoice[]>(demo);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const approve = (id: string) =>
    setInvoices((s) => s.map((i) => (i.id === id ? { ...i, status: "Approved" } : i)));

  const fix = (id: string) =>
    setInvoices((s) => s.map((i) => (i.id === id ? { ...i, status: "Extracted" } : i)));

  const remove = (id: string) =>
    setInvoices((s) => s.filter((i) => i.id !== id));

  const filtered = useMemo(() => {
    const t = query.trim().toLowerCase();
    if (!t) return invoices;

    return invoices.filter(
      (inv) =>
        inv.id.toLowerCase().includes(t) ||
        inv.supplier.toLowerCase().includes(t) ||
        (inv.gstin || "").toLowerCase().includes(t) ||
        (inv.invoiceNumber || "").toLowerCase().includes(t)
    );
  }, [invoices, query]);

  const totals = useMemo(() => ({
    total: invoices.length,
    pending: invoices.filter((i) => i.status === "Pending" || i.status === "Processing").length,
    errors: invoices.filter((i) => i.status === "Error").length,
    approved: invoices.filter((i) => i.status === "Approved").length,
  }), [invoices]);

  return (
    <main className="p-6">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Invoices</h1>
          <p className="text-sm text-slate-500 mt-1">Review, approve or fix extracted invoices.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded px-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search id, supplier, GSTIN..."
              className="text-sm px-2 py-1 outline-none w-64"
            />
            <button onClick={() => setQuery("")} className="text-sm text-slate-500 px-2">Clear</button>
          </div>

          <button onClick={() => navigate("/upload-queue")} className="px-3 py-2 rounded-md bg-sky-100 text-sky-700 text-sm">Upload</button>
          <button onClick={() => window.location.reload()} className="px-3 py-2 rounded-md bg-white border border-slate-200 text-sm">Refresh</button>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <MiniStat label="Total invoices" value={String(totals.total)} />
        <MiniStat label="Pending" value={String(totals.pending)} />
        <MiniStat label="Errors" value={String(totals.errors)} tone="amber" />
        <MiniStat label="Approved" value={String(totals.approved)} tone="green" />
      </section>

      <div className="bg-white border rounded-2xl shadow-sm overflow-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
            <tr>
              <th className="p-3 text-left">Invoice</th>
              <th className="p-3 text-left">Supplier</th>
              <th className="p-3 text-left">GSTIN</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">No invoices found.</td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <tr key={inv.id} className="border-t hover:bg-slate-50">
                  <td className="p-3">
                    <div className="font-medium">{inv.id}</div>
                    <div className="text-xs text-slate-400">{inv.invoiceNumber || "—"}</div>
                  </td>

                  <td className="p-3">
                    <div className="font-medium">{inv.supplier}</div>
                  </td>

                  <td className="p-3 text-xs text-slate-500 truncate">{inv.gstin || "GSTIN missing"}</td>

                  <td className="p-3">{fmt(inv.amount)}</td>

                  <td className="p-3">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded text-xs ${statusClass(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>

                  <td className="p-3 text-slate-500">{inv.date}</td>

                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button className="px-2 py-1 bg-indigo-600 text-white rounded text-xs" onClick={() => navigate(`/invoices/${inv.id}`)}>View</button>

                      {inv.status === "Error" ? (
                        <button className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs" onClick={() => fix(inv.id)}>Fix</button>
                      ) : (
                        <button className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs" onClick={() => approve(inv.id)}>Approve</button>
                      )}

                      <button className="px-2 py-1 bg-white border border-slate-200 rounded text-xs" onClick={() => remove(inv.id)}>Remove</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
        <span>Showing {filtered.length} of {invoices.length} invoices</span>

        <div className="flex items-center gap-3">
          <button onClick={() => setQuery("")} className="px-3 py-2 rounded bg-white border border-slate-200">Reset</button>
          <button onClick={() => navigate("/reports")} className="px-3 py-2 rounded bg-indigo-600 text-white">Export</button>
        </div>
      </div>
    </main>
  );
}

/* helpers */
const MiniStat: React.FC<{ label: string; value: string; tone?: "green" | "amber" | "neutral" }> = ({ label, value, tone = "neutral" }) => {
  const bg =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "amber"
      ? "bg-amber-50 text-amber-800"
      : "bg-white text-slate-700";

  return (
    <div className={`p-3 rounded-lg border ${bg}`}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  );
};
