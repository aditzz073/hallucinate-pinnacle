import React, { useState, useEffect } from "react";
import { addMonitor, listMonitors, refreshMonitor, getPageChanges, deleteMonitor } from "../api";
import { ImpactBadge } from "../components/ui/Badges";
import { Eye, Plus, RefreshCw, Trash2, Loader2, ExternalLink, Activity } from "lucide-react";

export default function MonitoringPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState([]);
  const [error, setError] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [expandedPage, setExpandedPage] = useState(null);
  const [changes, setChanges] = useState({});
  const [refreshingId, setRefreshingId] = useState(null);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const data = await listMonitors();
      setPages(data);
    } catch (e) { /* ignore */ }
    setListLoading(false);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setError("");
    setLoading(true);
    try {
      await addMonitor(url.trim());
      setUrl("");
      loadPages();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add monitor");
    }
    setLoading(false);
  };

  const handleRefresh = async (pageId) => {
    setRefreshingId(pageId);
    try {
      const result = await refreshMonitor(pageId);
      loadPages();
      if (expandedPage === pageId) {
        loadChanges(pageId);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Refresh failed");
    }
    setRefreshingId(null);
  };

  const handleDelete = async (pageId) => {
    try {
      await deleteMonitor(pageId);
      loadPages();
      if (expandedPage === pageId) setExpandedPage(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Delete failed");
    }
  };

  const loadChanges = async (pageId) => {
    try {
      const data = await getPageChanges(pageId);
      setChanges((prev) => ({ ...prev, [pageId]: data }));
    } catch (e) { /* ignore */ }
  };

  const toggleExpand = (pageId) => {
    if (expandedPage === pageId) {
      setExpandedPage(null);
    } else {
      setExpandedPage(pageId);
      if (!changes[pageId]) loadChanges(pageId);
    }
  };

  return (
    <div className="max-w-6xl" data-testid="monitoring-page">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Phase 3</p>
        <h1 className="font-heading font-bold text-3xl tracking-tight mb-2">Page Monitoring</h1>
        <p className="text-muted-foreground text-sm">Track pages over time and detect signal changes.</p>
      </div>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="flex gap-3 mb-8" data-testid="monitor-form">
        <input
          data-testid="monitor-url-input"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/page"
          className="flex-1 h-12 rounded-md border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors duration-200"
          required
        />
        <button
          data-testid="monitor-submit-button"
          type="submit"
          disabled={loading}
          className="h-12 px-6 bg-primary text-primary-foreground font-medium rounded-sm flex items-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-[0_0_15px_rgba(79,70,229,0.2)] disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {loading ? "Adding..." : "Add Page"}
        </button>
      </form>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-md mb-6" data-testid="monitor-error">
          {error}
        </div>
      )}

      {/* Monitored Pages */}
      {listLoading ? (
        <div className="text-muted-foreground text-sm">Loading...</div>
      ) : pages.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-12 text-center">
          <Eye className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No monitored pages yet. Add a URL above to start tracking.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <div key={page.id} className="bg-card border border-border rounded-lg overflow-hidden" data-testid={`monitored-page-${page.id}`}>
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Eye className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-primary flex items-center gap-1 transition-colors duration-200">
                      <span className="truncate max-w-md">{page.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                    <p className="text-xs text-muted-foreground font-mono">
                      Added: {new Date(page.created_at).toLocaleDateString()} | Last snapshot: {page.last_snapshot_at ? new Date(page.last_snapshot_at).toLocaleString() : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleExpand(page.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md hover:bg-accent transition-colors duration-200"
                    data-testid={`view-changes-${page.id}`}
                  >
                    <Activity className="w-3 h-3" />
                    {page.total_changes} changes
                  </button>
                  <button
                    onClick={() => handleRefresh(page.id)}
                    disabled={refreshingId === page.id}
                    className="p-2 rounded-md hover:bg-accent transition-colors duration-200 disabled:opacity-50"
                    data-testid={`refresh-${page.id}`}
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshingId === page.id ? "animate-spin" : ""}`} />
                  </button>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="p-2 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                    data-testid={`delete-${page.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded: Change Log */}
              {expandedPage === page.id && (
                <div className="border-t border-border px-5 py-4 bg-muted/30">
                  <h3 className="text-sm font-medium mb-3">Change Log</h3>
                  {!changes[page.id] ? (
                    <p className="text-xs text-muted-foreground">Loading changes...</p>
                  ) : changes[page.id].length === 0 ? (
                    <p className="text-xs text-muted-foreground">No changes detected yet. Refresh the snapshot to check for changes.</p>
                  ) : (
                    <div className="space-y-2">
                      {changes[page.id].map((change, i) => (
                        <div key={i} className="flex items-center gap-4 bg-card border border-border rounded-md px-4 py-3 text-xs" data-testid={`change-${i}`}>
                          <ImpactBadge impact={change.impact} />
                          <span className="font-mono text-muted-foreground w-36">{change.signal_name}</span>
                          <span className="text-muted-foreground">{change.previous_value}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span className="text-foreground">{change.current_value}</span>
                          <span className="ml-auto text-muted-foreground/50 font-mono">{new Date(change.detected_at).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
