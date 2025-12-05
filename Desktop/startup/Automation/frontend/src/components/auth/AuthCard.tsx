// src/components/auth/AuthCard.tsx
import React, { useEffect, useRef, useState } from "react";

type Role = "SME" | "CA";
type Mode = "login" | "signup";
const OTP_LENGTH = 6;

type Props = {
  role: Role;
  onSuccess?: (token: string, user?: unknown) => void;
};

export default function AuthCard({ role, onSuccess }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  // signup fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [caRegNo, setCaRegNo] = useState("");

  // otp values
  const [otpValues, setOtpValues] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    let t: number | undefined;
    if (resendTimer > 0) {
      t = window.setInterval(() => {
        setResendTimer((s) => {
          if (s <= 1) {
            window.clearInterval(t);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (t) window.clearInterval(t);
    };
  }, [resendTimer]);

  const isPhoneValid = (p: string) => /^\d{6,15}$/.test(p.replace(/\D/g, ""));
  const purpose = () => (mode === "signup" ? "signup" : "login");

  async function sendOtp() {
    setError(null);
    setInfo(null);
    const numeric = phone.replace(/\D/g, "");
    if (!isPhoneValid(numeric)) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (mode === "signup") {
      if (!fullName.trim()) {
        setError("Full name is required.");
        return;
      }
      if (!company.trim()) {
        setError(role === "SME" ? "Company name is required." : "Firm name is required.");
        return;
      }
      if (role === "CA" && !caRegNo.trim()) {
        setError("CA registration number is required.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `${countryCode}${numeric}`, role, purpose: purpose() }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Unable to send OTP");
      }

      setOtpSent(true);
      setStep("otp");
      setInfo("OTP sent. It may take a few seconds to arrive.");
      setResendTimer(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 120);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpValues];
    next[idx] = val.slice(-1);
    setOtpValues(next);
    if (val && idx < OTP_LENGTH - 1) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Backspace" && !otpValues[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const collectOtp = () => otpValues.join("").trim();

  async function verifyOtp() {
    setError(null);
    const otp = collectOtp();
    if (otp.length !== OTP_LENGTH) {
      setError("Please enter the full OTP.");
      return;
    }
    setLoading(true);
    try {
      const numeric = phone.replace(/\D/g, "");
      const res = await fetch("/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: `${countryCode}${numeric}`,
          otp,
          role,
          purpose: purpose(),
          ...(mode === "signup"
            ? { fullName: fullName.trim(), company: company.trim(), email: email.trim(), caRegNo: caRegNo.trim() }
            : {}),
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "OTP verification failed");
      }
      const data = await res.json();
      if (onSuccess) onSuccess(data.token, data.user);
      setInfo("Success — signing you in...");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    if (!otpSent || resendTimer > 0) return;
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const numeric = phone.replace(/\D/g, "");
      const res = await fetch("/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `${countryCode}${numeric}`, role, purpose: purpose(), resend: true }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Unable to resend OTP");
      }
      setInfo("OTP resent. Check your messages.");
      setResendTimer(30);
      setOtpValues(Array(OTP_LENGTH).fill(""));
      setTimeout(() => otpRefs.current[0]?.focus(), 120);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  }

  const signInWithGoogle = () => {
    window.location.href = `/auth/google?role=${role.toLowerCase()}&purpose=${purpose()}`;
  };

  const resetToPhone = () => {
    setStep("phone");
    setOtpValues(Array(OTP_LENGTH).fill(""));
    setError(null);
    setInfo(null);
  };

  // compact card layout with responsive widths
  return (
    <div className="w-full">
      <div className="w-full bg-white rounded-2xl shadow p-4 sm:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-800">{role} Portal</h3>
              <p className="text-xs text-slate-500">{mode === "signup" ? "Create an account" : "Sign in to your account"}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMode("login")}
                className={`text-xs px-2 py-1 rounded-full ${mode === "login" ? "bg-slate-100 text-slate-800" : "text-slate-500"}`}
              >
                Sign in
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`text-xs px-2 py-1 rounded-full ${mode === "signup" ? "bg-slate-100 text-slate-800" : "text-slate-500"}`}
              >
                Create
              </button>
            </div>
          </div>

          <button
            onClick={signInWithGoogle}
            aria-label="Continue with Google"
            className="w-full flex items-center gap-3 justify-center border border-slate-200 rounded-md px-3 py-2 hover:shadow-sm transition mb-3 text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M21 12.3c0-.7-.1-1.4-.3-2H12v3.8h5.4c-.2 1-1 2.4-2.6 3.2v2.6h4.2c2.4-2.2 3.8-5.6 3.8-9.6z" fill="#4285F4" />
              <path d="M12 22c2.7 0 4.9-.9 6.6-2.6l-3.1-2.6c-.9.6-2 1-3.5 1-2.7 0-5-1.8-5.8-4.3H3.9v2.7C5.6 19.8 8.6 22 12 22z" fill="#34A853" />
              <path d="M6.2 13.5a6.7 6.7 0 010-4v-2.7H3.9A10 10 0 003 12c0 1.6.4 3.1 1.1 4.4l1.1-2.9z" fill="#FBBC05" />
              <path d="M12 6.5c1.4 0 2.7.5 3.6 1.5l2.7-2.7C16.9 3.4 14.7 2.5 12 2.5 8.6 2.5 5.6 4.7 3.9 7.8l2.3 2.7C7 8.3 9.3 6.5 12 6.5z" fill="#EA4335" />
            </svg>
            <span className="font-medium text-sm">Continue with Google</span>
          </button>

          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-slate-100" />
            <div className="text-xs text-slate-400">{mode === "signup" ? "or create using phone" : "or sign in with phone"}</div>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {error && <div className="mb-3 text-sm text-red-700 bg-red-50 px-3 py-2 rounded">{error}</div>}
          {info && <div className="mb-3 text-sm text-emerald-800 bg-emerald-50 px-3 py-2 rounded">{info}</div>}

          {/* Signup extra fields */}
          {mode === "signup" && step === "phone" && (
            <div className="space-y-2 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email (optional)</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">{role === "SME" ? "Company name" : "Firm name"}</label>
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={role === "SME" ? "ACME Pvt Ltd" : "Sharma & Co."}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                />
              </div>

              {role === "CA" && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">CA registration number</label>
                  <input
                    value={caRegNo}
                    onChange={(e) => setCaRegNo(e.target.value)}
                    placeholder="e.g. 12345"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                  />
                </div>
              )}
            </div>
          )}

          {/* Phone row */}
          {step === "phone" && (
            <div className="mb-3">
              <label className="block text-xs font-medium text-slate-700 mb-2">Phone</label>

              <div className="flex gap-2">
                <select
                  aria-label="Country code"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="h-10 rounded-md border px-2 bg-slate-50 text-sm"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+61">🇦🇺 +61</option>
                </select>

                <input
                  inputMode="tel"
                  type="tel"
                  aria-label="Phone number"
                  placeholder="987 654 3210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                />
              </div>

              <div className="mt-3 flex gap-2 items-center">
                <button
                  onClick={sendOtp}
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-60 transition text-sm"
                >
                  {loading ? "Sending..." : mode === "signup" ? "Send signup OTP" : "Get OTP"}
                </button>

                <button
                  onClick={resendOtp}
                  disabled={!otpSent || resendTimer > 0 || loading}
                  className="px-3 py-2 border rounded-md text-sm disabled:opacity-60"
                >
                  {resendTimer > 0 ? `Resend (${resendTimer}s)` : "Resend OTP"}
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-2">We will send a one-time code to your phone. Message & data rates may apply.</p>
            </div>
          )}

          {/* OTP step */}
          {step === "otp" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Enter OTP</label>
                  <p className="text-xs text-slate-400 mt-1">We sent a code to {countryCode} {phone}</p>
                </div>

                <button onClick={resetToPhone} className="text-xs text-slate-500 underline">Change</button>
              </div>

              <div className="flex gap-2 justify-center mb-3">
                {Array.from({ length: OTP_LENGTH }).map((_, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpRefs.current[idx] = el; }}
                    value={otpValues[idx]}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    inputMode="numeric"
                    maxLength={1}
                    className="w-10 h-10 text-center border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    aria-label={`OTP digit ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={verifyOtp}
                  disabled={loading}
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 disabled:opacity-60 transition text-sm"
                >
                  {loading ? "Verifying..." : mode === "signup" ? "Verify & Create account" : "Verify & Sign in"}
                </button>

                <button
                  onClick={resendOtp}
                  disabled={resendTimer > 0 || loading}
                  className="px-3 py-2 border rounded-md text-sm disabled:opacity-60"
                >
                  {resendTimer > 0 ? `Resend (${resendTimer}s)` : "Resend"}
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-2">Didn't receive the code? Try resending or contact support.</p>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-slate-400">
          <div>This portal is for <strong>{role}</strong> accounts.</div>
        </div>
      </div>
    </div>
  );
}
