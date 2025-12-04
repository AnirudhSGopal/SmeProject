// src/pages/sme/SearchResults.tsx
import { useLocation, useNavigate } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const q = useQuery().get("q") || "";
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Search results</h2>
        <div className="text-sm text-slate-500">Query: <span className="font-medium">{q}</span></div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="bg-white border rounded p-4">
          <div className="text-xs text-slate-500 mb-2">Invoices</div>
          <ul className="space-y-2">
            <li className="p-2 border rounded flex items-center justify-between">
              <div><div className="font-medium">INV-001</div><div className="text-xs text-slate-400">Siddhi Suppliers</div></div>
              <button className="px-2 py-1 bg-indigo-600 text-white rounded text-xs" onClick={() => navigate("/invoices/INV-001")}>Open</button>
            </li>
          </ul>
        </div>

        <div className="bg-white border rounded p-4">
          <div className="text-xs text-slate-500 mb-2">Vendors</div>
          <ul className="space-y-2">
            <li className="p-2 border rounded flex items-center justify-between">
              <div><div className="font-medium">Siddhi Suppliers</div><div className="text-xs text-slate-400">27ABCDE…</div></div>
              <button className="px-2 py-1 bg-indigo-600 text-white rounded text-xs" onClick={() => navigate("/vendors/V-1")}>Open</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
