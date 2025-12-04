// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* SME pages */
import DashboardView from "./pages/sme/Dashboard";
import UploadQueue from "./pages/sme/UploadQueue";
import InvoicesList from "./pages/sme/InvoicesList";
import InvoiceDetail from "./pages/sme/InvoiceDetail";
import VendorsList from "./pages/sme/VendorsList";
import VendorDetail from "./pages/sme/VendorDetail";
import ChatList from "./pages/sme/ChatList";
import ChatThread from "./pages/sme/ChatThread";
import Returns from "./pages/sme/Returns";
import Reports from "./pages/sme/Reports";
import Billing from "./pages/sme/Billing";
import Transactions from "./pages/sme/Transactions";
import SearchResults from "./pages/sme/SearchResults";
import Settings from "./pages/Settings/Settings";

/* Layouts */
import SMELayout from "./layouts/SMELayout";
import CALayout from "./layouts/CALayout";

/* CA pages */
import CADashboard from "./pages/ca/CADashboard";
import CAClientList from "./pages/ca/ClientList";
import CAChatList from "./pages/ca/CAChatList";
import CAChatThread from "./pages/ca/CAChatThread";
import CASettings from "./pages/ca/CASettings";
import CAInvoiceReview from "./pages/ca/InvoiceReview";
import CAPayments from "./pages/ca/Payments";
import CAReports from "./pages/ca/Reports";
import CAReturnsWorkbench from "./pages/ca/ReturnsWorkbench";
import CAReviewQueue from "./pages/ca/ReviewQueue";
import CATasks from "./pages/ca/Tasks";

import "./index.css"; // Tailwind CSS

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* SME routes — layout wraps all SME pages */}
        <Route path="/" element={<SMELayout />}>
          <Route index element={<DashboardView />} />
          <Route path="dashboard" element={<DashboardView />} />
          <Route path="upload-queue" element={<UploadQueue />} />
          <Route path="invoices" element={<InvoicesList />} />
          <Route path="invoices/:id" element={<InvoiceDetail />} />
          <Route path="vendors" element={<VendorsList />} />
          <Route path="vendors/:id" element={<VendorDetail />} />
          <Route path="chat" element={<ChatList />} />
          <Route path="chat/:id" element={<ChatThread />} />
          <Route path="returns" element={<Returns />} />
          <Route path="reports" element={<Reports />} />
          <Route path="billing" element={<Billing />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* CA routes (nested under CALayout) */}
        <Route path="/ca" element={<CALayout />}>
          <Route index element={<CADashboard />} />
          <Route path="dashboard" element={<CADashboard />} />
          <Route path="clients" element={<CAClientList />} />
          <Route path="clients/:id" element={<CAClientList />} /> {/* replace with client detail when ready */}
          <Route path="chat" element={<CAChatList />} />
          <Route path="chat/:id" element={<CAChatThread />} />
          <Route path="invoice-review" element={<CAInvoiceReview />} />
          <Route path="review-queue" element={<CAReviewQueue />} />
          <Route path="returns" element={<CAReturnsWorkbench />} />
          <Route path="reports" element={<CAReports />} />
          <Route path="payments" element={<CAPayments />} />
          <Route path="tasks" element={<CATasks />} />
          <Route path="settings" element={<CASettings />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
