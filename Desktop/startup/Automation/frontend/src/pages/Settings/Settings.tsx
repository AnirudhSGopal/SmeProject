// src/pages/sme/Settings.tsx
import { useState } from "react";
import { Link } from "react-router-dom";

type SettingsState = {
  displayName: string;
  email: string;
  companyName: string;
  gstin: string;
  timezone: string;
  notifications: { email: boolean; sms: boolean; push: boolean; };
  theme: "light" | "dark";
};

const initial: SettingsState = {
  displayName: "Anirudh",
  email: "you@example.com",
  companyName: "Anirudh Textiles",
  gstin: "27ABCDE1234F1Z5",
  timezone: "Asia/Kolkata",
  notifications: { email: true, sms: false, push: true },
  theme: "light",
};

export default function Settings() {
  const [s, setS] = useState<SettingsState>(initial);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setS((prev) => ({ ...prev, [key]: value }));
  }

  function updateNotif<K extends keyof SettingsState["notifications"]>(key: K, value: boolean) {
    setS((prev) => ({ ...prev, notifications: { ...prev.notifications, [key]: value } }));
  }

  function validate(): string | null {
    if (!s.displayName.trim()) return "Display name is required.";
    if (!s.email.includes("@")) return "Enter a valid email.";
    return null;
  }

  async function handleSave() {
    const err = validate();
    if (err) { setSavedMsg(err); return; }
    setSaving(true); setSavedMsg(null);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false); setSavedMsg("Settings saved.");
    setTimeout(() => setSavedMsg(null), 3000);
  }

  return (
    <main className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <div className="text-sm text-slate-500 mt-1">Manage account, company and notification preferences.</div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => { setS(initial); setSavedMsg("Changes reverted."); setTimeout(() => setSavedMsg(null), 2000); }} className="px-3 py-2 rounded bg-white border border-slate-200 text-sm">Revert</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded bg-indigo-600 text-white text-sm">{saving ? "Saving..." : "Save changes"}</button>
        </div>
      </div>

      {savedMsg && <div className="mb-4 p-3 rounded text-sm bg-white border text-slate-700">{savedMsg}</div>}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Account</h3>
          <label className="block text-sm mb-2"><div className="text-xs text-slate-500 mb-1">Display name</div><input value={s.displayName} onChange={(e) => update("displayName", e.target.value)} className="w-full px-3 py-2 border rounded-md outline-none" /></label>
          <label className="block text-sm mb-2"><div className="text-xs text-slate-500 mb-1">Email</div><input value={s.email} onChange={(e) => update("email", e.target.value)} className="w-full px-3 py-2 border rounded-md outline-none" /></label>
          <label className="block text-sm mb-2"><div className="text-xs text-slate-500 mb-1">Timezone</div><input value={s.timezone} onChange={(e) => update("timezone", e.target.value)} className="w-full px-3 py-2 border rounded-md outline-none" /></label>
        </section>

        <section className="bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Company</h3>
          <label className="block text-sm mb-2"><div className="text-xs text-slate-500 mb-1">Company name</div><input value={s.companyName} onChange={(e) => update("companyName", e.target.value)} className="w-full px-3 py-2 border rounded-md outline-none" /></label>
          <label className="block text-sm mb-2"><div className="text-xs text-slate-500 mb-1">GSTIN</div><input value={s.gstin} onChange={(e) => update("gstin", e.target.value)} className="w-full px-3 py-2 border rounded-md outline-none" /></label>
          <div className="mt-3 text-sm text-slate-500">Billing</div>
          <div className="mt-2 flex gap-2">
            <Link to="/billing" className="px-3 py-2 bg-sky-100 text-sky-700 rounded text-sm">Manage billing</Link>
            <Link to="/transactions" className="px-3 py-2 bg-white border rounded text-sm">Transactions</Link>
          </div>
        </section>

        <section className="bg-white border rounded-xl p-5 shadow-sm md:col-span-2">
          <h3 className="text-lg font-semibold mb-3">Notifications</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <Toggle label="Email notifications" checked={s.notifications.email} onChange={(v) => updateNotif("email", v)} />
            <Toggle label="SMS notifications" checked={s.notifications.sms} onChange={(v) => updateNotif("sms", v)} />
            <Toggle label="Push notifications" checked={s.notifications.push} onChange={(v) => updateNotif("push", v)} />
          </div>
        </section>

        <section className="bg-white border rounded-xl p-5 shadow-sm md:col-span-2">
          <h3 className="text-lg font-semibold mb-3">Appearance</h3>
          <div className="flex items-center gap-3">
            <button className={`px-3 py-2 rounded ${s.theme === "light" ? "bg-indigo-50 text-indigo-700" : "bg-white border"}`} onClick={() => update("theme", "light")}>Light</button>
            <button className={`px-3 py-2 rounded ${s.theme === "dark" ? "bg-indigo-50 text-indigo-700" : "bg-white border"}`} onClick={() => update("theme", "dark")}>Dark</button>
            <div className="text-sm text-slate-500 ml-4">Theme selection is a mock — implement persistence & CSS switch as needed.</div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* Toggle */
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void; }) {
  return (
    <label className="flex items-center gap-3 p-2 border rounded-md">
      <div className="flex-1 text-sm">{label}</div>
      <div role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`w-11 h-6 rounded-full p-0.5 flex items-center cursor-pointer ${checked ? "bg-indigo-600" : "bg-slate-200"}`}>
        <div className={`bg-white w-4 h-4 rounded-full transform ${checked ? "translate-x-5" : "translate-x-0"} transition`} />
      </div>
    </label>
  );
}
