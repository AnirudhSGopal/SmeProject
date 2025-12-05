// src/components/ProfileMenu.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

type Role = "CA" | "SME";

export default function ProfileMenu({
  name,
  role,
  showCompleteProfile = false,
  completeProfilePath,
}: {
  name: string;
  role: Role;
  showCompleteProfile?: boolean;
  /**
   * Optional override path for "Complete profile".
   * Defaults to:
   *  - CA: /ca/complete-profile
   *  - SME: /sme/smecompleteprofile
   */
  completeProfilePath?: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // first-letter avatar fallback
  const firstLetter = name?.trim()?.charAt(0)?.toUpperCase() || "?";

  // canonical base paths - SME routes are at root level, CA routes under /ca
  const base = role === "CA" ? "/ca" : "";

  // default complete-profile paths if not provided via props
  const defaultCompletePath = role === "CA" ? "/ca/cacompleteprofile" : "/sme/smecompleteprofile";
  const resolvedCompletePath = completeProfilePath ?? defaultCompletePath;

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Close on Escape key and support keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Close menu when user navigates (so it doesn't stay open)
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  async function doLogout() {
    try {
      await fetch("/logout", { method: "POST", credentials: "include" });
    } catch (err) {
      // Log, but still navigate to login (best effort)
      console.error("Logout failed", err);
    } finally {
      // Navigate to role-specific login
      navigate(role === "CA" ? "/ca/login" : "/sme/login");
    }
  }

  // Helper to navigate and close menu
  function go(to: string) {
    setOpen(false);
    navigate(to);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open account menu"
        className="h-9 w-9 flex items-center justify-center rounded-full bg-indigo-600 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-300"
        title="Account"
      >
        {firstLetter}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded shadow-lg z-50 text-sm"
        >
          {/* Profile */}
          <button
            role="menuitem"
            onClick={() => go(resolvedCompletePath)}
            className="block w-full text-left px-4 py-2 hover:bg-slate-50"
          >
            Profile
          </button>

          {/* Complete Profile (only shown when flagged) */}
          {showCompleteProfile && (
            <button
              role="menuitem"
              onClick={() => go(resolvedCompletePath)}
              className="block w-full text-left px-4 py-2 hover:bg-slate-50 text-amber-700"
            >
              Complete profile
            </button>
          )}

          {/* Settings */}
          <button
            role="menuitem"
            onClick={() => go(`${base}/settings`)}
            className="block w-full text-left px-4 py-2 hover:bg-slate-50"
          >
            Settings
          </button>

          <div className="border-t border-slate-100" />

          {/* Logout */}
          <button
            role="menuitem"
            onClick={doLogout}
            className="block w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
