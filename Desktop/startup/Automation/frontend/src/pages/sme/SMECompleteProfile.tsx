// src/pages/sme/SMECompleteProfile.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type MeResponse = {
  id: string;
  email: string;
  name?: string;
  role?: string;
  profile_complete?: boolean;
  verified?: boolean;
  phone?: string;
  companyName?: string;
  gstin?: string;
  address?: string;
};

export default function SMECompleteProfile() {
  const navigate = useNavigate();
  const [loadingMe, setLoadingMe] = useState(true);
  const [me, setMe] = useState<MeResponse | null>(null);

  // fields
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [gstin, setGstin] = useState("");
  const [address, setAddress] = useState("");

  // files
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // otp
  const [otp, setOtp] = useState("");
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [otpSentAt, setOtpSentAt] = useState<number | null>(null);
  const [phoneVerified, setPhoneVerified] = useState<boolean>(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // ui
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [needsVerification, setNeedsVerification] = useState<boolean | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const MAX_FILES = 5;
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];

  useEffect(() => {
    async function loadMe() {
      setLoadingMe(true);
      try {
        const res = await fetch("/me", { credentials: "include" });
        if (res.status === 401) {
          navigate("/sme/login");
          return;
        }
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to load user");
        }
        const data: MeResponse = await res.json();
        setMe(data);
        if (data.role !== "SME") {
          navigate("/sme/login");
          return;
        }
        if (data.profile_complete) {
          navigate("/sme/dashboard");
          return;
        }

        // prefill
        if (data.companyName) setCompanyName(data.companyName);
        if (data.name) setContactPerson(data.name);
        if (data.phone) setPhone(data.phone);
        if (data.gstin) setGstin(data.gstin);
        if (data.address) setAddress(data.address);
        if (data.verified) setPhoneVerified(Boolean(data.verified));
      } catch (err: unknown) {
        console.error("Could not load /me", err);
        setError("Unable to load profile.");
      } finally {
        setLoadingMe(false);
      }
    }
    loadMe();
  }, [navigate]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setFilePreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  // OTP helpers
  const OTP_TTL = 60;
  function secondsLeft(): number {
    if (!otpSentAt) return 0;
    const elapsed = Math.floor((Date.now() - otpSentAt) / 1000);
    return Math.max(0, OTP_TTL - elapsed);
  }

  async function sendOtp() {
    setError(null);
    setInfo(null);
    if (!phone.trim()) return setError("Enter phone to send OTP.");
    if (!/^\+?\d{7,15}$/.test(phone.replace(/\s+/g, ""))) return setError("Invalid phone format.");
    setOtpLoading(true);
    try {
      const res = await fetch("/send-otp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), purpose: "profile_verification" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to send OTP.");
      setTokenId(data.tokenId ?? null);
      setOtpSentAt(Date.now());
      setInfo("OTP sent to " + phone);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to send OTP.");
    } finally {
      setOtpLoading(false);
    }
  }

  async function verifyOtp() {
    setError(null);
    setInfo(null);
    if (!otp.trim()) return setError("Enter OTP.");
    setVerifyLoading(true);
    try {
      const res = await fetch("/verify-otp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), otp: otp.trim(), tokenId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "OTP verification failed.");
      if (data.verified) {
        setPhoneVerified(true);
        setInfo("Phone verified");
      } else {
        throw new Error(data?.message || "Invalid OTP");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP.");
    } finally {
      setVerifyLoading(false);
    }
  }

  // file handlers
  function handleFilesPicked(evt: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const picked = evt.target.files;
    if (!picked) return;
    const arr = Array.from(picked);
    if (arr.length + files.length > MAX_FILES) {
      setError(`Attach up to ${MAX_FILES} files total.`);
      return;
    }
    for (const f of arr) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        setError("Allowed file types: PDF, PNG, JPG.");
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        setError("Each file must be 10MB or less.");
        return;
      }
    }
    setFiles((prev) => [...prev, ...arr]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(i: number) {
    setFiles((p) => p.filter((_, idx) => idx !== i));
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const dt = e.dataTransfer;
    if (!dt.files || dt.files.length === 0) return;
    const arr = Array.from(dt.files);
    if (arr.length + files.length > MAX_FILES) {
      setError(`Attach up to ${MAX_FILES} files total.`);
      return;
    }
    for (const f of arr) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        setError("Allowed file types: PDF, PNG, JPG.");
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        setError("Each file must be 10MB or less.");
        return;
      }
    }
    setFiles((prev) => [...prev, ...arr]);
  }

  function validateForm(): string | null {
    if (!companyName.trim()) return "Company name is required.";
    if (!contactPerson.trim()) return "Contact person is required.";
    if (!phone.trim()) return "Phone is required.";
    if (!/^\+?\d{7,15}$/.test(phone.replace(/\s+/g, ""))) return "Invalid phone format.";
    if (gstin.trim() && !/^[0-9A-Z]{15}$/.test(gstin.replace(/\s+/g, "").toUpperCase())) return "GSTIN should be 15 characters.";
    if (!phoneVerified) return "Please verify your phone number before submitting.";
    return null;
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setInfo(null);
    const v = validateForm();
    if (v) return setError(v);

    const form = new FormData();
    form.append("companyName", companyName.trim());
    form.append("contactPerson", contactPerson.trim());
    form.append("phone", phone.trim());
    form.append("gstin", gstin.trim());
    form.append("address", address.trim());
    files.forEach((f) => form.append("documents", f));

    setUploading(true);
    setProgress(0);
    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/sme/profile/complete", true);
        xhr.withCredentials = true;

        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const resp = JSON.parse(xhr.responseText);
              setSubmitted(true);
              setNeedsVerification(Boolean(resp.needsVerification));
              setInfo(resp.message || "Profile submitted.");
              resolve();
            } catch {
              reject(new Error("Invalid server response"));
            }
          } else reject(new Error(xhr.responseText || "Upload failed"));
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(form);
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setUploading(false);
    }
  }

  if (loadingMe) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 sm:p-8 relative overflow-hidden">

          {/* Header + Status */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Complete your SME profile</h1>
              <p className="text-sm text-slate-600 mt-1">Complete company details and verify phone to unlock filings and payments.</p>
            </div>

            <div className="text-right flex items-center gap-3">
              <div className="text-xs text-slate-500">Status</div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${me?.verified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-800"}`}>
                {me?.verified ? "Verified" : "Not verified"}
              </div>
            </div>
          </div>

          {/* Close button inside card */}
          <button
            onClick={() => navigate("/sme/dashboard")}
            aria-label="Close"
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 text-xl font-bold transition-colors"
            title="Close"
          >
            ×
          </button>

          {me && <p className="text-sm text-slate-600 mb-4">Signed in as <strong>{me.email}</strong></p>}
          {error && <div className="bg-rose-50 text-rose-700 px-3 py-2 rounded mb-4 text-sm">{error}</div>}
          {info && <div className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded mb-4 text-sm">{info}</div>}

          {submitted ? (
            <div>
              <h3 className="font-medium text-sm">Profile Submitted</h3>
              <p className="text-sm text-slate-600 mt-2">{needsVerification ? "Your documents are under review." : "Profile completed."}</p>
              <div className="mt-4 flex gap-2 flex-wrap">
                <button onClick={() => navigate("/sme/dashboard")} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">Go to dashboard</button>
                <button onClick={() => { setSubmitted(false); setNeedsVerification(null); setInfo(null); }} className="px-4 py-2 border rounded-md hover:bg-slate-50 transition">Edit</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Company name *">
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ACME Pvt Ltd" className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
                </Field>

                <Field label="Contact person *">
                  <input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Full Name" className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
                </Field>

                {/* Phone + Send OTP - responsive */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone *</label>
                  <div className="flex flex-col md:flex-row md:items-start gap-3">
                    <input
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setPhoneVerified(false); }}
                      placeholder="+91 9876543210"
                      className="flex-1 px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
                      aria-label="Phone number"
                    />

                    <div className="flex gap-2 items-center">
                      <button
                        type="button"
                        onClick={sendOtp}
                        disabled={otpLoading || secondsLeft() > 0}
                        className="px-3 py-2 bg-slate-50 border rounded text-sm hover:bg-slate-100 transition disabled:opacity-60"
                      >
                        {otpLoading ? "Sending…" : (secondsLeft() > 0 ? `Resend (${secondsLeft()}s)` : "Send OTP")}
                      </button>
                    </div>
                  </div>

                  {/* OTP + Verify, responsive */}
                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
                    <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" className="px-3 py-2 border rounded-md text-sm w-full sm:w-48 focus:ring-2 focus:ring-indigo-100 outline-none" />
                    <button type="button" onClick={verifyOtp} disabled={verifyLoading || !otp} className={`px-3 py-2 rounded text-sm text-white ${phoneVerified ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"} transition disabled:opacity-60`}>
                      {verifyLoading ? "Verifying…" : (phoneVerified ? "Verified" : "Verify")}
                    </button>
                    {phoneVerified ? <div className="text-sm text-green-700">✓ Phone verified</div> : <div className="text-sm text-slate-500">Verify to continue</div>}
                  </div>
                </div>

                <Field label="GSTIN (optional)">
                  <input value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} placeholder="15-character GSTIN" className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-100 outline-none uppercase" />
                </Field>

                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Business address</label>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, City, State, PIN" className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
                </div>
              </div>

              {/* File upload */}
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Supporting documents (optional)</label>
                <div className="text-xs text-slate-500 mb-2">Upload business registration, PAN, GST registration. Max 10MB each.</div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  className={`border-dashed rounded-md p-4 transition-colors ${dragOver ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-slate-600">Drag & drop files, or <button type="button" onClick={() => fileInputRef.current?.click()} className="text-indigo-600 underline text-sm">browse</button></div>
                    <div>
                      <input ref={fileInputRef} type="file" multiple accept=".pdf,image/png,image/jpeg" className="hidden" onChange={handleFilesPicked} />
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-2 bg-slate-50 border rounded text-sm hover:bg-slate-100 transition">Attach files</button>
                    </div>
                  </div>

                  {filePreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                      {filePreviews.map((url, i) => (
                        <div key={i} className="relative border rounded-md overflow-hidden bg-slate-50">
                          <button type="button" onClick={() => removeFile(i)} className="absolute top-2 right-2 bg-white px-2 rounded shadow hover:bg-white/90 text-xs">✕</button>
                          <div className="p-3 text-xs text-slate-700">
                            {files[i].type === "application/pdf" ? (
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 2v20" /></svg>
                                <div className="truncate">{files[i].name}</div>
                              </div>
                            ) : (
                              <img src={url} alt={files[i].name} className="w-full h-28 object-cover" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <button type="submit" disabled={uploading} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50">
                  {uploading ? `Uploading… ${progress}%` : "Submit Profile"}
                </button>

                <button type="button" onClick={() => navigate("/sme/login")} className="px-4 py-2 border rounded-md hover:bg-slate-50 transition">Cancel</button>

                <div className="ml-auto text-xs text-slate-500">{files.length} file(s) attached</div>
              </div>
            </form>
          )}
        </div>

        <p className="mt-3 text-xs text-slate-500"><strong>Note:</strong> After submitting, documents may be reviewed. You will be notified by email about verification status.</p>
      </div>
    </div>
  );
}

/* Small field wrapper for consistent labels */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-700 mb-1 block">{label}</label>
      <div>{children}</div>
    </div>
  );
}
