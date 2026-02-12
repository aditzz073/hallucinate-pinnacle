import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Dashboard from "../../pages/Dashboard";
import AuditsPage from "../../pages/AuditsPage";
import AITestsPage from "../../pages/AITestsPage";
import MonitoringPage from "../../pages/MonitoringPage";
import ReportsPage from "../../pages/ReportsPage";
import AdvancedAuditPage from "../../pages/AdvancedAuditPage";
import SimulatorPage from "../../pages/SimulatorPage";
import CompetitorPage from "../../pages/CompetitorPage";
import ExecutiveSummaryPage from "../../pages/ExecutiveSummaryPage";

export default function Layout() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard onNavigate={setActivePage} />;
      case "audits":
        return <AuditsPage />;
      case "ai-tests":
        return <AITestsPage />;
      case "monitor":
        return <MonitoringPage />;
      case "changes":
        return <MonitoringPage />;
      case "reports":
        return <ReportsPage />;
      case "advanced":
        return <AdvancedAuditPage />;
      case "simulator":
        return <SimulatorPage />;
      case "compare":
        return <CompetitorPage />;
      case "executive":
        return <ExecutiveSummaryPage />;
      case "settings":
        return <PlaceholderPage title="Settings" desc="Account preferences coming soon." />;
      default:
        return <Dashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="flex-1 ml-64 p-8 lg:p-12" data-testid="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

function PlaceholderPage({ title, desc }) {
  return (
    <div className="max-w-4xl" data-testid={`page-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="mb-12">
        <h1 className="font-heading font-bold text-3xl tracking-tight mb-3">{title}</h1>
        <p className="text-muted-foreground text-sm max-w-lg">{desc}</p>
      </div>
    </div>
  );
}
