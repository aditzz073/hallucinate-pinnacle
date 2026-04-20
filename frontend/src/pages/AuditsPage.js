import React, { useState, useEffect } from "react";
import { runAudit, listAudits } from "../api";
import { getScoreColor } from "../components/ui/ScoreRing";
import { FileSearch, Loader2, ExternalLink, AlertTriangle, Lock, Download } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useGuestMode } from "../hooks/useGuestMode";
import GuestBanner from "../components/ui/GuestBanner";
import GuestLimitModal from "../components/modals/GuestLimitModal";
import LockedSection from "../components/ui/LockedSection";
import { downloadAuditReport } from "../utils/pdfReports";

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

export default function AuditsPage({ onSignUp }) {
  const { user } = useAuth();
  const { isGuest, remainingUses, hasReachedLimit, incrementUsage, showLimitModal, setShowLimitModal } = useGuestMode('audits');
  
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [audits, setAudits] = useState([]);
  const [activeAudit, setActiveAudit] = useState(null);
  const [error, setError] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const activeAuditBrand = activeAudit ? getRecordBrand(activeAudit) : "Unknown";

  useEffect(() => {
    if (user) {
      loadAudits();
    } else {
      setListLoading(false);
    }
  }, [user]);

  const loadAudits = async () => {
    try { setAudits(await listAudits()); } catch {}
    setListLoading(false);
  };

  const handleAudit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (isGuest && hasReachedLimit) {
      setShowLimitModal(true);
      return;
    }

    if (isGuest && !incrementUsage()) {
      return; // Modal will show automatically
    }

    setError("");
    setLoading(true);
    try {
      const result = await runAudit(url.trim());
      setActiveAudit(result);
      if (user) {
        loadAudits();
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Audit failed");
    }
    setLoading(false);
  };

  const handleDownloadReport = () => {
    if (!activeAudit) return;

    setDownloadingReport(true);
    try {
      downloadAuditReport({ result: activeAudit });
    } catch {
      setError("Failed to generate PDF report. Please try again.");
    }
    setDownloadingReport(false);
  };

  return (
    <div className="space-y-8" data-testid="audits-page">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          AEO <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">Page Audits</span>
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Analyze any URL for AI Engine Optimization signals.</p>
      </div>

      {isGuest && <GuestBanner remainingUses={remainingUses} onSignUp={onSignUp || (() => {})} />}

      {/* Form */}
      <div className="glass-card p-6">
        <form onSubmit={handleAudit} className="flex gap-4" data-testid="audit-form">
          <input
            data-testid="audit-url-input"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/page"
            className="glass-input flex-1 h-12 px-4 text-sm"
            required
            disabled={isGuest && hasReachedLimit}
          />
          <button
            data-testid="audit-submit"
            type="submit"
            disabled={loading}
            className="btn-primary h-12 px-6 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSearch className="w-4 h-4" />}
            {loading ? "Auditing..." : (isGuest && hasReachedLimit ? "Sign in to continue" : "Run Audit")}
          </button>
          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={!activeAudit || downloadingReport}
            className="btn-secondary h-12 px-5 rounded-xl flex items-center gap-2 disabled:opacity-50"
            data-testid="audit-download-pdf"
          >
            <Download className="w-4 h-4" />
            {downloadingReport ? "Generating PDF..." : "Download PDF Report"}
          </button>
        </form>
        {isGuest && hasReachedLimit && (
          <p className="mt-3 text-sm text-amber-400 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            You've used all 2 free audits. Click the button above to create an account.
          </p>
        )}
      </div>

      <GuestLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onSignUp={onSignUp || (() => {})}
        feature="audits"
      />

      {error && (
        <div className="glass-card border-red-500/20 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      )}

      {activeAudit && !(isGuest && hasReachedLimit) && (
        <div className="glass-card p-6" data-testid="audit-result">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Audit Results</h3>
              <p className="text-xs mb-1" style={{ color: "var(--primary)" }}>
                Brand: {activeAuditBrand}
              </p>
              <a href={activeAudit.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                {activeAudit.url} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="text-right">
              <span className="text-4xl font-bold" style={{ color: getScoreColor(activeAudit.overall_score) }}>
                {activeAudit.overall_score}
              </span>
              <p className="text-xs text-gray-600">Overall Score</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {Object.entries(activeAudit.breakdown || {}).map(([key, val]) => (
              <div key={key} className="rounded-xl bg-white/[0.02] border border-white/5 p-4 text-center">
                <p className="text-2xl font-bold" style={{ color: getScoreColor(val) }}>{val}</p>
                <p className="text-xs text-gray-600 mt-1 capitalize">{key.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isGuest && activeAudit && !hasReachedLimit && (
        <div className="space-y-4">
          <LockedSection
            title="Strategy Simulator"
            description="Simulate changes to improve your AI visibility score."
            onUnlock={onSignUp || (() => {})}
          />
          <LockedSection
            title="Competitive Gap Analysis"
            description="See how your content compares to top-ranking pages and identify strategic opportunities."
            onUnlock={onSignUp || (() => {})}
          />
          <LockedSection
            title="PDF Report Export"
            description="Download a comprehensive PDF report with all audit findings and recommendations."
            onUnlock={onSignUp || (() => {})}
          />
        </div>
      )}

      {/* Audit History - Only for logged in users */}
      {user && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Audit History</h2>
          {listLoading ? (
            <p className="text-sm text-gray-600">Loading...</p>
          ) : audits.length === 0 ? (
            <div className="glass-card flex flex-col items-center py-12 text-center">
              <FileSearch className="w-8 h-8 text-gray-700 mb-3" />
              <p className="text-sm text-gray-600">No audits yet. Run your first audit above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {audits.map((a, i) => (
                <div key={i} className="glass-card flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-lg font-bold" style={{ color: getScoreColor(a.overall_score) }}>{a.overall_score}</span>
                    <p className="text-sm text-white truncate">{a.url}</p>
                  </div>
                  <span className="text-xs text-gray-600">{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
