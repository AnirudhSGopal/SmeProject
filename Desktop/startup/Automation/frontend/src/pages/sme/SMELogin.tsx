// src/pages/sme/SMELogin.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../../components/auth/AuthCard";

export default function SMELogin() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role === "SME") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleSuccess = (token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", "SME");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="w-full py-3 px-5 bg-white/60 border-b border-slate-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">A</div>
            <div>
              <div className="text-sm font-semibold">Automation</div>
              <div className="text-xs text-slate-400">SME · CA Portal</div>
            </div>
          </div>
          <nav>
            <a className="text-sm text-indigo-600" href="#" onClick={(e) => e.preventDefault()}>
              Support
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* marketing block: show at md and up; reduced height */}
          <div
            className="hidden md:flex flex-col justify-center rounded-2xl p-8 shadow-lg"
            style={{
              background:
                "linear-gradient(135deg, rgba(59,130,246,0.95) 0%, rgba(16,185,129,0.95) 60%, rgba(99,102,241,0.95) 100%)",
              color: "white",
              minHeight: 320,
            }}
          >
            <h2 className="text-2xl md:text-3xl font-extrabold leading-tight mb-2">{/* adaptive heading */}Welcome back</h2>
            <p className="text-sm text-slate-100/90 mb-4 max-w-xs">
              Sign in to access invoices, tasks and reporting. Fast, secure OTP login and Google OAuth available.
            </p>
            <ul className="space-y-2 mt-auto text-sm">
              <li>Fast OTP login</li>
              <li>Role-based dashboards</li>
              <li>Secure tokens & sessions</li>
            </ul>
          </div>

          {/* auth card container: narrower now */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-sm sm:max-w-md">
              <AuthCard role="SME" onSuccess={handleSuccess} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
