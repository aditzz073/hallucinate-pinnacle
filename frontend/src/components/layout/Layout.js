import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Dashboard from "../../pages/Dashboard";

export default function Layout() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "audits":
        return <PlaceholderPage title="Page Audits" desc="Analyze how AI engines interpret your pages." />;
      case "ai-tests":
        return <PlaceholderPage title="AI Citation Tests" desc="Test whether AI engines cite your content." />;
      case "monitor":
        return <PlaceholderPage title="Monitoring" desc="Track changes to your monitored pages over time." />;
      case "changes":
        return <PlaceholderPage title="Change Log" desc="View detected signal changes and their impact." />;
      case "settings":
        return <PlaceholderPage title="Settings" desc="Manage your account preferences." />;
      default:
        return <Dashboard />;
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
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Coming Soon</p>
        <h1 className="font-heading font-bold text-3xl tracking-tight mb-3">{title}</h1>
        <p className="text-muted-foreground text-sm max-w-lg">{desc}</p>
      </div>
      <div className="border border-dashed border-border rounded-lg p-16 flex flex-col items-center justify-center text-center">
        <div className="w-48 h-48 rounded-lg overflow-hidden mb-8 opacity-60">
          <img
            src="https://images.unsplash.com/photo-1737505599162-d9932323a889?crop=entropy&cs=srgb&fm=jpg&q=85&w=400"
            alt="Coming Soon"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-muted-foreground text-sm">This feature will be available in an upcoming phase.</p>
      </div>
    </div>
  );
}
