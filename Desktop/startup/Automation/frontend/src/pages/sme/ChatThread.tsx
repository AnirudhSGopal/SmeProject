// src/pages/sme/ChatThread.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type Message = { id: string; from: "SME" | "CA"; text: string; time: string };

const demoMessages: Record<string, Message[]> = {
  "t-INV-001": [
    { id: "m1", from: "SME", text: "Forwarded 3 invoices for Nov.", time: "09:10 AM" },
    { id: "m2", from: "CA", text: "Received. One missing HSN.", time: "09:35 AM" },
  ],
};

export default function ChatThread() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(demoMessages[id || ""] || []);
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    const m: Message = { id: `m${Date.now()}`, from: "SME", text: text.trim(), time: new Date().toLocaleTimeString() };
    setMessages((s) => [...s, m]);
    setText("");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Chat {id}</h2>
        <button className="px-2 py-1 bg-white border rounded text-sm" onClick={() => navigate(-1)}>Back</button>
      </div>

      <div className="bg-white border rounded p-4 flex flex-col h-[60vh]">
        <div className="flex-1 overflow-auto space-y-3 mb-3">
          {messages.length === 0 ? <div className="text-sm text-slate-500">No messages</div> : messages.map(m => (
            <div key={m.id} className={`p-2 rounded ${m.from === "SME" ? "bg-indigo-50 self-end" : "bg-slate-50 self-start"}`}>
              <div className="text-xs text-slate-500">{m.from} • {m.time}</div>
              <div className="text-sm">{m.text}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message..." className="flex-1 border rounded px-2 py-1 text-sm" onKeyDown={(e) => { if (e.key === "Enter") send(); }} />
          <button className="px-3 py-1 bg-indigo-600 text-white rounded text-sm" onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}
