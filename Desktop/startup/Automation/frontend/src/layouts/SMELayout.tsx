// src/layouts/SMELayout.tsx
import { useEffect, useState } from "react";
import { NavLink, Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import type { Me } from "../context/UserContext";
import ProfileMenu from "../components/ProfileMenu";

const BASE = ""; // SME routes are at root level in App.tsx

const PROTECTED_PATHS = [
  "/returns",
  "/billing",
  "/transactions",
  "/upload-queue",
  // protect invoice actions (list is ok, but actions like submit/filing can be nested under /invoices)
  "/invoices",
];

const SME_NAV = [
  { label: "Dashboard", to: `${BASE}/dashboard` },
  { label: "Upload", to: `${BASE}/upload-queue` },
  { label: "Invoices", to: `${BASE}/invoices` },
  { label: "Vendors", to: `${BASE}/vendors` },
  { label: "Returns", to: `${BASE}/returns` },
  { label: "Reports", to: `${BASE}/reports` },
  { label: "Payments", to: `${BASE}/billing` },
  { label: "Transactions", to: `${BASE}/transactions` },
  { label: "Settings", to: `${BASE}/settings` },
];

export default function SMELayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([
    "GST filing due in 5 days",
    "2 invoices failed extraction",
  ]);

  // user info loaded at layout level
  const [me, setMe] = useState<Me | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);

  const clearNotifications = () => setNotifications([]);
  const removeNotification = (i: number) => setNotifications((s) => s.filter((_, idx) => idx !== i));

  const doSearch = (q?: string) => {
    const term = (q ?? query).trim();
    window.dispatchEvent(new CustomEvent("app:search", { detail: term }));
    // navigate to SME dashboard (where Dashboard listens to app:search)
    navigate(`${BASE}/dashboard`);
  };

  useEffect(() => {
    // load /me once for the layout
    let mounted = true;
    async function loadMe() {
      setLoadingMe(true);
      try {
        const res = await fetch("/me", { credentials: "include" });
        if (res.status === 401) {
          // not signed in — redirect to SME login
          if (mounted) {
            setMe(null);
            setLoadingMe(false);
            navigate(`${BASE}/login`);
          }
          return;
        }
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to load user");
        }
        const data: Me = await res.json();
        if (!mounted) return;
        setMe(data);

        // If user is not SME — route them to CA or SME login as appropriate
        if (data.role && data.role !== "SME") {
          if (data.role === "CA") navigate("/ca");
          else navigate(`${BASE}/login`);
          return;
        }

        // if user exists and profile not complete AND they are currently on a protected route, redirect
        const isProtected = PROTECTED_PATHS.some((p) => location.pathname.startsWith(`${BASE}${p}`));
        if (data.profile_complete === false && isProtected) {
          navigate(`${BASE}/smecompleteprofile`, { replace: true });
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

  // watch location changes — if user is loaded and profile incomplete, block protected routes
  useEffect(() => {
    if (!me) return;
    // if me loaded and not complete, redirect away from protected pages
    if (me.profile_complete === false) {
      const isProtected = PROTECTED_PATHS.some((p) => location.pathname.startsWith(`${BASE}${p}`));
      // allow the complete-profile page, settings and dashboard
      if (isProtected && !location.pathname.startsWith(`${BASE}/smecompleteprofile`)) {
        navigate(`${BASE}/smecompleteprofile`, { replace: true });
      }
    }
  }, [location.pathname, me, navigate]);

  // helper to show a small banner when profile incomplete
  const IncompleteProfileBanner = () => {
    if (!me || me.profile_complete) return null;
    return (
      <div className="bg-amber-50 border border-amber-100 text-amber-900 px-4 py-3 rounded-md mb-4 flex items-center justify-between">
        <div className="text-sm">
          Your company profile is incomplete. Complete it to enable filings, payments and advanced features.
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`${BASE}/smecompleteprofile`)}
            className="text-sm bg-amber-600 text-white px-3 py-1 rounded-md"
          >
            Complete profile
          </button>
        </div>
      </div>
    );
  };

  // If loading me, show small loader in the content area (avoid blank flash)
  if (loadingMe) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm text-slate-600">Loading your workspace…</div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ me, setMe }}>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        {/* Desktop sidebar */}
        <nav className="hidden md:block fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-200 z-40">
          <div className="px-6 py-5 border-b flex items-center gap-3">
            <Link to={`${BASE}/dashboard`} className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-linear-to-br from-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold text-lg shadow">GF</div>
              <div>
                <div className="text-lg font-semibold">GSTFlow</div>
                <div className="text-xs text-slate-500">SME Compliance</div>
              </div>
            </Link>
          </div>

          <div className="px-4 py-6 overflow-auto">
            <ul className="space-y-2">
              {SME_NAV.map((n) => (
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
              <div className="text-xs text-slate-500 mb-2">Quick Upload</div>
              <div className="space-y-2">
                <button onClick={() => navigate(`${BASE}/upload-queue`)} className="w-full text-sm py-2 bg-emerald-600 text-white rounded">Quick upload</button>
                <button onClick={() => navigate(`${BASE}/invoices`)} className="w-full text-sm py-2 bg-white border rounded">View invoices</button>
              </div>
            </div>

            {/* quick link to complete profile if needed */}
            {me && me.profile_complete === false && (
              <div className="mt-6">
                <div className="text-xs text-slate-500 mb-2">Profile</div>
                <button onClick={() => navigate(`${BASE}/smecompleteprofile`)} className="w-full text-sm py-2 bg-white border rounded text-amber-700">
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
            <Link to={`${BASE}/dashboard`} className="text-lg font-semibold">SME</Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const t = prompt("Search invoices, vendors, GSTIN...");
                if (t !== null) {
                  setQuery(t);
                  doSearch(t);
                }
              }}
              className="p-2 rounded-md hover:bg-slate-100"
              aria-label="Search"
            >
              <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18A7.5 7.5 0 1 1 10.5 3a7.5 7.5 0 0 1 0 15z"/></svg>
            </button>

            <Link to={`${BASE}/settings`} className="p-2 rounded-md hover:bg-slate-100">
              <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" /></svg>
            </Link>

            <div className="relative">
              <button onClick={() => setShowNotif((s) => !s)} className="p-2 rounded-md hover:bg-slate-100 relative" aria-expanded={showNotif}>
                <svg className="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18.6 14.6V11a6 6 0 1 0-12 0v3.6c0 .538-.214 1.055-.595 1.444L4 17h5" /></svg>
                {notifications.length > 0 && <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full">{notifications.length}</span>}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded shadow-lg z-50">
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

            <div>
              {/* Use ProfileMenu component; showCompleteProfile toggled based on me */}
              <ProfileMenu
                name={me?.name ?? "A"}
                role="SME"
                showCompleteProfile={me?.profile_complete === false}
                completeProfilePath="/sme/smecompleteprofile"
              />
            </div>
          </div>
        </header>

        {/* Mobile drawer */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 md:hidden`}>
          <div className="h-full bg-white border-r border-slate-200 shadow-lg">
            <div className="px-4 py-4 flex items-center justify-between border-b">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-indigo-600 flex items-center justify-center text-white font-bold">GF</div>
                <div className="font-medium">GSTFlow</div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-md hover:bg-slate-100">✕</button>
            </div>

            <div className="px-4 py-4 overflow-auto">
              <ul className="space-y-2">
                {SME_NAV.map((n) => (
                  <li key={n.to}>
                    <NavLink onClick={() => setMobileOpen(false)} to={n.to} className={({ isActive }) => `block px-3 py-2 rounded-md text-sm ${isActive ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-700 hover:bg-slate-50"}`}>
                      {n.label}
                    </NavLink>
                  </li>
                ))}
              </ul>

              {me && me.profile_complete === false && (
                <div className="mt-4">
                  <button onClick={() => { setMobileOpen(false); navigate("/sme/smecompleteprofile"); }} className="w-full text-sm py-2 bg-white border rounded text-amber-700">
                    Complete profile
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="fixed inset-0" onClick={() => setMobileOpen(false)} aria-hidden />
        </div>

        {/* main content area (leave left margin for md+) */}
        <main className="md:ml-72 flex-1 px-6 py-5">
          {/* top header for desktop */}
          <header className="hidden md:flex items-center justify-between mb-5 sticky top-0 z-20 bg-slate-50/80 py-3">
            <div className="flex items-center gap-4">
              <Link to={`${BASE}/dashboard`} className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <div className="text-sm text-slate-500">SME workspace</div>
              </Link>
            </div>

            <div className="flex items-center gap-4 w-full max-w-3xl justify-end">
              <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm flex-1 max-w-2xl">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="px-3 py-2 w-full text-sm outline-none"
                  placeholder="Search invoices, vendors, GSTIN..."
                  onKeyDown={(e) => { if (e.key === "Enter") doSearch(); }}
                />
                <button className="px-3 py-2 text-slate-600 text-sm border-l border-slate-100" onClick={() => doSearch()} aria-label="Search">Search</button>
              </div>

              <button onClick={() => navigate(`${BASE}/upload-queue`)} className="px-3 py-2 text-sm rounded-md bg-white border border-slate-200">Quick upload</button>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <button onClick={() => setShowNotif((s) => !s)} className="relative p-2 rounded-full hover:bg-slate-100" aria-expanded={showNotif}>
                    <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18.6 14.6V11a6 6 0 1 0-12 0v3.6c0 .538-.214 1.055-.595 1.444L4 17h5" /></svg>
                    {notifications.length > 0 && <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full">{notifications.length}</span>}
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
                    <div className="text-sm font-medium">{me?.name ?? "Anirudh"}</div>
                    <div className="text-xs text-slate-500">Owner</div>
                  </div>
                  <ProfileMenu
                    name={me?.name ?? "A"}
                    role="SME"
                    showCompleteProfile={me?.profile_complete === false}
                    completeProfilePath="/sme/smecompleteprofile"
                  />
                </div>
              </div>
            </div>
          </header>

          {/* incomplete profile banner */}
          <div className="max-w-6xl mx-auto">
            <IncompleteProfileBanner />
          </div>

          {/* rendered SME page */}
          <div className="min-h-[60vh]">
            <Outlet />
          </div>
        </main>
      </div>
    </UserContext.Provider>
  );
}
