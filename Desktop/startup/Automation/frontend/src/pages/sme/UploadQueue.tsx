// src/pages/sme/UploadQueue.tsx
import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

type UploadItem = {
  id: string;
  name: string;
  uploadedAt: string;
  status: "Processing" | "Queued" | "Done";
  preview?: string;
  size?: number;
};

export default function UploadQueue() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const navigate = useNavigate();

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const now = new Date();
    const newItems: UploadItem[] = Array.from(files).map((f, i) => ({
      id: `UP-${now.getTime().toString().slice(-6)}-${i}`,
      name: f.name,
      uploadedAt: now.toLocaleString(),
      status: "Processing",
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
      size: f.size,
    }));
    setItems((s) => [...newItems, ...s]);
  }, []);

  const onDrop: React.DragEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver: React.DragEventHandler = (e) => e.preventDefault();

  const removeItem = (id: string) => setItems((s) => s.filter((it) => it.id !== id));
  const markDone = (id: string) => setItems((s) => s.map((it) => (it.id === id ? { ...it, status: "Done" } : it)));
  const openInvoice = (id: string) => navigate(`/invoices/${encodeURIComponent(id)}`);

  const total = items.length;
  const processing = items.filter((i) => i.status === "Processing").length;
  const done = items.filter((i) => i.status === "Done").length;

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Upload Queue</h1>
          <div className="text-sm text-slate-500 mt-1">Manage uploads, monitor processing status and open generated invoices.</div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="px-3 py-2 rounded-md bg-white border border-slate-200 text-sm">Back to dashboard</button>
          <button onClick={() => window.location.reload()} className="px-3 py-2 rounded-md bg-sky-100 text-sky-700 text-sm">Refresh</button>
        </div>
      </div>

      <section onDrop={onDrop} onDragOver={onDragOver} className="mb-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <div className="text-sm text-slate-500 mb-2">Drop files to upload</div>
            <div className="border border-dashed rounded-lg p-6 text-center bg-slate-50">
              <div className="text-lg font-medium mb-2">Drop files here</div>
              <div className="text-sm text-slate-400 mb-4">Supports images & PDFs. Files are added to the queue and processed.</div>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="file" accept="image/*,application/pdf" multiple onChange={(e) => handleFiles(e.target.files)} className="hidden" />
                <span className="px-3 py-2 bg-indigo-600 text-white rounded text-sm">Select files</span>
              </label>
            </div>
          </div>

          <div className="w-full md:w-64">
            <div className="text-xs text-slate-500 mb-2">Quick stats</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-md text-center bg-slate-50">
                <div className="text-xs text-slate-500">Total</div>
                <div className="text-lg font-semibold mt-1">{total}</div>
              </div>
              <div className="p-3 rounded-md text-center bg-amber-50 text-amber-800">
                <div className="text-xs">Processing</div>
                <div className="text-lg font-semibold mt-1">{processing}</div>
              </div>
              <div className="p-3 rounded-md text-center bg-emerald-50 text-emerald-700">
                <div className="text-xs">Done</div>
                <div className="text-lg font-semibold mt-1">{done}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Uploads</h2>
          <div className="text-sm text-slate-500">{items.length} item(s)</div>
        </div>

        {items.length === 0 ? (
          <div className="text-sm text-slate-500 py-8 text-center">No uploads yet — drag files into the area above or click Select files.</div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-4 p-3 border rounded-md">
                <div className="w-20 h-14 flex items-center justify-center bg-slate-100 rounded overflow-hidden">
                  {it.preview ? <img src={it.preview} alt={`preview-${it.name}`} className="object-cover w-full h-full" /> : (
                    <div className="text-xs text-slate-500 px-2 text-center">
                      <svg className="w-6 h-6 mx-auto mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6"/></svg>
                      <div className="text-xs truncate max-w-16">{it.name.split(".").pop()?.toUpperCase() || "FILE"}</div>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-xs text-slate-400">{it.uploadedAt} • {it.size ? `${Math.round(it.size / 1024)} KB` : "—"}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${it.status === "Processing" ? "bg-amber-100 text-amber-800" : it.status === "Queued" ? "bg-slate-100 text-slate-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {it.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <button className="text-xs px-2 py-1 bg-indigo-600 text-white rounded" onClick={() => openInvoice(it.id)}>Open</button>
                    <button className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded" onClick={() => markDone(it.id)}>Mark done</button>
                    <button className="text-xs px-2 py-1 bg-white border border-slate-200 rounded" onClick={() => removeItem(it.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-slate-500">Tip: Files are kept in browser memory for demo. Integrate with your backend to persist and process.</div>
        <div className="flex items-center gap-3">
          <button onClick={() => setItems([])} className="px-3 py-2 text-sm rounded bg-white border border-slate-200">Clear all</button>
          <button onClick={() => navigate("/invoices")} className="px-3 py-2 text-sm rounded bg-indigo-600 text-white">Go to Invoices</button>
        </div>
      </div>
    </div>
  );
}
