// src/pages/ca/ClientList.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

type Client = { id: string; name: string; gstin?: string; lastActivity: string; pendingReviews: number; balance?: number };

const demo: Client[] = [
  { id: "C-1", name: "Anirudh Textiles", gstin: "27ABCDE1234F1Z5", lastActivity: "Today", pendingReviews: 2, balance: 0 },
  { id: "C-2", name: "Bright Foods", gstin: "07PQRSX5678Y2Z3", lastActivity: "2 days", pendingReviews: 1, balance: 1500 },
  { id: "C-3", name: "Sunrise Bakers", gstin: "09BAKER0001X2Y", lastActivity: "Yesterday", pendingReviews: 0, balance: 0 },
];

export default function CAClientList() {
  const [clients, setClients] = useState<Client[]>(demo);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const filtered = useMemo(() => clients.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || (c.gstin || "").includes(q)), [clients, q]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Clients</h2>
        <button className="py-2 px-3 bg-indigo-600 text-white rounded" onClick={() => navigate("/ca/clients/new")}>Add client</button>
      </div>

      <div className="mb-4">
        <input placeholder="Search clients or GSTIN..." value={q} onChange={(e)=>setQ(e.target.value)} className="w-full md:w-96 border rounded px-3 py-2" />
      </div>

      <ul className="space-y-3">
        {filtered.map(c => (
          <li key={c.id} className="p-3 border rounded flex items-center justify-between">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-slate-500">{c.gstin || "GSTIN missing"} • Last activity: {c.lastActivity}</div>
            </div>
            <div className="text-right">
              <div className="text-sm">{c.pendingReviews} reviews</div>
              <div className="text-xs text-slate-400">{c.balance ? `Balance ₹${c.balance}` : "No balance"}</div>
              <div className="mt-2 flex gap-2">
                <button className="text-xs px-2 py-1 border rounded" onClick={()=>navigate(`/ca/clients/${c.id}`)}>Open</button>
                <button className="text-xs px-2 py-1 bg-rose-50 text-rose-700 rounded" onClick={()=>setClients(prev => prev.filter(p => p.id !== c.id))}>Remove</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
