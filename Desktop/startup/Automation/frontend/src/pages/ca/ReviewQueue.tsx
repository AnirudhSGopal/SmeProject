// src/pages/ca/ReviewQueue.tsx
import { useState } from "react";

type QueueItem = { id: string; client: string; type: "Invoice"|"Return"|"Expense"; amount?: number; due?: string; priority?: "High"|"Normal" };

const demo: QueueItem[] = [
  { id: "Q-1", client: "LMN Pvt", type: "Invoice", amount: 30000, priority: "High", due: "Today" },
  { id: "Q-2", client: "Anirudh Textiles", type: "Expense", amount: 5200, priority: "Normal", due: "2 days" },
];

export default function CAReviewQueue() {
  const [items] = useState<QueueItem[]>(demo);

  const pick = (id: string) => alert(`Open review ${id} — placeholder`);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Review Queue</h2>

      <div className="bg-white border rounded p-3">
        <ul className="space-y-2">
          {items.map(i => (
            <li key={i.id} className="p-3 border rounded flex items-center justify-between">
              <div>
                <div className="font-medium">{i.client} • {i.type}</div>
                <div className="text-xs text-slate-400">{i.due} • {i.priority}</div>
              </div>
              <div className="flex gap-2 items-center">
                {i.amount && <div className="text-sm font-medium">₹{i.amount.toLocaleString()}</div>}
                <button className="text-xs px-2 py-1 bg-indigo-600 text-white rounded" onClick={() => pick(i.id)}>Open</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
