// src/pages/sme/VendorsList.tsx
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type Vendor = {
  id: string;
  name: string;
  gstin?: string;
  contact?: string;
  city?: string;
  status?: "Active" | "Inactive";
  createdAt?: string;
};

const demo: Vendor[] = [
  { id: "V-001", name: "Siddhi Suppliers", gstin: "27ABCDE1234F1Z5", contact: "9876543210", city: "Bengaluru", status: "Active", createdAt: "2025-09-10" },
  { id: "V-002", name: "Global Food Traders", gstin: "07PQRSX5678Y2Z3", contact: "9123456780", city: "Mumbai", status: "Active", createdAt: "2025-08-22" },
  { id: "V-003", name: "Karnataka Supplies", gstin: "29KARNATAKA9876", contact: "9988776655", city: "Mysuru", status: "Inactive", createdAt: "2025-06-05" },
];

export default function VendorsList() {
  const [vendors, setVendors] = useState<Vendor[]>(demo);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const t = query.trim().toLowerCase();
    if (!t) return vendors;
    return vendors.filter(
      (v) =>
        v.id.toLowerCase().includes(t) ||
        v.name.toLowerCase().includes(t) ||
        (v.gstin || "").toLowerCase().includes(t) ||
        (v.contact || "").toLowerCase().includes(t) ||
        (v.city || "").toLowerCase().includes(t)
    );
  }, [vendors, query]);

  const totals = useMemo(() => ({
    total: vendors.length,
    active: vendors.filter((v) => v.status === "Active").length,
    inactive: vendors.filter((v) => v.status === "Inactive").length,
  }), [vendors]);

  const remove = (id: string) => setVendors((s) => s.filter((v) => v.id !== id));
  const toggleStatus = (id: string) =>
    setVendors((s) => s.map((v) => (v.id === id ? { ...v, status: v.status === "Active" ? "Inactive" : "Active" } : v)));

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Vendors</h1>
          <div className="text-sm text-slate-500 mt-1">Manage vendors, view GSTINs and contact info.</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded px-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search id, name, GSTIN, city..."
              className="text-sm px-2 py-1 outline-none w-64"
            />
            <button onClick={() => setQuery("")} className="text-sm text-slate-500 px-2">Clear</button>
          </div>

          <Link to="/vendors/new" className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm">Add vendor</Link>
          <button onClick={() => window.location.reload()} className="px-3 py-2 rounded-md bg-white border border-slate-200 text-sm">Refresh</button>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-3 rounded-lg border bg-white">
          <div className="text-xs text-slate-500">Total vendors</div>
          <div className="text-xl font-semibold mt-1">{totals.total}</div>
        </div>
        <div className="p-3 rounded-lg border bg-emerald-50 text-emerald-700">
          <div className="text-xs">Active</div>
          <div className="text-xl font-semibold mt-1">{totals.active}</div>
        </div>
        <div className="p-3 rounded-lg border bg-amber-50 text-amber-800">
          <div className="text-xs">Inactive</div>
          <div className="text-xl font-semibold mt-1">{totals.inactive}</div>
        </div>
      </section>

      <div className="bg-white border rounded-2xl shadow-sm overflow-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
            <tr>
              <th className="p-3 text-left">Vendor</th>
              <th className="p-3 text-left">GSTIN</th>
              <th className="p-3 text-left">Contact</th>
              <th className="p-3 text-left">City</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Added</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">No vendors found.</td>
              </tr>
            ) : (
              filtered.map((v) => (
                <tr key={v.id} className="border-t hover:bg-slate-50">
                  <td className="p-3">
                    <div className="font-medium">{v.name}</div>
                    <div className="text-xs text-slate-400">{v.id}</div>
                  </td>

                  <td className="p-3 text-xs text-slate-500 truncate">{v.gstin || "—"}</td>
                  <td className="p-3">{v.contact || "—"}</td>
                  <td className="p-3">{v.city || "—"}</td>
                  <td className="p-3"><span className={`inline-block px-2 py-1 rounded text-xs ${v.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{v.status}</span></td>
                  <td className="p-3 text-slate-500">{v.createdAt || "—"}</td>

                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => navigate(`/vendors/${v.id}`)} className="px-2 py-1 bg-indigo-600 text-white rounded text-xs">View</button>
                      <button onClick={() => navigate(`/vendors/${v.id}/edit`)} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs">Edit</button>
                      <button onClick={() => toggleStatus(v.id)} className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">{v.status === "Active" ? "Disable" : "Enable"}</button>
                      <button onClick={() => remove(v.id)} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs">Remove</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
        <div>Showing {filtered.length} of {vendors.length} vendors</div>
        <div className="flex items-center gap-3">
          <button onClick={() => setQuery("")} className="px-3 py-2 rounded bg-white border border-slate-200">Reset</button>
          <Link to="/reports" className="px-3 py-2 rounded bg-indigo-600 text-white">Export</Link>
        </div>
      </div>
    </div>
  );
}
