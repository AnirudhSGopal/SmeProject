// src/pages/sme/Dashboard.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type InvoiceStatus = "Pending" | "Processing" | "Extracted" | "Error" | "Approved" | "Rejected";
type LineItem = { description: string; hsn: string; qty: number; rate: number; taxableValue: number; taxRate: number; };
type Invoice = { id: string; smeName: string; amount: number; status: InvoiceStatus; date: string; supplierName?: string; supplierGst?: string; invoiceNumber?: string; lineItems?: LineItem[]; imageUrl?: string; errors?: string[]; };
type Vendor = { id: string; name: string; gstin?: string; state?: string; totalSpend: number; };
type ChatMessage = { id: string; from: "SME" | "CA"; text: string; time: string; invoiceId?: string; };
type TeamMember = { id: string; name: string; email: string; role: "Owner" | "Member" };

const demoInvoices: Invoice[] = [
  { id: "INV-001", smeName: "Anirudh Textiles", amount: 50240, status: "Pending", date: "2025-11-29", supplierName: "Siddhi Suppliers", supplierGst: "27ABCDE1234F1Z5", invoiceNumber: "S-1001", lineItems: [{ description: "Fabric Roll", hsn: "5208", qty: 10, rate: 4200, taxableValue: 42000, taxRate: 12 }], imageUrl: "", errors: [] },
  { id: "INV-002", smeName: "Bright Foods", amount: 75000, status: "Extracted", date: "2025-11-28", supplierName: "Global Food Traders", supplierGst: "07PQRSX5678Y2Z3", invoiceNumber: "GFT-234", lineItems: [{ description: "Canned Goods", hsn: "2002", qty: 50, rate: 1500, taxableValue: 75000, taxRate: 5 }], imageUrl: "", errors: [] },
  { id: "INV-003", smeName: "LMN Pvt", amount: 30000, status: "Error", date: "2025-11-27", supplierName: "Karnataka Supplies", supplierGst: "29KARNATAKA9876", invoiceNumber: "K-330", lineItems: [{ description: "Components", hsn: "8536", qty: 20, rate: 1500, taxableValue: 30000, taxRate: 18 }], imageUrl: "", errors: ["Missing HSN on line 1"] },
  { id: "INV-004", smeName: "Sunrise Bakers", amount: 15820, status: "Processing", date: "2025-11-26", supplierName: "Baker's Hub", supplierGst: "09BAKER0001X2Y", invoiceNumber: "BH-102", lineItems: [{ description: "Flour (kg)", hsn: "1101", qty: 100, rate: 158, taxableValue: 15800, taxRate: 5 }], imageUrl: "", errors: [] },
  { id: "INV-005", smeName: "Green Grocers", amount: 9620, status: "Extracted", date: "2025-11-25", supplierName: "Veg Distributors", supplierGst: "08VEG1234A1Z9", invoiceNumber: "VD-77", lineItems: [{ description: "Fresh Vegetables", hsn: "0709", qty: 200, rate: 48.1, taxableValue: 9620, taxRate: 5 }], imageUrl: "", errors: [] },
];

const demoVendors: Vendor[] = [
  { id: "V-1", name: "Siddhi Suppliers", gstin: "27ABCDE1234F1Z5", state: "Maharashtra", totalSpend: 152400 },
  { id: "V-2", name: "Global Food Traders", gstin: "07PQRSX5678Y2Z3", state: "Delhi", totalSpend: 200000 },
  { id: "V-3", name: "Karnataka Supplies", gstin: "29KARNATAKA9876", state: "Karnataka", totalSpend: 50000 },
  { id: "V-4", name: "Baker's Hub", gstin: "09BAKER0001X2Y", state: "Karnataka", totalSpend: 45200 },
];

const demoChats: ChatMessage[] = [
  { id: "c1", from: "SME", text: "Forwarded 3 invoices for Nov. Please validate ITC.", time: "09:10 AM", invoiceId: "INV-001" },
  { id: "c2", from: "CA", text: "Received. I see one missing HSN — ask vendor.", time: "09:35 AM", invoiceId: "INV-003" },
  { id: "c3", from: "SME", text: "Marked INV-004 as urgent, need it reconciled.", time: "10:05 AM", invoiceId: "INV-004" },
];

const demoTeam: TeamMember[] = [
  { id: "u1", name: "Anirudh (you)", email: "anirudh@example.com", role: "Owner" },
  { id: "u2", name: "Priya", email: "priya@example.com", role: "Owner" },
  { id: "u3", name: "Ravi", email: "ravi@example.com", role: "Member" },
];

