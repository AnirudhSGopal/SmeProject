// src/pages/sme/Returns.tsx

type ReturnRow = { id: string; period: string; status: string; due: string };

const demo: ReturnRow[] = [
  { id: "R-2025-11", period: "Nov 2025", status: "Draft", due: "2025-12-20" },
  { id: "R-2025-10", period: "Oct 2025", status: "Filed", due: "2025-11-20" },
];

export default function Returns() {
  const rows = demo;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Returns</h2>
      <div className="text-sm text-slate-500 mt-1">
        GST return periods, status, and due dates.
      </div>

      <div className="mt-6 bg-white border rounded-xl shadow-sm overflow-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
            <tr>
              <th className="p-3 text-left">Period</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Due Date</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t hover:bg-slate-50">
                <td className="p-3">{r.period}</td>
                <td className="p-3">{r.status}</td>
                <td className="p-3">{r.due}</td>
                <td className="p-3">
                  <button className="px-2 py-1 bg-indigo-600 text-white rounded text-xs">Open</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
