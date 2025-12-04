// src/pages/ca/ReturnsWorkbench.tsx
import { useState } from "react";

type ReturnItem = { id: string; client: string; period: string; status: "Draft"|"Ready"|"Filed"|"Failed"; notes?: string };

const demo: ReturnItem[] = [
  { id: "R-2025-11", client: "Anirudh Textiles", period: "Nov 2025", status: "Draft" },
  { id: "R-2025-10", client: "Bright Foods", period: "Oct 2025", status: "Filed" },
];

export default function ReturnsWorkbench() {
  const [items, setItems] = useState<ReturnItem[]>(demo);

  const markReady = (id: string) => setItems(prev => prev.map(p => p.id === id ? { ...p, status: "Ready" } : p));
  const fileReturn = (id: string) => setItems(prev => prev.map(p => p.id === id ? { ...p, status: "Filed" } : p));

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Returns Workbench</h2>

      <ul className="space-y-3">
        {items.map(it => (
          <li key={it.id} className="p-3 border rounded flex items-center justify-between">
            <div>
              <div className="font-medium">{it.client} • {it.period}</div>
              <div className="text-xs text-slate-400">{it.id} • {it.notes || ""}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-xs text-slate-500">{it.status}</div>
              <div className="flex gap-2">
                <button className="text-xs px-2 py-1 bg-white border rounded" onClick={() => markReady(it.id)}>Mark Ready</button>
                <button className="text-xs px-2 py-1 bg-emerald-600 text-white rounded" onClick={() => fileReturn(it.id)}>File</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
