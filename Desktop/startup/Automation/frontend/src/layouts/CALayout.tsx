import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { CAUserContext } from "../context/CAUserContext";
import type { CAMe } from "../context/CAUserContext";
import ProfileMenu from "../components/ProfileMenu";

const BASE = "/ca";

const DEFAULT_CA_NAV = [
  { label: "Dashboard", to: `${BASE}` },
  { label: "Clients", to: `${BASE}/clients` },
  { label: "Review Queue", to: `${BASE}/review-queue` },
  { label: "Invoice Review", to: `${BASE}/invoice-review` },
  { label: "Chat", to: `${BASE}/chat` },
  { label: "Returns", to: `${BASE}/returns` },
  { label: "Reports", to: `${BASE}/reports` },
  { label: "Payments", to: `${BASE}/payments` },
  { label: "Tasks", to: `${BASE}/tasks` },
  { label: "Profile", to: `${BASE}/profile` },
  { label: "Settings", to: `${BASE}/settings` },
];

const PROTECTED_PATHS = [
  "/ca/review-queue",
  "/ca/invoice-review",
  "/ca/returns",
  "/ca/payments",
  "/ca/tasks",
  "/ca/clients",
];

export default function CALayout() {
  const navigate = useNavigate();
  const location = useLocation();

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

  // user/me state
  const [me, setMe] = useState<CAMe | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadMe() {
      setLoadingMe(true);
      try {
        const res = await fetch("/me", { credentials: "include" });
        if (res.status === 401) {
          if (mounted) {
            setMe(null);
            setLoadingMe(false);
            navigate("/ca/login");
          }
          return;
        }
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to load user");
        }
        const data = await res.json();
        if (!mounted) return;
        setMe(data);

        // If user is not CA, redirect appropriately
        if (data.role && data.role !== "CA") {
          if (data.role === "SME") navigate("/");
          else navigate("/ca/login");
          return;
        }

        // If CA and profile incomplete, and they're on protected route -> redirect to complete-profile
        const isProtected = PROTECTED_PATHS.some((p) => location.pathname.startsWith(p));
        if (data.profile_complete === false && isProtected) {
          navigate("/ca/complete-profile", { replace: true });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unable to load user";
        console.error(message, err);
      } finally {
        if (mounted) setLoadingMe(false);
      }
    }

    loadMe();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // on location changes, enforce profile completion redirect for protected routes
  useEffect(() => {
    if (!me) return;
    if (me.profile_complete === false) {
      const isProtected = PROTECTED_PATHS.some((p) => location.pathname.startsWith(p));
      if (isProtected && !location.pathname.startsWith("/ca/complete-profile")) {
        navigate("/ca/complete-profile", { replace: true });
      }
    }
  }, [location.pathname, me, navigate]);

  // Banner component for incomplete profile
  const IncompleteProfileBanner = () => {
    if (!me || me.profile_complete) return null;
    return (
      <div className="bg-amber-50 border border-amber-100 text-amber-900 px-4 py-3 rounded-md mb-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="text-sm">
          Your CA profile is incomplete. Complete it to enable client filings, approvals and advanced firm tools.
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/ca/complete-profile")}
            className="text-sm bg-amber-600 text-white px-3 py-1 rounded-md"
          >
            Complete profile
          </button>
        </div>
      </div>
    );
  };

  if (loadingMe) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm text-slate-600">Loading CA workspace…</div>
      </div>
    );
  }

  // compute nav list and prepend/append complete-profile when needed
  const caNav = [...DEFAULT_CA_NAV];
  if (me && me.profile_complete === false) {
    // if not already present, add complete profile at the top of the quick actions group
    caNav.splice(1, 0, { label: "Complete profile", to: "/ca/complete-profile" });
  }

  return (
    <CAUserContext.Provider value={{ me, setMe }}>
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
              {caNav.map((n) => (
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

            {/* quick link to complete profile if needed (redundant but convenient) */}
            {me && me.profile_complete === false && (
              <div className="mt-6">
                <div className="text-xs text-slate-500 mb-2">Profile</div>
                <button onClick={() => navigate("/ca/cacompleteprofile")} className="w-full text-sm py-2 bg-white border rounded text-amber-700">
                  Complete profile
                </button>
              </div>
            )}
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

            <button onClick={() => navigate("/ca")} className="text-lg font-semibold text-left">
              CA
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/ca/settings" className="p-2 rounded-md hover:bg-slate-100">
              <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" /></svg>
            </Link>
            <div>
              <ProfileMenu
                name={me?.name ?? "CA"}
                role="CA"
                showCompleteProfile={me?.profile_complete === false}
              />
            </div>
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
                {caNav.map((n) => (
                  <li key={n.to}>
                    <NavLink onClick={() => setMobileOpen(false)} to={n.to} className={({ isActive }) => `block px-3 py-2 rounded-md text-sm ${isActive ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-700 hover:bg-slate-50"}`}>
                      {n.label}
                    </NavLink>
                  </li>
                ))}
              </ul>

              {me && me.profile_complete === false && (
                <div className="mt-4">
                  <button onClick={() => { setMobileOpen(false); navigate("/ca/complete-profile"); }} className="w-full text-sm py-2 bg-white border rounded text-amber-700">
                    Complete profile
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="fixed inset-0" onClick={() => setMobileOpen(false)} aria-hidden />
        </div>

        {/* ============================
            Single fixed top header (desktop)
            ============================ */}
        <div className="hidden md:block fixed left-72 right-0 top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
            {/* Left: page title */}
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
                <ProfileMenu
                  name={me?.name ?? "CA"}
                  role="CA"
                  showCompleteProfile={me?.profile_complete === false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* main content area (leave left margin for md+) */}
        <main className="md:ml-72 flex-1 px-6 py-5 pt-20">
          {/* incomplete profile banner */}
          <IncompleteProfileBanner />

          {/* rendered CA page */}
          <div className="min-h-[60vh]">
            <Outlet />
          </div>
        </main>
      </div>
    </CAUserContext.Provider>
  );
}
