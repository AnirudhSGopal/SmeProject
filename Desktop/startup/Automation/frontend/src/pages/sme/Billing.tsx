// src/pages/sme/Billing.tsx

export default function Billing() {
  return (
    // Note: no fixed sidebar here — SMELayout provides it.
    // Keep md:ml-72 so the page lines up with the left nav.
    <main className="flex-1 p-6 md:ml-72">
      <h2 className="text-2xl font-semibold">Billing</h2>
      <div className="text-sm text-slate-500 mt-1">
        Manage payments, subscriptions, and billing history.
      </div>

      <div className="mt-6 bg-white border rounded-xl p-6 shadow-sm max-w-lg">
        <div className="text-xs text-slate-500">Current Balance</div>
        <div className="text-4xl font-semibold mt-2">₹0</div>

        <div className="mt-6 flex gap-3">
          <button className="px-4 py-2 bg-emerald-600 text-white rounded text-sm">
            Pay Now
          </button>
          <button className="px-4 py-2 bg-white border border-slate-200 rounded text-sm">
            Saved Methods
          </button>
        </div>

        <hr className="my-6" />

        <div>
          <div className="text-xs text-slate-500 mb-2">Quick Access</div>
          <div className="grid gap-3">
            <button className="px-3 py-2 bg-sky-100 text-sky-700 rounded text-sm">
              View Transactions
            </button>
            <button className="px-3 py-2 bg-white border border-slate-200 rounded text-sm">
              Download Invoice
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
