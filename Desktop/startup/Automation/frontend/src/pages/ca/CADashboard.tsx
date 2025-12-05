// src/pages/ca/CADashboard.tsx
import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

type InvoiceStatus = "Pending" | "For Review" | "Approved" | "Filed" | "Rejected";
type Invoice = {
  id: string;
  client: string;
  amount: number;
  status: InvoiceStatus;
  date: string;
  due?: string;
  errors?: string[];
  priority?: "High" | "Medium" | "Low";
  assignedTo?: string;
  invoiceNumber?: string;
  supplierName?: string;
};

type Client = { id: string; name: string; gstin?: string; openItems?: number; lastActivity?: string };
type ChatMessage = { id: string; from: "SME" | "CA"; text: string; time: string; invoiceId?: string };

const demoInvoices: Invoice[] = [
  { id: "INV-001", client: "Anirudh Textiles", amount: 50240, status: "For Review", date: "2025-11-29", due: "2025-12-04", priority: "High", errors: [], invoiceNumber: "S-1001", supplierName: "Siddhi Suppliers" },
  { id: "INV-003", client: "LMN Pvt", amount: 30000, status: "Pending", date: "2025-11-27", due: "2025-12-02", priority: "High", errors: ["Missing HSN"], invoiceNumber: "K-330" },
  { id: "INV-004", client: "Sunrise Bakers", amount: 15820, status: "Approved", date: "2025-11-26", due: "2025-12-10", priority: "Low", invoiceNumber: "BH-102" },
];

const demoClients: Client[] = [
  { id: "C-1", name: "Anirudh Textiles", gstin: "27ABCDE1234F1Z5", openItems: 3, lastActivity: "2025-11-30" },
  { id: "C-2", name: "Bright Foods", gstin: "07PQRSX5678Y2Z3", openItems: 1, lastActivity: "2025-11-28" },
];

const demoChats: ChatMessage[] = [
  { id: "m1", from: "SME", text: "Sent invoice batch", time: "09:10 AM", invoiceId: "INV-001" },
  { id: "m2", from: "CA", text: "Please provide HSN for INV-003", time: "09:35 AM", invoiceId: "INV-003" },
];

