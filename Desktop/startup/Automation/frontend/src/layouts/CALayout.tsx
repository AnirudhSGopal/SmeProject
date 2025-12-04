// src/layouts/CALayout.tsx
import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

const CA_NAV = [
  { label: "Dashboard", to: "/ca" },
  { label: "Clients", to: "/ca/clients" },
  { label: "Review Queue", to: "/ca/review-queue" },
  { label: "Invoice Review", to: "/ca/invoice-review" },
  { label: "Chat", to: "/ca/chat" },
  { label: "Returns", to: "/ca/returns" },
  { label: "Reports", to: "/ca/reports" },
  { label: "Payments", to: "/ca/payments" },
  { label: "Tasks", to: "/ca/tasks" },
  { label: "Settings", to: "/ca/settings" },
];

export default function CALayout() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // header-level state
  const [query, setQuery] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([
    "2 invoices missing HSN",
    "Filing due 2025-12-05",
  ]);

  const clearNotifications = () => setNotifications([]);
  const removeNotification = (i: number) =>
    setNotifications((s) => s.filter((_, idx) => idx !== i));

  const doSearch = (q?: string) => {
    const term = (q ?? query).trim();
    window.dispatchEvent(new CustomEvent("app:search", { detail: term }));
    // ensure dashboard is visible so search panel renders
    navigate("/ca");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop sidebar */}
      <nav className="hidden md:block fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-200 z-40">
        <div className="px-6 py-5 border-b flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-linear-to-br from-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold text-lg shadow">CA</div>
          <div>
            <div className="text-lg font-semibold">CA Console</div>
            <div className="text-xs text-slate-500">Firm tools</div>
          </div>
        </div>

        <div className="px-4 py-6 overflow-auto">
          <ul className="space-y-2">
            {CA_NAV.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  end
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-sm ${isActive ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-700 hover:bg-slate-50"}`
                  }
                >
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <div className="text-xs text-slate-500 mb-2">Quick actions</div>
            <div className="space-y-2">
              <button onClick={() => navigate("/ca/review-queue")} className="w-full text-sm py-2 bg-emerald-600 text-white rounded">Open Review</button>
              <button onClick={() => navigate("/ca/clients")} className="w-full text-sm py-2 bg-white border rounded">Clients</button>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 border-t text-xs text-slate-500">
          <div>Notifications</div>
          <div className="mt-2 text-sm text-slate-600">No new notifications</div>
        </div>
      </nav>

      {/* Mobile topbar */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b border-slate-100 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button aria-label="Open menu" onClick={() => setMobileOpen(true)} className="p-2 rounded-md hover:bg-slate-100">
            <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>

          {/* Mobile title clickable to go to /ca */}
          <button onClick={() => navigate("/ca")} className="text-lg font-semibold text-left">
            CA
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/ca/settings" className="p-2 rounded-md hover:bg-slate-100">
            <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" /></svg>
          </Link>
          <div className="h-8 w-8 rounded-full bg-linear-to-br from-indigo-500 to-sky-400 text-white flex items-center justify-center font-semibold">C</div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 md:hidden`}>
        <div className="h-full bg-white border-r border-slate-200 shadow-lg">
          <div className="px-4 py-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded bg-indigo-600 flex items-center justify-center text-white font-bold">CA</div>
              <div className="font-medium">CA Console</div>
            </div>
            <button onClick={() => setMobileOpen(false)} className="p-2 rounded-md hover:bg-slate-100">✕</button>
          </div>

          <div className="px-4 py-4 overflow-auto">
            <ul className="space-y-2">
              {CA_NAV.map((n) => (
                <li key={n.to}>
                  <NavLink onClick={() => setMobileOpen(false)} to={n.to} className={({ isActive }) => `block px-3 py-2 rounded-md text-sm ${isActive ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-700 hover:bg-slate-50"}`}>
                    {n.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="fixed inset-0" onClick={() => setMobileOpen(false)} aria-hidden />
      </div>

      {/* ============================
          Single fixed top header (desktop) — contains search + notifications + profile
          ============================ */}
      <div className="hidden md:block fixed left-72 right-0 top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: page title + breadcrumbs (clickable heading) */}
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/ca")} className="text-left">
              <div className="text-lg font-semibold">CA Dashboard</div>
              <div className="text-xs text-slate-500">Firm tools & reviews</div>
            </button>
          </div>

          {/* Center: search */}
          <div className="flex-1 max-w-3xl px-6">
            <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") doSearch(); }}
                className="px-3 py-2 w-full text-sm outline-none"
                placeholder="Search invoices, clients, GSTIN..."
                aria-label="Search"
              />
              <button onClick={() => doSearch()} className="px-3 py-2 text-slate-600 text-sm border-l border-slate-100">Search</button>
            </div>
          </div>

          {/* Right: quick actions / notifications / profile */}
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/ca/review-queue")} className="px-3 py-2 text-sm rounded-md bg-white border border-slate-200">Review queue</button>

            <div className="relative">
              <button onClick={() => setShowNotif((s) => !s)} className="p-2 rounded-md hover:bg-slate-100 relative" aria-expanded={showNotif} aria-label="Notifications">
                <svg className="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18.6 14.6V11a6 6 0 1 0-12 0v3.6c0 .538-.214 1.055-.595 1.444L4 17h5" /></svg>
                {notifications.length > 0 && <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold leading-none text-white bg-rose-600 rounded-full">{notifications.length}</span>}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded shadow-lg z-50">
                  <div className="p-3 border-b text-sm font-medium flex items-center justify-between">
                    <div>Notifications</div>
                    <div className="text-xs text-slate-500">{notifications.length}</div>
                  </div>
                  <div className="p-2 max-h-44 overflow-auto">
                    {notifications.length === 0 ? <div className="text-xs text-slate-500">No notifications</div> : notifications.map((n, i) => (
                      <div key={i} className="text-sm p-2 border-b last:border-b-0 flex items-start justify-between">
                        <div className="truncate pr-2">{n}</div>
                        <div className="flex flex-col gap-1">
                          <button className="text-xs text-rose-600" onClick={() => removeNotification(i)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 text-right text-xs"><button className="text-xs text-sky-600" onClick={() => { clearNotifications(); setShowNotif(false); }}>Clear</button></div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium">CA Firm</div>
                <div className="text-xs text-slate-500">Account</div>
              </div>
              <div className="h-9 w-9 rounded-full bg-linear-to-br from-indigo-500 to-sky-400 text-white flex items-center justify-center font-semibold">C</div>
            </div>
          </div>
        </div>
      </div>

      {/* main content area (leave left margin for md+) */}
      <main className="md:ml-72 flex-1 px-6 py-5 pt-20"> {/* pt-20 to offset fixed header */}
        <div className="min-h-[60vh]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
