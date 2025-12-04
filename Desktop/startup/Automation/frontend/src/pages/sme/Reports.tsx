// src/pages/sme/Reports.tsx

export default function Reports() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Reports</h2>
      <div className="text-sm text-slate-500 mt-1">
        Monthly summaries, analytics, and vendor insights.
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="text-xs text-slate-500">Monthly GST</div>
          <div className="text-3xl font-semibold mt-2">₹ 12,345</div>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="text-xs text-slate-500">Top Vendors</div>
          <ul className="mt-3 text-sm leading-6">
            <li>Siddhi Suppliers — ₹152,400</li>
            <li>Global Food Traders — ₹200,000</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
