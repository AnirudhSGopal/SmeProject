// src/pages/ca/CASettings.tsx
import { useState } from "react";

export default function CASettings() {
  const [signature, setSignature] = useState("Best regards,\nCA Name");
  const [notifications, setNotifications] = useState(true);

  const save = () => {
    // placeholder: persist to API
    alert("Settings saved");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">CA Settings</h2>

      <div className="space-y-4 max-w-2xl">
        <div>
          <label className="text-xs text-slate-500">Display name</label>
          <input className="w-full border px-3 py-2 rounded mt-1" defaultValue="CA Firm - Anirudh" />
        </div>

        <div>
          <label className="text-xs text-slate-500">Signature</label>
          <textarea className="w-full border px-3 py-2 rounded mt-1" value={signature} onChange={(e)=>setSignature(e.target.value)} rows={4} />
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" checked={notifications} onChange={(e)=>setNotifications(e.target.checked)} />
          <div className="text-sm text-slate-600">Email notifications for client messages</div>
        </div>

        <div className="flex gap-2">
          <button className="py-2 px-4 bg-indigo-600 text-white rounded" onClick={save}>Save</button>
          <button className="py-2 px-4 bg-white border rounded" onClick={()=>{ setSignature("Best regards,\nCA Name"); setNotifications(true); }}>Reset</button>
        </div>
      </div>
    </div>
  );
}