const statusColors: Record<InvoiceStatus, string> = { Pending: "bg-yellow-100 text-yellow-800", Processing: "bg-sky-100 text-sky-800", Extracted: "bg-green-100 text-green-800", Error: "bg-red-100 text-red-800", Approved: "bg-indigo-100 text-indigo-800", Rejected: "bg-gray-100 text-gray-800" };
const formatCurrency = (n: number) => "₹" + n.toLocaleString();

type SearchResults = { invoices: Invoice[]; vendors: Vendor[]; chats: ChatMessage[] };

export default function SMEDashboard() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState<Invoice[]>(demoInvoices);
  const [vendors, setVendors] = useState<Vendor[]>(demoVendors);
  const [chats, setChats] = useState<ChatMessage[]>(demoChats);
  const [team, setTeam] = useState<TeamMember[]>(demoTeam);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [query, setQuery] = useState("");
  const [notifications, setNotifications] = useState<string[]>(["GST filing due in 5 days", "2 invoices failed extraction"]);
  const [plan, setPlan] = useState({ name: "Starter", usage: 128, limit: 500, nextBilling: "2026-01-01" });
  const [showNotif, setShowNotif] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatInput, setChatInput] = useState("");

  // CA invite status
  const [caInviteStatus, setCaInviteStatus] = useState<"none" | "sent" | "accepted">("none");

  // search results + UI flag
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  // settings draft
  const [planDraft, setPlanDraft] = useState({ name: plan.name, usage: plan.usage, limit: plan.limit, nextBilling: plan.nextBilling });

  useEffect(() => {
    // keep draft in sync with active plan
    setPlanDraft({ name: plan.name, usage: plan.usage, limit: plan.limit, nextBilling: plan.nextBilling });
  }, [plan]);

  const totals = useMemo(() => {
    const pending = invoices.filter((i) => i.status === "Pending" || i.status === "Processing").length;
    const errors = invoices.filter((i) => i.status === "Error" || (i.errors && i.errors.length > 0)).length;
    const gstEstimate = invoices.reduce((acc, inv) => acc + (inv.status === "Extracted" || inv.status === "Approved" ? inv.amount * 0.12 : 0), 0);
    return { pending, errors, gstEstimate: Math.round(gstEstimate) };
  }, [invoices]);

  const pushNotification = (text: string) => setNotifications((n) => [text, ...n].slice(0, 50));
  const removeNotification = (idx: number) => setNotifications((n) => n.filter((_, i) => i !== idx));
  const clearNotifications = () => setNotifications([]);

  const checkStatuses = () => {
    const { pending, errors, gstEstimate } = totals;
    pushNotification(`Status: ${pending} pending/processing • ${errors} errored • Est GST ₹${gstEstimate}`);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const created = Array.from(files).map((f, idx) => {
      const id = `UP-${Date.now().toString().slice(-5)}-${idx}`;
      const inv: Invoice = { id, smeName: "Your SME", amount: 0, status: "Processing", date: new Date().toISOString().slice(0, 10), imageUrl: URL.createObjectURL(f), lineItems: [], errors: [] };
      return inv;
    });
    setInvoices((prev) => [...created, ...prev]);
    pushNotification(`${files.length} file(s) uploaded`);
  };

  const approve = (id: string) => {
    setInvoices((prev) => prev.map((p) => (p.id === id ? { ...p, status: "Approved" } : p)));
    pushNotification(`${id} approved`);
    if (selectedInvoice && selectedInvoice.id === id) setSelectedInvoice({ ...selectedInvoice, status: "Approved" });
  };

  const fixError = (id: string) => {
    setInvoices((prev) => prev.map((p) => (p.id === id ? { ...p, status: "Extracted", errors: [] } : p)));
    pushNotification(`${id} marked fixed`);
  };

  const sendChat = (text: string) => {
    if (!text.trim() || caInviteStatus !== "accepted") return;
    const msg: ChatMessage = { id: `m${Date.now()}`, from: "SME", text: text.trim(), time: new Date().toLocaleTimeString(), invoiceId: undefined };
    setChats((c) => [...c, msg]);
  };

  const filteredInvoices = invoices.filter((i) => i.id.toLowerCase().includes(query.toLowerCase()) || (i.supplierName || "").toLowerCase().includes(query.toLowerCase()) || (i.smeName || "").toLowerCase().includes(query.toLowerCase()));

  const addMember = (name: string, email: string, role: "Owner" | "Member") => {
    const ownersCount = team.filter(t => t.role === "Owner").length;
    if (role === "Owner" && ownersCount >= 5) {
      pushNotification(`Cannot add more than 5 owners`);
      return false;
    }
    const id = `u${Date.now().toString().slice(-4)}`;
    setTeam((t) => [...t, { id, name, email, role }]);
    pushNotification(`Added ${name} as ${role}`);
    return true;
  };

  const removeMember = (id: string) => {
    setTeam((t) => t.filter(m => m.id !== id));
    pushNotification(`Removed member`);
  };

  const inviteByEmail = (email: string) => {
    if (!email.trim()) { pushNotification(`Enter a valid email`); return; }
    const name = email.split("@")[0];
    addMember(name, email, "Member");
    pushNotification(`Invite sent to ${email}`);
  };

  const goToUploadQueueFull = () => { navigate("/upload-queue"); };
  const goToInvoicesFull = () => { navigate("/invoices"); };
  const goToVendors = () => { navigate("/vendors"); };
  const goToChat = () => { navigate("/chat"); }; // adjust route if your app uses a different path for chat

  const handleSearch = (q?: string) => {
    const term = (q ?? query).trim().toLowerCase();
    if (!term) { setSearchResults(null); setShowSearchPanel(false); return; }
    const invs = invoices.filter((i) => i.id.toLowerCase().includes(term) || (i.supplierName || "").toLowerCase().includes(term) || (i.smeName || "").toLowerCase().includes(term) || (i.invoiceNumber || "").toLowerCase().includes(term));
    const vnds = vendors.filter((v) => v.name.toLowerCase().includes(term) || (v.gstin || "").toLowerCase().includes(term) || (v.state || "").toLowerCase().includes(term));
    const chs = chats.filter((c) => c.text.toLowerCase().includes(term) || (c.invoiceId || "").toLowerCase().includes(term));
    setSearchResults({ invoices: invs, vendors: vnds, chats: chs });
    setShowSearchPanel(true);
  };

  // Listen for header-level search events dispatched by SMELayout
  useEffect(() => {
    const onAppSearch = (e: any) => {
      const term = (e?.detail ?? "").toString();
      setQuery(term);
      if (term.trim()) {
        handleSearch(term);
      } else {
        setSearchResults(null);
        setShowSearchPanel(false);
      }
    };
    window.addEventListener("app:search", onAppSearch);
    return () => window.removeEventListener("app:search", onAppSearch);
  }, [invoices, vendors, chats]);

  const saveSettings = () => {
    setPlan({ name: planDraft.name, usage: Number(planDraft.usage), limit: Number(planDraft.limit), nextBilling: planDraft.nextBilling });
    pushNotification("Settings saved");
    setShowSettings(false);
  };

  const deleteVendor = (id: string) => {
    setVendors((prev) => prev.filter(v => v.id !== id));
    pushNotification("Vendor removed");
  };

  const inviteCA = () => {
    if (caInviteStatus === "accepted") {
      pushNotification("CA already connected");
      return;
    }
    setCaInviteStatus("sent");
    pushNotification("CA invitation sent");
  };

  const simulateCAAccept = () => {
    setCaInviteStatus("accepted");
    pushNotification("CA accepted the invitation — chat enabled");
  };

  const cancelInvite = () => {
    setCaInviteStatus("none");
    pushNotification("CA invitation cancelled");
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white text-slate-900">
      {/* CONTENT: layout provides sidebar/header. Dashboard renders content only. */}
      <main className="max-w-7xl mx-auto px-6 py-5">
        {/* NOTE: dashboard-level navbar/search removed — SMELayout header drives global search */}

        {/* Search panel (opened by SMELayout header search) */}
        {showSearchPanel && searchResults && (
          <div className="mb-4 bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-slate-500">Search results for</div>
                <div className="text-lg font-semibold">{query}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-slate-500">{searchResults.invoices.length} invoices</div>
                <div className="text-xs text-slate-500">{searchResults.vendors.length} vendors</div>
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
                        <div className="text-xs text-slate-400">{inv.supplierName} • {formatCurrency(inv.amount)}</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button className="text-xs px-2 py-1 bg-indigo-600 text-white rounded" onClick={() => { setSelectedInvoice(inv); setShowSearchPanel(false); }}>Open</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-2">Vendors</div>
                <ul className="space-y-2 max-h-40 overflow-auto">
                  {searchResults.vendors.length === 0 ? <li className="text-xs text-slate-400">No vendors</li> : searchResults.vendors.map(v => (
                    <li key={v.id} className="p-2 border rounded flex items-center justify-between">
                      <div>
                        <div className="font-medium truncate">{v.name}</div>
                        <div className="text-xs text-slate-400 truncate">{v.gstin}</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button className="text-xs px-2 py-1 bg-white border rounded" onClick={() => deleteVendor(v.id)}>Remove</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-2">Chats</div>
                <ul className="space-y-2 max-h-40 overflow-auto">
                  {searchResults.chats.length === 0 ? <li className="text-xs text-slate-400">No chats</li> : searchResults.chats.map(c => (
                    <li key={c.id} className="p-2 border rounded">
                      <div className="text-xs text-slate-500">{c.from} • {c.time} {c.invoiceId ? `• ${c.invoiceId}` : ''}</div>
                      <div className="text-sm">{c.text}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <StatCard title="Invoices Pending" value={totals.pending.toString()} subtitle="Requires action" />
          <StatCard title="Extraction Errors" value={totals.errors.toString()} subtitle="Need review" />
          <StatCard title="Estimated GST" value={formatCurrency(totals.gstEstimate)} subtitle="This period" />
        </section>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Status Queue */}
            <div className="bg-white rounded-2xl shadow border border-slate-100 flex flex-col max-h-[340px]">
              <div className="sticky top-0 bg-white/90 backdrop-blur z-10 border-b border-slate-100 px-6 py-3 flex items-center justify-between">
                <div>
                  {/* Clickable heading -> Upload Queue */}
                  <button
                    onClick={goToUploadQueueFull}
                    className="text-lg font-semibold text-left cursor-pointer hover:underline"
                    aria-label="Open Upload Queue"
                  >
                    Upload Status Queue
                  </button>
                  <div className="text-xs text-slate-400">Live • {invoices.length} items</div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="text-xs px-2 py-0.5 rounded bg-slate-50 border border-slate-100" onClick={checkStatuses}>Check Status</button>

                  <button title="Open full Upload Queue page" onClick={goToUploadQueueFull} className="p-2 rounded bg-indigo-600 text-white text-xs flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h6m0 0v6m0-6L8 18" />
                    </svg>
                    Full
                  </button>
                </div>
              </div>

              <div className="overflow-auto p-6 space-y-3">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:shadow-sm">
                    <div>
                      <div className="font-medium">{inv.id} <span className="text-xs text-slate-400">• {inv.supplierName}</span></div>
                      <div className="text-xs text-slate-400">{inv.date} • {formatCurrency(inv.amount)}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[inv.status]}`}>{inv.status}</div>
                      <button className="text-sm px-3 py-1 rounded bg-indigo-600 text-white" onClick={() => setSelectedInvoice(inv)}>Review</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="bg-white rounded-2xl shadow border border-slate-100 flex flex-col max-h-80">
              <div className="sticky top-0 bg-white/90 backdrop-blur z-10 border-b border-slate-100 px-6 py-3 flex items-center justify-between">
                {/* Clickable Recent Invoices heading -> Invoices page */}
                <h3 className="font-semibold">
                  <button onClick={goToInvoicesFull} className="cursor-pointer hover:underline" aria-label="Open Invoices">
                    Recent Invoices
                  </button>
                </h3>

                <div className="flex items-center gap-2">
                  <div className="text-sm text-slate-400">Showing {filteredInvoices.length}</div>
                  <button className="text-xs px-2 py-0.5 rounded bg-slate-50 border border-slate-100" onClick={checkStatuses}>Check Status</button>

                  <button title="Open full Invoices page" onClick={goToInvoicesFull} className="p-2 rounded bg-indigo-600 text-white text-xs flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h6m0 0v6m0-6L8 18" />
                    </svg>
                    Full
                  </button>
                </div>
              </div>

              <div className="overflow-auto p-6">
                <table className="w-full text-sm table-auto">
                  <thead className="text-slate-500 text-xs uppercase">
                    <tr>
                      <th className="py-3 px-4 text-left">Invoice</th>
                      <th className="py-3 px-4 text-left">Supplier</th>
                      <th className="py-3 px-4 text-left">Amount</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Date</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4"><div className="font-medium">{inv.id}</div><div className="text-xs text-slate-400">{inv.invoiceNumber || '—'}</div></td>
                        <td className="py-3 px-4"><div className="font-medium">{inv.supplierName || 'Unknown'}</div><div className="text-xs text-slate-400">{inv.supplierGst || 'GSTIN missing'}</div></td>
                        <td className="py-3 px-4">{formatCurrency(inv.amount)}</td>
                        <td className="py-3 px-4"><div className={`inline-flex items-center gap-2 px-3 py-1 rounded ${statusColors[inv.status]}`}><span className="text-xs font-medium">{inv.status}</span></div></td>
                        <td className="py-3 px-4 text-slate-500">{inv.date}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button className="text-xs px-3 py-1 rounded bg-indigo-600 text-white" onClick={() => setSelectedInvoice(inv)}>View</button>
                            {(inv.status === 'Error' || (inv.errors && inv.errors.length > 0))
                              ? <button className="text-xs px-3 py-1 rounded bg-amber-100 text-amber-800" onClick={() => fixError(inv.id)}>Fix</button>
                              : <button className="text-xs px-3 py-1 rounded bg-emerald-50 text-emerald-700" onClick={() => approve(inv.id)}>Approve</button>
                            }
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Error center */}
            <div className="bg-white rounded-2xl shadow p-6 border border-slate-100 overflow-visible">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Error Center</h3>
                <div className="text-sm text-slate-400">Quick fixes</div>
              </div>

              <div className="space-y-2">
                {invoices.filter(i => i.errors && i.errors.length > 0).length === 0 ? (
                  <div className="text-slate-500 text-sm">No critical extraction errors detected.</div>
                ) : (
                  invoices.filter(i => i.errors && i.errors.length > 0).map(i => (
                    <div key={i.id} className="p-3 rounded-lg border flex items-start justify-between">
                      <div>
                        <div className="font-medium">{i.id} • {i.supplierName}</div>
                        <div className="text-xs text-slate-500">{i.errors?.join('; ')}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-sm px-3 py-1 rounded bg-slate-50" onClick={() => setSelectedInvoice(i)}>Review</button>
                        <button className="text-sm px-3 py-1 rounded bg-emerald-50 text-emerald-700" onClick={() => fixError(i.id)}>Mark fixed</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* right column */}
          <aside className="space-y-6 w-full md:w-[360px]">
            {caInviteStatus === "accepted" ? (
              <div className="bg-white rounded-2xl shadow p-3 border border-slate-100 max-h-[330px] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  {/* Clickable Chat heading -> Chat page */}
                  <h3 className="font-semibold text-sm">
                    <button onClick={goToChat} className="cursor-pointer hover:underline" aria-label="Open Chat">Chat (SME ↔ CA)</button>
                  </h3>
                  <div className="text-xs text-slate-400">{chats.length} messages</div>
                </div>

                <div className="flex-1 overflow-auto space-y-2 mb-3 pr-1">
                  {chats.length === 0 ? <div className="text-sm text-slate-500">No messages yet — start the conversation</div> : chats.map((m) => (
                    <div key={m.id} className={`p-2 rounded-md ${m.from === 'SME' ? 'bg-indigo-50 self-end' : 'bg-slate-50 self-start'}`}>
                      <div className="text-xs text-slate-500">{m.from} • {m.time} {m.invoiceId ? `• ${m.invoiceId}` : ''}</div>
                      <div className="text-sm">{m.text}</div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 items-center">
                  <input
                    placeholder="Message..."
                    className="flex-1 border border-slate-200 rounded px-2 py-1 text-sm"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { if (!chatInput.trim()) return; sendChat(chatInput); setChatInput(""); } }}
                  />
                  <button className="px-3 py-1 bg-indigo-600 text-white rounded text-sm" onClick={() => { if (!chatInput.trim()) return; sendChat(chatInput); setChatInput(""); }}>Send</button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow p-4 border border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    {/* Chat invite heading clickable */}
                    <h3 className="font-semibold">
                      <button onClick={goToChat} className="cursor-pointer hover:underline" aria-label="Open Chat">Chat with your CA</button>
                    </h3>
                    <div className="text-xs text-slate-500 mt-1">Invite a CA to start an in-app conversation. Chat UI will appear after they accept.</div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {caInviteStatus === "none" ? (
                    <>
                      <div className="text-sm text-slate-600">No CA invited yet.</div>
                      <div className="flex gap-2 mt-3">
                        <button className="py-2 px-3 bg-indigo-600 text-white rounded text-sm" onClick={inviteCA}>Invite CA</button>
                        <button className="py-2 px-3 bg-white border border-slate-200 rounded text-sm" onClick={() => { pushNotification("Find CA: open marketplace (placeholder)"); }}>Find CA</button>
                      </div>
                    </>
                  ) : (
                    <div>
                      <div className="text-sm text-slate-600">Invitation sent to your CA. Waiting for acceptance.</div>
                      <div className="mt-3 flex gap-2">
                        <button className="py-2 px-3 bg-emerald-600 text-white rounded text-sm" onClick={simulateCAAccept}>Simulate Accept</button>
                        <button className="py-2 px-3 bg-white border border-slate-200 rounded text-sm" onClick={cancelInvite}>Cancel Invite</button>
                        <button className="py-2 px-3 bg-white border border-slate-200 rounded text-sm" onClick={() => { pushNotification("Resent CA invite"); }}>Resend</button>
                      </div>
                      <div className="mt-3 text-xs text-slate-400">Tip: replace "Simulate Accept" with real webhook handling.</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow p-4 border border-slate-100 max-h-[420px] flex flex-col overflow-auto">
              {/* Clickable Vendor Master heading -> Vendors page */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">
                  <button onClick={goToVendors} className="cursor-pointer hover:underline" aria-label="Open Vendors">Vendor Master</button>
                </h3>
                <div className="text-xs text-slate-400">Last 6 months</div>
              </div>

              <ul className="flex-1 overflow-auto divide-y divide-slate-100">
                {vendors.map((v) => (
                  <li key={v.id} className="py-3 flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{v.name}</div>
                      <div className="text-xs text-slate-400 truncate">{v.gstin}</div>
                    </div>
                    <div className="ml-4 text-sm font-medium whitespace-nowrap">{formatCurrency(v.totalSpend)}</div>
                  </li>
                ))}
              </ul>

              <div className="pt-3 sticky bottom-0 bg-white pb-1">
                <button className="w-full text-sm py-2 bg-indigo-600 text-white rounded" onClick={goToVendors}>Manage Vendors</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-4 border border-slate-100">
              <h3 className="font-semibold mb-2">Billing & Payments</h3>
              <div className="text-sm">Balance: <span className="font-medium">{formatCurrency(0)}</span></div>
              <div className="mt-3 grid gap-2"><button className="py-2 text-sm bg-emerald-600 text-white rounded">Pay Now</button><button className="py-2 text-sm bg-white border border-slate-200 rounded">Saved Methods</button></div>
            </div>

            <div className="bg-white rounded-2xl shadow p-4 border border-slate-100">
              <h3 className="font-semibold mb-2">Quick Actions</h3>
              <div className="grid gap-2">
                <button className="py-2 text-sm bg-emerald-600 text-white rounded" onClick={() => pushNotification("GST return started")}>Start GST Return</button>
                <button className="py-2 text-sm bg-amber-100 text-amber-800 rounded">Reconcile Bank</button>
                <button className="py-2 text-sm bg-sky-100 text-sky-700 rounded" onClick={inviteCA}>Invite CA</button>
              </div>
            </div>
          </aside>
        </div>

        {/* bottom area */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow p-4 border border-slate-100">
            <h3 className="font-semibold">Recent Activity</h3>
            <ul className="mt-3 text-sm space-y-2"><li className="text-slate-600">You uploaded 3 files • 11/30/2025</li><li className="text-slate-600">CA requested clarification on INV-003 • 11/30/2025</li></ul>
          </div>

          <div className="bg-white rounded-2xl shadow p-4 border border-slate-100">
            <h3 className="font-semibold">GST Summary</h3>
            <div className="mt-3 text-sm space-y-2"><div>Total purchases: {formatCurrency(255240)}</div><div>ITC available: {formatCurrency(30240)}</div><div>GST payable (est): {formatCurrency(totals.gstEstimate)}</div></div>
          </div>

          <div className="bg-white rounded-2xl shadow p-4 border border-slate-100">
            <h3 className="font-semibold">Transactions</h3>
            <ul className="mt-3 text-sm space-y-2">{[] .map((t: any) => (<li key={t.id} className="flex items-center justify-between"><div>{t.type} • {t.date}</div><div className="font-medium">{formatCurrency(t.amount)}</div></li>))}</ul>
          </div>
        </div>
      </main>

      {/* selected invoice drawer */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setSelectedInvoice(null)} aria-hidden />
          <aside className="w-96 bg-white border-l border-slate-200 p-6 overflow-auto shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{selectedInvoice.id}</h3>
                <div className="text-xs text-slate-500">{selectedInvoice.smeName} • {selectedInvoice.date}</div>
              </div>
              <div className="flex items-center gap-2"><button className="text-sm px-3 py-1 rounded bg-slate-100" onClick={() => setSelectedInvoice(null)}>Close</button><button className="text-sm px-3 py-1 rounded bg-emerald-600 text-white" onClick={() => { approve(selectedInvoice.id); setSelectedInvoice(null); }}>Approve</button></div>
            </div>

            <div className="mt-4"><label className="text-xs text-slate-500">Invoice Image</label><div className="mt-2 h-40 bg-slate-50 rounded flex items-center justify-center text-slate-400">{selectedInvoice.imageUrl ? <img src={selectedInvoice.imageUrl} alt="invoice" className="max-h-36" /> : <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 3v12" /><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M16 7l-4-4-4 4" /></svg>}</div></div>

            <div className="mt-4"><h4 className="text-sm font-medium">Extracted Fields</h4><div className="mt-2 space-y-3"><SimpleField label="Supplier Name" value={selectedInvoice.supplierName || ""} onChange={(v) => setSelectedInvoice({ ...selectedInvoice, supplierName: v })} /><SimpleField label="Supplier GSTIN" value={selectedInvoice.supplierGst || ""} onChange={(v) => setSelectedInvoice({ ...selectedInvoice, supplierGst: v })} /><SimpleField label="Invoice Number" value={selectedInvoice.invoiceNumber || ""} onChange={(v) => setSelectedInvoice({ ...selectedInvoice, invoiceNumber: v })} /><SimpleField label="Amount" value={selectedInvoice.amount ? selectedInvoice.amount.toString() : "0"} onChange={(v) => setSelectedInvoice({ ...selectedInvoice, amount: Number(v || 0) })} /></div></div>

            <div className="mt-4">
              <h4 className="text-sm font-medium">Line Items</h4>
              <div className="mt-2 space-y-2">
                {selectedInvoice.lineItems && selectedInvoice.lineItems.length > 0 ? (
                  selectedInvoice.lineItems.map((li, idx) => (
                    <div key={idx} className="p-3 border rounded">
                      <div className="font-medium">{li.description}</div>
                      <div className="text-xs text-slate-500">HSN: {li.hsn} • Qty: {li.qty} • Rate: {formatCurrency(li.rate)}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-400">No line items extracted</div>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3"><button className="flex-1 py-2 rounded border border-slate-200 bg-white text-sm" onClick={() => { setInvoices((prev) => prev.map((p) => (p.id === selectedInvoice.id ? selectedInvoice : p))); setSelectedInvoice({ ...selectedInvoice }); pushNotification(`Saved ${selectedInvoice.id}`); }}>Save changes</button><button className="flex-1 py-2 rounded bg-indigo-600 text-white text-sm" onClick={() => { pushNotification(`Sent ${selectedInvoice.id} to CA for review`); }}>Send to CA</button></div>
          </aside>
        </div>
      )}

      {/* settings slide-over */}
      {showSettings && (
        <div className="fixed inset-0 z-60 flex">
          <div className="flex-1 bg-black/40" onClick={() => setShowSettings(false)} aria-hidden />
          <aside className="w-full sm:w-[520px] max-w-full sm:max-w-[520px] bg-white sm:border-l border-slate-200 p-6 overflow-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Settings</h3>
              <div className="flex gap-2">
                <button className="text-sm px-3 py-1 rounded bg-slate-100" onClick={() => setShowSettings(false)}>Close</button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 border rounded">
                <div className="flex items-center justify-between">
                  <div><div className="text-sm font-medium">Subscription</div><div className="text-xs text-slate-500">Manage plan & billing</div></div>
                  <div className="text-right"><div className="text-sm font-medium">{plan.name}</div><div className="text-xs text-slate-500">Next bill: {plan.nextBilling}</div></div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2">
                  <label className="text-xs text-slate-500">Plan name</label>
                  <input className="border px-2 py-2 rounded" value={planDraft.name} onChange={(e) => setPlanDraft({ ...planDraft, name: e.target.value })} />
                  <label className="text-xs text-slate-500">Usage</label>
                  <input type="number" className="border px-2 py-2 rounded" value={planDraft.usage} onChange={(e) => setPlanDraft({ ...planDraft, usage: Number(e.target.value) })} />
                  <label className="text-xs text-slate-500">Limit</label>
                  <input type="number" className="border px-2 py-2 rounded" value={planDraft.limit} onChange={(e) => setPlanDraft({ ...planDraft, limit: Number(e.target.value) })} />
                  <label className="text-xs text-slate-500">Next Billing</label>
                  <input className="border px-2 py-2 rounded" value={planDraft.nextBilling} onChange={(e) => setPlanDraft({ ...planDraft, nextBilling: e.target.value })} />
                  <div className="flex gap-2 mt-3">
                    <button className="py-2 px-3 bg-emerald-600 text-white rounded text-sm" onClick={saveSettings}>Save</button>
                    <button className="py-2 px-3 bg-white border border-slate-200 rounded text-sm" onClick={() => { setPlanDraft({ name: plan.name, usage: plan.usage, limit: plan.limit, nextBilling: plan.nextBilling }); }}>Reset</button>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded">
                <div className="flex items-center justify-between">
                  <div><div className="text-sm font-medium">Team & Access</div><div className="text-xs text-slate-500">Manage members, roles & invites</div></div>
                  <div className="text-xs text-slate-500">{team.length} members</div>
                </div>

                <div className="mt-4 space-y-3">
                  {team.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{member.name} <span className="text-xs text-slate-400">• {member.role}</span></div>
                        <div className="text-xs text-slate-500">{member.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-xs px-2 py-1 rounded bg-white border border-slate-200" onClick={() => { }}>Edit</button>
                        <button className="text-xs px-2 py-1 rounded bg-rose-50 text-rose-700" onClick={() => removeMember(member.id)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>

                <AddMemberForm onAdd={(name, email, role) => addMember(name, email, role)} />
                <div className="mt-3 border-t pt-3">
                  <div className="text-xs text-slate-500 mb-2">Invite by email</div>
                  <InviteByEmail onInvite={(email) => inviteByEmail(email)} />
                </div>

                <div className="mt-2 text-xs text-slate-500">Owners allowed up to 5. Use Members for read-only or limited access.</div>
              </div>

              <div className="p-4 border rounded">
                <div className="flex items-center justify-between">
                  <div><div className="text-sm font-medium">Account</div><div className="text-xs text-slate-500">Subscription, seats & access</div></div>
                </div>

                <div className="mt-3 grid gap-2">
                  <div className="flex items-center justify-between text-sm"><div>Seats used</div><div>{team.length}/{5 + 10} seats</div></div>
                  <div className="flex items-center justify-between text-sm"><div>Owners</div><div>{team.filter(t => t.role === "Owner").length} (max 5)</div></div>
                </div>

                <div className="mt-3"><button className="py-2 px-3 bg-sky-100 text-sky-700 rounded text-sm">Manage subscription</button></div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

/* small components kept local to this file */

const StatCard: React.FC<{ title: string; value: string; subtitle?: string }> = ({ title, value, subtitle }) => (
  <div className="bg-white rounded-2xl shadow p-4 border border-slate-100">
    <div className="text-xs text-slate-500">{title}</div>
    <div className="text-2xl font-semibold mt-1">{value}</div>
    {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
  </div>
);

const SimpleField: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <label className="block text-sm">
    <div className="text-xs text-slate-500 mb-1">{label}</div>
    <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-slate-200 rounded px-2 py-2 text-sm" />
  </label>
);

const AddMemberForm: React.FC<{ onAdd: (name: string, email: string, role: "Owner" | "Member") => boolean | void }> = ({ onAdd }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"Owner" | "Member">("Member");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    if (!name.trim() || !email.trim()) { setError("Name and email required"); return; }
    const ok = onAdd(name.trim(), email.trim(), role);
    if (ok === false) { setError("Could not add: owners limit reached"); return; }
    setName(""); setEmail(""); setRole("Member");
  };

  return (
    <div className="mt-4 border-t pt-3">
      <div className="text-xs text-slate-500 mb-2">Add people</div>
      <div className="grid grid-cols-1 gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full border px-2 py-2 rounded text-sm" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full border px-2 py-2 rounded text-sm" />
        <div className="flex items-center gap-2">
          <label className="text-sm">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as any)} className="border px-2 py-2 rounded text-sm">
            <option value="Member">Member</option>
            <option value="Owner">Owner</option>
          </select>
        </div>
        {error && <div className="text-rose-600 text-xs">{error}</div>}
        <div className="text-right"><button className="py-2 px-3 bg-indigo-600 text-white rounded text-sm" onClick={submit}>Add</button></div>
      </div>
    </div>
  );
};

const InviteByEmail: React.FC<{ onInvite: (email: string) => void }> = ({ onInvite }) => {
  const [email, setEmail] = useState("");
  return (
    <div className="flex gap-2 items-center">
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="invite@company.com" className="flex-1 border px-2 py-2 rounded text-sm" />
      <button className="py-2 px-3 bg-indigo-600 text-white rounded text-sm" onClick={() => { onInvite(email); setEmail(""); }}>Invite</button>
    </div>
  );
};
