// src/pages/sme/ChatList.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Thread = { id: string; title: string; lastMessage: string; ts: string; unread?: number };

const threads: Thread[] = [
  { id: "t-INV-001", title: "CA: Anirudh Textiles", lastMessage: "Please confirm HSN", ts: "10:05 AM", unread: 2 },
  { id: "t-INV-004", title: "CA: Sunrise Bakers", lastMessage: "Marked urgent", ts: "09:35 AM", unread: 0 },
  { id: "t-INV-005", title: "CA: Vivek Stores", lastMessage: "Invoice mismatch", ts: "Yesterday", unread: 1 }
];

export default function ChatList() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const t = query.trim().toLowerCase();
    if (!t) return threads;
    return threads.filter(
      (th) =>
        th.title.toLowerCase().includes(t) ||
        th.lastMessage.toLowerCase().includes(t)
    );
  }, [query]);


  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Chats</h2>
          <div className="mt-1 text-sm text-slate-500">Conversations with your CA</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded px-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats..."
              className="text-sm px-2 py-1 outline-none w-64"
            />
            <button onClick={() => setQuery("")} className="text-sm text-slate-500 px-2">
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm divide-y">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-slate-500">No chats found</div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
              onClick={() => navigate(`/chat/${t.id}`)}
            >
              <div>
                <div className="font-medium flex items-center gap-2">
                  <span>{t.title}</span>
                  {t.unread ? (
                    <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                      {t.unread} new
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-slate-500">{t.lastMessage}</div>
              </div>
              <div className="text-xs text-slate-400">{t.ts}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
