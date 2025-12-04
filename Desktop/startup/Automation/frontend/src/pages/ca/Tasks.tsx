// src/pages/ca/Tasks.tsx
import { useState } from "react";

type Task = { id: string; title: string; client?: string; due?: string; done?: boolean };

const demo: Task[] = [
  { id: "T-1", title: "Verify INV-003 HSN", client: "LMN Pvt", due: "Today" },
  { id: "T-2", title: "Prepare ITC summary for Nov", due: "02-12-2025" },
];

export default function CATasks() {
  const [tasks, setTasks] = useState<Task[]>(demo);

  const toggle = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Tasks</h2>

      <ul className="space-y-2">
        {tasks.map(t => (
          <li key={t.id} className="p-3 border rounded flex items-center justify-between">
            <div>
              <div className={`font-medium ${t.done ? "line-through text-slate-400" : ""}`}>{t.title}</div>
              <div className="text-xs text-slate-400">{t.client ? `${t.client} • ` : ""}{t.due}</div>
            </div>
            <div className="flex gap-2">
              <button className="text-xs px-2 py-1 border rounded" onClick={() => toggle(t.id)}>{t.done ? "Undo" : "Done"}</button>
              <button className="text-xs px-2 py-1 bg-rose-50 text-rose-700 rounded" onClick={() => remove(t.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
