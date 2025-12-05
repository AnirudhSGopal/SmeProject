// src/pages/ca/CACompleteProfile.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * CACompleteProfile (improved)
 * - Phone verification via OTP (POST /send-otp, POST /verify-otp)
 * - File upload (drag/drop + browse), previews, remove
 * - Submit to /ca/profile/complete (multipart/form-data)
 *
 * Backend endpoints expected (adjust names if different):
 * - POST /send-otp  { phone } -> { ok:true, tokenId?: string }
 * - POST /verify-otp { phone, otp, tokenId? } -> { ok:true, verified: true }
 * - POST /ca/profile/complete multipart/form-data -> { ok:true, needsVerification:boolean, message? }
 */

type MeResponse = {
  id: string;
  email: string;
  name?: string;
  role?: string;
  profile_complete?: boolean;
  verified?: boolean;
  phone?: string;
  firmName?: string;
  caRegNo?: string;
  address?: string;
  experienceYears?: number;
  gstin?: string;
};

export default function CACompleteProfile() {
  const navigate = useNavigate();
  const [loadingMe, setLoadingMe] = useState(true);
  const [me, setMe] = useState<MeResponse | null>(null);

  // form
  const [firmName, setFirmName] = useState("");
  const [caRegNo, setCaRegNo] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [experienceYears, setExperienceYears] = useState<number | "">("");
  const [gstin, setGstin] = useState("");

  // files
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // phone verification
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
  const [progress, setProgress] = useState<number>(0);
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
          navigate("/ca/login");
          return;
        }
        if (!res.ok) throw new Error(await res.text());
        const data: MeResponse = await res.json();
        setMe(data);

        if (data.role !== "CA") {
          navigate("/ca/login");
          return;
        }
        if (data.profile_complete) {
          navigate("/ca", { replace: true });
          return;
        }

        // prefill
        if (data.firmName) setFirmName(data.firmName);
        if (data.caRegNo) setCaRegNo(data.caRegNo);
        if (data.phone) setPhone(data.phone);
        if (data.address) setAddress(data.address);
        if (typeof data.experienceYears === "number") setExperienceYears(data.experienceYears);
        if (data.gstin) setGstin(data.gstin);
      } catch (err: unknown) {
        console.error("Could not load /me", err);
        setError("Unable to load profile data. Please sign in again.");
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

  // ---------------- OTP helpers ----------------
  const OTP_TTL = 60; // seconds

  function secondsLeft(): number {
    if (!otpSentAt) return 0;
    const elapsed = Math.floor((Date.now() - otpSentAt) / 1000);
    return Math.max(0, OTP_TTL - elapsed);
  }

  async function sendOtp() {
    setError(null);
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

  // -------------- file handling ---------------
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

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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

  // ------------- form validation + submission -------------
  function validateForm(): string | null {
    if (!firmName.trim()) return "Firm name is required.";
    if (!caRegNo.trim()) return "CA registration number is required.";
    if (!phone.trim()) return "Phone is required.";
    if (!/^[A-Za-z0-9-/\s]{3,30}$/.test(caRegNo.trim())) return "Enter a valid CA registration number.";
    if (!/^\+?\d{7,15}$/.test(phone.replace(/\s+/g, ""))) return "Enter a valid phone number including country code if needed.";
    if (files.length === 0) return "Please upload at least one supporting document (certificate or registration).";
    if (typeof experienceYears === "number" && (experienceYears < 0 || experienceYears > 80)) return "Enter valid years of practice.";
    if (gstin && !/^[0-9A-Z]{15}$/.test(gstin.replace(/\s+/g, "").toUpperCase())) return "GSTIN should be 15 characters (if provided).";
    if (!phoneVerified) return "Please verify your phone number with OTP before submitting.";
    return null;
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setInfo(null);
    const v = validateForm();
    if (v) {
      setError(v);
      return;
    }

    const form = new FormData();
    form.append("firmName", firmName.trim());
    form.append("caRegNo", caRegNo.trim());
    form.append("phone", phone.trim());
    form.append("address", address.trim());
    if (typeof experienceYears === "number") form.append("experienceYears", String(experienceYears));
    if (gstin) form.append("gstin", gstin.trim().toUpperCase());
    files.forEach((f) => form.append("documents", f));

    setUploading(true);
    setProgress(0);
    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/ca/profile/complete", true);
        xhr.withCredentials = true;

        xhr.upload.onprogress = function (ev) {
          if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
        };

        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const resp = JSON.parse(xhr.responseText);
              setSubmitted(true);
              setNeedsVerification(Boolean(resp.needsVerification));
              setInfo(resp.message || "Profile submitted successfully.");
              resolve();
            } catch {
              reject(new Error("Invalid response from server"));
            }
          } else {
            reject(new Error(xhr.responseText || "Upload failed"));
          }
        };

        xhr.onerror = function () {
          reject(new Error("Network error"));
        };

        xhr.send(form);
      });
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to submit profile.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  // ----------------- render -----------------
  if (loadingMe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-600">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-800">Complete your CA profile</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Provide firm details and supporting documents so you can perform filings and approvals.
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-500">Status</div>
                <div className={`mt-1 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${me?.verified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-800"}`}>
                  {me?.verified ? "Verified" : "Not verified"}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 relative">
            {/* Close button inside card (top-right) */}
            <button
              onClick={() => navigate("/ca")}
              aria-label="Close"
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 text-xl font-bold"
            >
              ×
            </button>

            {error && <div className="mb-4 rounded-md bg-rose-50 border border-rose-100 text-rose-700 px-4 py-2 text-sm">{error}</div>}
            {info && <div className="mb-4 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-2 text-sm">{info}</div>}

            {submitted ? (
              <div className="space-y-4">
                <div className="text-sm text-slate-700">
                  <strong>Submission received.</strong> {needsVerification ? "Documents are under review." : "Profile marked complete."}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate("/ca")} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm">Go to dashboard</button>
                  <button onClick={() => { setSubmitted(false); setNeedsVerification(null); setInfo(null); }} className="px-4 py-2 border rounded-md text-sm">Edit details</button>
                </div>
                <div className="text-xs text-slate-500">We'll email you when verification completes. Typical turnaround: 24–48 hours.</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Firm name *" value={firmName} onChange={setFirmName} placeholder="Sharma & Co." help="Your registered firm name." />
                  <Field label="CA registration number *" value={caRegNo} onChange={setCaRegNo} placeholder="Registration number" help="As issued by the institute/authority." />

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Phone *</label>
                    <div className="flex gap-2 items-center">
                      <input value={phone} onChange={(e) => { setPhone(e.target.value); setPhoneVerified(false); }} placeholder="+91 9876543210" className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-100" />
                      <button type="button" onClick={sendOtp} disabled={otpLoading || secondsLeft() > 0} className="px-3 py-2 bg-slate-50 border rounded text-sm">
                        {otpLoading ? "Sending…" : (secondsLeft() > 0 ? `Resend (${secondsLeft()}s)` : "Send OTP")}
                      </button>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Include country code. You will receive an OTP to verify this number.</div>

                    <div className="mt-3 flex items-center gap-2">
                      <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" className="px-3 py-2 border rounded-md text-sm w-40" />
                      <button type="button" onClick={verifyOtp} disabled={verifyLoading || !otp} className="px-3 py-2 bg-indigo-600 text-white rounded text-sm">
                        {verifyLoading ? "Verifying…" : (phoneVerified ? "Verified" : "Verify")}
                      </button>
                      {phoneVerified && <div className="text-sm text-green-700">✓ Verified</div>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Years of practice</label>
                    <input value={experienceYears} onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") setExperienceYears("");
                      else setExperienceYears(Number(v));
                    }} type="number" min={0} max={80} className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100" placeholder="e.g. 8" />
                    <div className="text-xs text-slate-400 mt-1">Optional — helps client matching.</div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Office address</label>
                    <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100" placeholder="Street, City, State, PIN" />
                    <div className="text-xs text-slate-400 mt-1">Optional but helpful for location-based matching.</div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">GSTIN (optional)</label>
                    <input value={gstin} onChange={(e) => setGstin(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100" placeholder="15-character GSTIN" />
                    <div className="text-xs text-slate-400 mt-1">Only if your firm is GST registered.</div>
                  </div>
                </div>

                {/* File uploader */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Supporting documents *</label>

                  <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={onDrop}
                    className={`border-dashed rounded-md p-4 transition-colors ${dragOver ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white"}`}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm text-slate-600">Drag & drop files, or <button type="button" onClick={() => fileInputRef.current?.click()} className="text-indigo-600 underline text-sm">browse</button></div>
                        <div className="text-xs text-slate-400 mt-1">PDF, PNG, JPG — max 10MB each. Up to {MAX_FILES} files.</div>
                      </div>

                      <div>
                        <input ref={fileInputRef} type="file" multiple accept=".pdf,image/png,image/jpeg" className="hidden" onChange={handleFilesPicked} />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-2 bg-slate-50 border rounded text-sm">Attach files</button>
                      </div>
                    </div>

                    {filePreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        {filePreviews.map((url, i) => (
                          <div key={i} className="relative border rounded-md overflow-hidden bg-slate-50">
                            <div className="absolute top-2 right-2">
                              <button type="button" onClick={() => removeFile(i)} className="bg-white/90 px-1 rounded text-xs hover:bg-white" title="Remove">✕</button>
                            </div>
                            <div className="p-3 text-xs text-slate-700">
                              {files[i].type === "application/pdf" ? (
                                <div className="flex items-center gap-2"><svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 2v20" /></svg><div className="truncate">{files[i].name}</div></div>
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

                {/* actions */}
                <div className="flex items-center gap-3">
                  <button type="submit" disabled={uploading} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-60">
                    {uploading ? (<><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>Uploading...</>) : "Submit profile"}
                  </button>

                  <button type="button" onClick={() => navigate("/ca/login")} className="px-3 py-2 border rounded-md text-sm">Cancel</button>

                  <div className="ml-auto text-xs text-slate-500">
                    {uploading ? `${progress}% uploaded` : `${files.length} file(s) attached`}
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-500">
          <strong>Privacy & verification:</strong> Documents are used to verify your CA status. We store them securely and only share with authorised internal reviewers.
        </div>
      </div>
    </div>
  );
}

/* small helper input */
function Field({ label, value, onChange, placeholder, help }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; help?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-100" />
      {help && <div className="text-xs text-slate-400 mt-1">{help}</div>}
    </div>
  );
}
