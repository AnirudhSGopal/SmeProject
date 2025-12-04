// src/pages/ca/CAChatThread.tsx
import { useState } from "react";
import { useParams } from "react-router-dom";

type Message = { id: string; from: "SME" | "CA"; text: string; time: string; invoiceId?: string };

const demo: Message[] = [
  { id: "m1", from: "SME", text: "Forwarded 3 invoices for Nov. Please validate ITC.", time: "09:10", invoiceId: "INV-001" },
  { id: "m2", from: "CA", text: "Received. One missing HSN — ask vendor.", time: "09:35", invoiceId: "INV-003" },
];

export default function CAChatThread() {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>(demo);
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: `m${Date.now()}`, from: "CA", text: text.trim(), time: new Date().toLocaleTimeString() }]);
    setText("");
  };

  return (
    <div className="p-6 flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4">Chat — {id}</h2>
      <div className="flex-1 overflow-auto space-y-3 mb-3">
        {messages.map(m => (
          <div key={m.id} className={`p-3 rounded-md ${m.from === "CA" ? "bg-slate-50 self-end" : "bg-white self-start"}`}>
            <div className="text-xs text-slate-400">{m.from} • {m.time} {m.invoiceId ? `• ${m.invoiceId}` : ""}</div>
            <div className="text-sm mt-1">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply..." className="flex-1 border rounded px-3 py-2 text-sm" onKeyDown={(e)=>{ if(e.key === "Enter") send(); }} />
        <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={send}>Send</button>
      </div>
    </div>
  );
}
