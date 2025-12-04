// src/pages/ca/CAChatList.tsx
import { useNavigate } from "react-router-dom";

type ChatPreview = { id: string; client: string; lastMsg: string; time: string; unread?: number; invoiceId?: string };

const demo: ChatPreview[] = [
  { id: "c1", client: "Anirudh Textiles", lastMsg: "Sent updated ledger", time: "09:40", unread: 2, invoiceId: "INV-001" },
  { id: "c2", client: "Bright Foods", lastMsg: "Query on ITC", time: "08:12", unread: 0, invoiceId: "INV-002" },
  { id: "c3", client: "LMN Pvt", lastMsg: "Resolved missing HSN", time: "Yesterday", unread: 0 },
];

export default function CAChatList() {
  const navigate = useNavigate();
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Chats with clients</h2>
      <ul className="space-y-3">
        {demo.map(c => (
          <li key={c.id} className="p-3 border rounded flex items-center justify-between hover:shadow-sm cursor-pointer" onClick={() => navigate(`/ca/chat/${c.id}`)}>
            <div>
              <div className="font-medium">{c.client} {c.invoiceId && <span className="text-xs text-slate-400 ml-2">• {c.invoiceId}</span>}</div>
              <div className="text-sm text-slate-500">{c.lastMsg}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">{c.time}</div>
              {c.unread ? <div className="mt-1 bg-rose-600 text-white text-xs px-2 py-0.5 rounded">{c.unread}</div> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