export default function CADashboard() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState<Invoice[]>(demoInvoices);
  const [clients] = useState<Client[]>(demoClients);
  const [chats] = useState<ChatMessage[]>(demoChats);

  const [selected, setSelected] = useState<Invoice | null>(null);
  const [filter, setFilter] = useState<"All" | "High" | "For Review" | "Pending">("For Review");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ invoices: Invoice[]; clients: Client[]; chats: ChatMessage[] } | null>(null);
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  const handleSearch = useCallback((term?: string) => {
    const t = (term ?? query).trim().toLowerCase();
    if (!t) { setSearchResults(null); setShowSearchPanel(false); return; }
    const invs = invoices.filter(i => i.id.toLowerCase().includes(t) || i.client.toLowerCase().includes(t) || (i.invoiceNumber || "").toLowerCase().includes(t));
    const cl = clients.filter(c => c.name.toLowerCase().includes(t) || (c.gstin || "").toLowerCase().includes(t));
    const ch = chats.filter(m => m.text.toLowerCase().includes(t) || (m.invoiceId || "").toLowerCase().includes(t));
    setSearchResults({ invoices: invs, clients: cl, chats: ch });
    setShowSearchPanel(true);
  }, [query, invoices, clients, chats]);

  useEffect(() => {
    const onAppSearch = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const term = (customEvent?.detail ?? "").toString();
      setQuery(term);
      if (!term.trim()) { setSearchResults(null); setShowSearchPanel(false); return; }
      handleSearch(term);
    };
    window.addEventListener("app:search", onAppSearch);
    return () => window.removeEventListener("app:search", onAppSearch);
  }, [invoices, clients, chats, handleSearch]);

  const totals = useMemo(() => {
    const toReview = invoices.filter(i => i.status === "For Review").length;
    const pending = invoices.filter(i => i.status === "Pending").length;
    const high = invoices.filter(i => i.priority === "High").length;
    return { toReview, pending, high, count: invoices.length };
  }, [invoices]);

  const pushNotifLocal = (text: string) => {
    console.info("notif:", text);
  };

  // actions
  const assignTo = useCallback((invoiceId: string, user: string) => {
    setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, assignedTo: user } : i));
    pushNotifLocal(`Assigned ${invoiceId} → ${user}`);
  }, []);
  const requestFix = useCallback((invoiceId: string, note?: string) => {
    setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, status: "Pending", errors: [...(i.errors || []), note || "Requested clarification"] } : i));
    pushNotifLocal(`Requested fix for ${invoiceId}`);
  }, []);
  const approveAndMarkForFiling = useCallback((invoiceId: string) => {
    setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, status: "Approved" } : i));
    pushNotifLocal(`${invoiceId} approved — ready for filing`);
  }, []);
  const markFiled = useCallback((invoiceId: string) => {
    setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, status: "Filed" } : i));
    pushNotifLocal(`${invoiceId} marked filed`);
  }, []);

  // When clicking a row or heading — route to full page:
  const goToFullQueue = () => navigate("/ca/review-queue");
  const goToFullClients = () => navigate("/ca/clients");
  const goToInvoiceFull = useCallback((invoiceId?: string) => {
    // navigate to invoice-review page; pass invoice id as query
    if (invoiceId) navigate(`/ca/invoice-review?invoice=${encodeURIComponent(invoiceId)}`);
    else navigate("/ca/invoice-review");
  }, [navigate]);

  const visibleInvoices = invoices.filter(i => {
    if (filter === "All") return true;
    if (filter === "High") return i.priority === "High";
    if (filter === "For Review") return i.status === "For Review";
    if (filter === "Pending") return i.status === "Pending";
    return true;
  });

  const [now] = useState(() => Date.now());

  const daysUntil = (iso?: string) => {
    if (!iso) return "";
    const d = Math.ceil((new Date(iso).getTime() - now) / (1000 * 60 * 60 * 24));
    if (d < 0) return `${Math.abs(d)}d overdue`;
    return `${d}d`;
  };

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selected) return;
      if (e.key.toLowerCase() === "a") assignTo(selected.id, "You");
      if (e.key.toLowerCase() === "f") approveAndMarkForFiling(selected.id);
      if (e.key.toLowerCase() === "o") { /* open full invoice page */ goToInvoiceFull(selected.id); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, approveAndMarkForFiling, assignTo, goToInvoiceFull]);

  return (
    <div className="min-h-[70vh]">
      {/* Search panel (if header triggered search) */}
      {showSearchPanel && searchResults && (
        <div className="mb-4 bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-slate-500">Search results for</div>
              <div className="text-lg font-semibold">{query}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-slate-500">{searchResults.invoices.length} invoices</div>
              <div className="text-xs text-slate-500">{searchResults.clients.length} clients</div>
              <div className="text-xs text-slate-500">{searchResults.chats.length} chats</div>
              <button className="text-xs px-2 py-1 bg-slate-50 rounded" onClick={() => { setShowSearchPanel(false); setSearchResults(null); }}>Close</button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-slate-500 mb-2">Invoices</div>
              <ul className="space-y-2 max-h-40 overflow-auto">
                {searchResults.invoices.length === 0 ? <li className="text-xs text-slate-400">No invoices</li> : searchResults.invoices.map(inv => (
                  <li key={inv.id} className="p-2 border rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium">{inv.id}</div>
                      <div className="text-xs text-slate-400">{inv.client} • ₹{inv.amount.toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button className="text-xs px-2 py-1 bg-indigo-600 text-white rounded" onClick={() => { goToInvoiceFull(inv.id); }}>Open full</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-2">Clients</div>
              <ul className="space-y-2 max-h-40 overflow-auto">
                {searchResults.clients.length === 0 ? <li className="text-xs text-slate-400">No clients</li> : searchResults.clients.map(c => (
                  <li key={c.id} className="p-2 border rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium truncate">{c.name}</div>
                      <div className="text-xs text-slate-400 truncate">{c.gstin}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button className="text-xs px-2 py-1 bg-white border rounded" onClick={() => navigate(`/ca/clients/${c.id}`)}>Open client</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-2">Chats</div>
              <ul className="space-y-2 max-h-40 overflow-auto">
                {searchResults.chats.length === 0 ? <li className="text-xs text-slate-400">No chats</li> : searchResults.chats.map(m => (
                  <li key={m.id} className="p-2 border rounded">
                    <div className="text-xs text-slate-500">{m.from} • {m.time} {m.invoiceId ? `• ${m.invoiceId}` : ''}</div>
                    <div className="text-sm">{m.text}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Stats - make cards clickable to go full page */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <button onClick={goToFullQueue} className="text-left bg-white rounded-2xl shadow p-4 border hover:shadow-md">
          <div className="text-xs text-slate-500">To review</div>
          <div className="text-2xl font-semibold mt-1">{totals.toReview}</div>
          <div className="text-xs text-slate-400 mt-1">Items awaiting CA review</div>
        </button>

        <button onClick={() => navigate("/ca/review-queue?filter=pending")} className="text-left bg-white rounded-2xl shadow p-4 border hover:shadow-md">
          <div className="text-xs text-slate-500">Pending clarifications</div>
          <div className="text-2xl font-semibold mt-1">{totals.pending}</div>
          <div className="text-xs text-slate-400 mt-1">Sent back to client</div>
        </button>

        <button onClick={() => navigate("/ca/review-queue?filter=high")} className="text-left bg-white rounded-2xl shadow p-4 border hover:shadow-md">
          <div className="text-xs text-slate-500">High priority</div>
          <div className="text-2xl font-semibold mt-1">{totals.high}</div>
          <div className="text-xs text-slate-400 mt-1">Address these first</div>
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-6">
          {/* Review Queue - heading clickable */}
          <div className="bg-white rounded-2xl shadow border overflow-hidden">
            <div className="px-6 py-3 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold cursor-pointer" onClick={goToFullQueue}>Review Queue</h3>
                <div className="text-xs text-slate-400">Actionable list — click title to open full queue</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-slate-400">Filter:</div>
                <select value={filter} onChange={(e) => setFilter(e.target.value as "All" | "High" | "For Review" | "Pending")} className="border px-2 py-1 rounded text-sm">
                  <option value="For Review">For Review</option>
                  <option value="Pending">Pending</option>
                  <option value="High">High</option>
                  <option value="All">All</option>
                </select>
                <button className="px-3 py-1 bg-indigo-600 text-white rounded text-sm" onClick={goToFullQueue}>Open full queue</button>
              </div>
            </div>

            <div className="p-4 space-y-3 max-h-[520px] overflow-auto">
              {visibleInvoices.length === 0 ? (
                <div className="text-sm text-slate-500">No invoices match the filter.</div>
              ) : (
                visibleInvoices.map(inv => (
                  <div key={inv.id} className={`p-3 border rounded flex items-center justify-between gap-3 ${selected?.id === inv.id ? "ring-2 ring-indigo-200 bg-indigo-50" : "bg-white"}`}>
                    {/* Row clickable to open full invoice view */}
                    <div role="button" tabIndex={0} className="min-w-0 cursor-pointer" onClick={() => goToInvoiceFull(inv.id)} onKeyDown={(e) => { if (e.key === "Enter") goToInvoiceFull(inv.id); }}>
                      <div className="flex items-center gap-3">
                        <div className="font-medium truncate">{inv.id}</div>
                        <div className="text-xs text-slate-400 truncate">{inv.invoiceNumber || '—'}</div>
                        {inv.priority && <div className={`text-xs px-2 py-0.5 rounded ${inv.priority === "High" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"}`}>{inv.priority}</div>}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 truncate">{inv.client} • {inv.supplierName || "—"}</div>
                      <div className="text-xs text-slate-500 mt-1">Amount: {formatCurrency(inv.amount)} • Due: <span className="font-medium">{inv.due ? `${inv.due} (${daysUntil(inv.due)})` : "—"}</span></div>
                      {inv.errors && inv.errors.length > 0 && <div className="text-xs text-rose-600 mt-1">Errors: {inv.errors.join(", ")}</div>}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-slate-500">{inv.status}</div>

                      <div className="flex gap-2">
                        <button className="text-xs px-3 py-1 rounded bg-white border" onClick={() => { assignTo(inv.id, "You"); }}>Assign to me</button>
                        <button className="text-xs px-3 py-1 rounded bg-amber-100 text-amber-800" onClick={() => { requestFix(inv.id); }}>Request fix</button>
                        <button className="text-xs px-3 py-1 rounded bg-emerald-600 text-white" onClick={() => { approveAndMarkForFiling(inv.id); }}>Approve</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Today tasks */}
          <div className="bg-white rounded-2xl shadow border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold cursor-pointer" onClick={() => navigate("/ca/tasks")}>Today / Near-term Tasks</h3>
              <div className="text-xs text-slate-400">{invoices.filter(i => i.due).length} items</div>
            </div>

            <div className="space-y-2">
              {invoices.filter(i => i.due).sort((a,b) => (a.due||"").localeCompare(b.due||"")).slice(0,6).map(i => (
                <div key={i.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{i.id} • {i.client}</div>
                    <div className="text-xs text-slate-400">{i.due} • {daysUntil(i.due)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs px-2 py-1 rounded bg-indigo-600 text-white" onClick={() => goToInvoiceFull(i.id)}>Open</button>
                    <button className="text-xs px-2 py-1 rounded bg-white border" onClick={() => markFiled(i.id)}>Mark filed</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <aside className="space-y-5">
          <div className="bg-white rounded-2xl shadow border p-4 max-h-80 overflow-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold cursor-pointer" onClick={goToFullClients}>Clients</h3>
              <div className="text-xs text-slate-400">{clients.length}</div>
            </div>

            <ul className="space-y-2">
              {clients.map(c => (
                <li key={c.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/ca/clients/${c.id}`)}>
                  <div>
                    <div className="font-medium truncate">{c.name}</div>
                    <div className="text-xs text-slate-400 truncate">{c.gstin || "GSTIN missing"}</div>
                  </div>
                  <div className="text-xs text-slate-500">{c.openItems ?? 0}</div>
                </li>
              ))}
            </ul>

            <div className="mt-3">
              <button className="w-full py-2 bg-indigo-600 text-white rounded" onClick={goToFullClients}>Manage clients</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow border p-4">
            <div className="flex items-center justify-between mb-2"><h3 className="font-semibold">Quick Actions</h3></div>
            <div className="grid gap-2">
              <button className="py-2 text-sm bg-emerald-600 text-white rounded" onClick={() => pushNotifLocal("Start filing flow (placeholder)")}>Start filing</button>
              <button className="py-2 text-sm bg-white border rounded" onClick={() => navigate("/ca/reports")}>Open reports</button>
              <button className="py-2 text-sm bg-white border rounded" onClick={() => navigate("/ca/tasks")}>View tasks</button>
            </div>
          </div>
        </aside>
      </div>

      {/* Selected invoice drawer (kept for quick edits) */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setSelected(null)} />
          <aside className="w-96 bg-white border-l p-6 overflow-auto shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{selected.id}</h3>
                <div className="text-xs text-slate-500">{selected.client} • {selected.date}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-white border rounded" onClick={() => setSelected(null)}>Close</button>
                <button className="px-3 py-1 bg-emerald-600 text-white rounded" onClick={() => { approveAndMarkForFiling(selected.id); setSelected(null); }}>Approve</button>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm">Amount: <span className="font-medium">{formatCurrency(selected.amount)}</span></div>
              <div className="mt-2 text-xs text-slate-500">Priority: {selected.priority || "—"} • Assigned: {selected.assignedTo || "nobody"}</div>
              {selected.errors && selected.errors.length > 0 && <div className="mt-3 text-xs text-rose-600">Errors: {selected.errors.join(", ")}</div>}
            </div>

            <div className="mt-6 grid gap-2">
              <button className="py-2 bg-white border rounded" onClick={() => requestFix(selected.id, "Please clarify HSN/taxable value")}>Request fix with note</button>
              <button className="py-2 bg-white border rounded" onClick={() => assignTo(selected.id, "Senior CA")}>Assign to Senior CA</button>
              <button className="py-2 bg-indigo-600 text-white rounded" onClick={() => markFiled(selected.id)}>Mark as Filed</button>
              <button className="py-2 bg-sky-100 text-sky-700 rounded" onClick={() => goToInvoiceFull(selected.id)}>Open full invoice page</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

/* helpers */
const formatCurrency = (n: number) => "₹" + n.toLocaleString();
