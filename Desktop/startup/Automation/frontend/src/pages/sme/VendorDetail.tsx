import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Vendor = { id: string; name: string; gstin?: string; totalSpend: number };

const demo: Vendor[] = [
  { id: "V-1", name: "Siddhi Suppliers", gstin: "27ABCDE1234F1Z5", totalSpend: 152400 },
  { id: "V-2", name: "Global Food Traders", gstin: "07PQRSX5678Y2Z3", totalSpend: 200000 },
];

export default function VendorsList() {
  const [vendors] = useState<Vendor[]>(demo);
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">Vendors</h2>
      <div className="bg-white border rounded divide-y">
        {vendors.map(v => (
          <div key={v.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{v.name}</div>
              <div className="text-xs text-slate-500">{v.gstin}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">₹{v.totalSpend.toLocaleString()}</div>
              <button className="px-2 py-1 bg-indigo-600 text-white rounded text-xs" onClick={() => navigate(`/vendors/${v.id}`)}>Open</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
