import React, { useState, useEffect } from "react";
import { addMonitor, listMonitors, refreshMonitor, getPageChanges, deleteMonitor } from "../api";
import { Eye, Plus, RefreshCw, Trash2, Loader2, ExternalLink, Activity, ArrowRight } from "lucide-react";

const toTitleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());

const deriveBrandFromUrl = (rawUrl) => {
  if (!rawUrl) return "Unknown";
  try {
    const normalized = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    const hostname = new URL(normalized).hostname.replace(/^www\./i, "");
    const root = hostname.split(".")[0] || hostname;
    return toTitleCase(root.replace(/[-_]+/g, " "));
  } catch {
    return "Unknown";
  }
};

const getRecordBrand = (record) => {
  const explicitBrand =
    record?.brand ||
    record?.brand_name ||
    record?.brandName ||
    record?.domain_brand;

  if (explicitBrand && String(explicitBrand).trim()) {
    return String(explicitBrand).trim();
  }
  return deriveBrandFromUrl(record?.url);
};

export default function MonitoringPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState([]);
  const [error, setError] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [expandedPage, setExpandedPage] = useState(null);
  const [changes, setChanges] = useState({});
  const [refreshingId, setRefreshingId] = useState(null);
  const [refreshingAll, setRefreshingAll] = useState(false);

  useEffect(() => { loadPages(); }, []);
  const loadPages = async () => { try { setPages(await listMonitors()); } catch {} setListLoading(false); };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setError("");
    setLoading(true);
    try { await addMonitor(url.trim()); setUrl(""); loadPages(); }
    catch (err) { setError(err.response?.data?.detail || "Failed to add monitor"); }
    setLoading(false);
  };

  const handleRefresh = async (pageId) => {
    setRefreshingId(pageId);
    try { await refreshMonitor(pageId); loadPages(); if (expandedPage === pageId) loadChanges(pageId); }
    catch (err) { setError(err.response?.data?.detail || "Refresh failed"); }
    setRefreshingId(null);
  };

  const handleRefreshAll = async () => {
    if (!pages.length) return;
    setError("");
    setRefreshingAll(true);

    const results = await Promise.allSettled(pages.map((page) => refreshMonitor(page.id)));
    const failedCount = results.filter((r) => r.status === "rejected").length;

    await loadPages();
    if (expandedPage) loadChanges(expandedPage);

    if (failedCount > 0) {
      setError(`Refresh completed with ${failedCount} failure${failedCount === 1 ? "" : "s"}.`);
    }
    setRefreshingAll(false);
  };

  const handleDelete = async (pageId) => {
    try { await deleteMonitor(pageId); loadPages(); if (expandedPage === pageId) setExpandedPage(null); }
    catch (err) { setError(err.response?.data?.detail || "Delete failed"); }
  };

  const loadChanges = async (pageId) => {
    try { const data = await getPageChanges(pageId); setChanges((p) => ({ ...p, [pageId]: data })); } catch {}
  };

  const toggleExpand = (pageId) => {
    if (expandedPage === pageId) { setExpandedPage(null); } else { setExpandedPage(pageId); if (!changes[pageId]) loadChanges(pageId); }
  };

  return (
    <div className="space-y-10" data-testid="monitoring-page">
      <div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">Monitor <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Pages</span></h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Track pages over time and detect signal changes.</p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-3" data-testid="monitor-form">
        <input data-testid="monitor-url-input" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/page" className="glass-input flex-1 h-12 px-4 text-sm" required />
        <button data-testid="monitor-submit-button" type="submit" disabled={loading} className="btn-primary h-12 px-6 rounded-xl flex items-center gap-2 disabled:opacity-50 shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {loading ? "Adding..." : "Add Page"}
        </button>
        <button
          type="button"
          onClick={handleRefreshAll}
          disabled={listLoading || pages.length === 0 || refreshingAll}
          className="h-12 px-5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-2 disabled:opacity-50 shrink-0"
          data-testid="monitor-refresh-all"
        >
          <RefreshCw className={`w-4 h-4 ${refreshingAll ? "animate-spin" : ""}`} />
          {refreshingAll ? "Refreshing..." : "Refresh All"}
        </button>
      </form>

      {error && <div className="rounded-xl bg-red-400/10 border border-red-400/20 px-4 py-3 text-sm text-red-400" data-testid="monitor-error">{error}</div>}

      {listLoading ? <p className="text-sm text-gray-500">Loading...</p> : pages.length === 0 ? (
        <div className="glass-card flex flex-col items-center py-16 text-center"><Eye className="w-8 h-8 text-gray-600 mb-3" /><p className="text-sm text-gray-500">No monitored pages yet.</p></div>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <div key={page.id} className="glass-card overflow-hidden" data-testid={`monitored-page-${page.id}`}>
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Eye className="w-4 h-4 text-brand-blue shrink-0" />
                  <div className="min-w-0">
                    <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-white hover:text-brand-blue flex items-center gap-1 transition-colors"><span className="truncate max-w-md">{page.url}</span><ExternalLink className="w-3 h-3 shrink-0" /></a>
                    <p className="text-xs text-gray-500">Brand: {getRecordBrand(page)} | Added: {new Date(page.created_at).toLocaleDateString()} | Last: {page.last_snapshot_at ? new Date(page.last_snapshot_at).toLocaleString() : "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleExpand(page.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg text-gray-400 hover:bg-white/5 transition-colors" data-testid={`view-changes-${page.id}`}><Activity className="w-3 h-3" />{page.total_changes} changes</button>
                  <button onClick={() => handleRefresh(page.id)} disabled={refreshingId === page.id || refreshingAll} className="p-2 rounded-lg text-gray-400 hover:bg-white/5 transition-colors disabled:opacity-50" data-testid={`refresh-${page.id}`}><RefreshCw className={`w-4 h-4 ${refreshingId === page.id ? "animate-spin" : ""}`} /></button>
                  <button onClick={() => handleDelete(page.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-colors" data-testid={`delete-${page.id}`}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              {expandedPage === page.id && (
                <div className="border-t border-white/5 px-5 py-4 bg-white/[0.02]">
                  <h3 className="text-sm font-medium text-white mb-3">Change Log</h3>
                  {!changes[page.id] ? <p className="text-xs text-gray-500">Loading...</p> : changes[page.id].length === 0 ? <p className="text-xs text-gray-500">No changes detected yet.</p> : (
                    <div className="space-y-2">{changes[page.id].map((c, i) => (
                      <div key={i} className="flex items-center gap-4 rounded-lg bg-white/[0.02] border border-white/5 px-4 py-3 text-xs" data-testid={`change-${i}`}>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${c.impact === "positive" ? "bg-green-400/10 text-green-400" : c.impact === "negative" ? "bg-red-400/10 text-red-400" : "bg-gray-400/10 text-gray-400"}`}>{c.impact}</span>
                        <span className="text-gray-400 w-36">{c.signal_name}</span>
                        <span className="text-gray-500">{c.previous_value}</span>
                        <ArrowRight className="w-3 h-3 text-gray-600" />
                        <span className="text-white">{c.current_value}</span>
                        <span className="ml-auto text-gray-600">{new Date(c.detected_at).toLocaleString()}</span>
                      </div>
                    ))}</div>
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
