// src/pages/ca/Reports.tsx

export default function CAReports() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Reports</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded p-4">
          <div className="text-sm font-medium">Monthly GST summary</div>
          <div className="mt-2 text-xs text-slate-500">Prepared: 01/12/2025</div>
        </div>

        <div className="bg-white border rounded p-4">
          <div className="text-sm font-medium">ITC Reconciliation</div>
          <div className="mt-2 text-xs text-slate-500">Clients: 24</div>
        </div>

        <div className="bg-white border rounded p-4">
          <div className="text-sm font-medium">Aged Payables</div>
          <div className="mt-2 text-xs text-slate-500">Items: 12</div>
        </div>
      </div>

      <div className="mt-6 bg-white border rounded p-4">
        <div className="flex items-center justify-between">
          <div className="font-medium">Reports generator</div>
          <button className="py-2 px-3 bg-indigo-600 text-white rounded">Download CSV</button>
        </div>
        <div className="mt-3 text-sm text-slate-600">Select clients, date range and generate consolidated reports for filings and audit support.</div>
      </div>
    </div>
  );
}
