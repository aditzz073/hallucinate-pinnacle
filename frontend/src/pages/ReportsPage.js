import React, { useState, useEffect } from "react";
import { getOverview, getTrends, getCompetitors } from "../api";
import { getScoreColor } from "../components/ui/ScoreRing";
import { BarChart3, TrendingUp, Users, TrendingDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area,
} from "recharts";

const TOOLTIP_STYLE = {
  backgroundColor: "var(--surface-2, #14142A)",
  border: "1px solid var(--border, rgba(255,255,255,0.08))",
  borderRadius: "10px",
  color: "#fff",
  fontSize: "12px",
};

const GRID_COLOR = "rgba(255,255,255,0.04)";
const AXIS_TICK = { fontSize: 11, fill: "var(--muted, #7070A0)" };

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "trends", label: "Trends", icon: TrendingUp },
  { id: "competitors", label: "Competitors", icon: Users },
];

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

export default function ReportsPage() {
  const [tab, setTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState(null);
  const [competitors, setCompetitors] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [tab]); // eslint-disable-line

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === "overview" && !overview) setOverview(await getOverview());
      else if (tab === "trends" && !trends) setTrends(await getTrends());
      else if (tab === "competitors" && !competitors) setCompetitors(await getCompetitors());
    } catch {}
    setLoading(false);
  };

  return (
    <div className="space-y-8" data-testid="reports-page">
      <div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          Reports & <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Analytics</span>
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Aggregated insights across all your audits and tests.
        </p>
      </div>

      {/* Tabs */}
      <div
        className="inline-flex rounded-xl p-1 gap-1"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              data-testid={`tab-${t.id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: isActive ? "var(--surface-2)" : "transparent",
                color: isActive ? "var(--foreground)" : "var(--muted)",
                border: isActive ? "1px solid var(--border)" : "1px solid transparent",
              }}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {loading && !overview && !trends && !competitors ? (
        <div className="space-y-4">
          <div className="skeleton h-24 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      ) : (
        <>
          {tab === "overview" && overview && <OverviewTab data={overview} />}
          {tab === "trends" && trends && <TrendsTab data={trends} />}
          {tab === "competitors" && competitors && <CompetitorsTab data={competitors} />}
        </>
      )}
    </div>
  );
}

function OverviewTab({ data }) {
  const s = data.summary || {};
  const stats = [
    { label: "Total Audits", value: s.total_audits },
    { label: "Total AI Tests", value: s.total_ai_tests },
    { label: "Monitored Pages", value: s.total_monitored_pages },
    { label: "Changes Detected", value: s.total_changes_detected },
    { label: "Avg AEO Score", value: s.average_aeo_score, isScore: true },
    { label: "Avg Citation %", value: s.average_citation_probability, isScore: true },
  ];

  return (
    <div className="space-y-6" data-testid="overview-tab">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((st) => (
          <div key={st.label} className="metric-card text-center">
            <p
              className="text-2xl font-bold mb-1"
              style={{ color: st.isScore ? getScoreColor(st.value) : "var(--foreground)" }}
            >
              {st.value ?? ","}
            </p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{st.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="metric-card p-0 overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Recent Audits</h3>
          </div>
          {data.recent_audits?.length === 0 ? (
            <p className="px-5 py-4 text-xs" style={{ color: "var(--muted)" }}>No audits yet.</p>
          ) : (
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>URL</th>
                  <th className="text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_audits?.map((a, i) => (
                  <tr key={i}>
                    <td className="text-xs" style={{ color: "var(--muted)" }}>{getRecordBrand(a)}</td>
                    <td className="truncate max-w-[200px] font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>{a.url}</td>
                    <td className="text-right font-bold" style={{ color: getScoreColor(a.overall_score) }}>{a.overall_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="metric-card p-0 overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Recent AI Tests</h3>
          </div>
          {data.recent_ai_tests?.length === 0 ? (
            <p className="px-5 py-4 text-xs" style={{ color: "var(--muted)" }}>No tests yet.</p>
          ) : (
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>URL</th>
                  <th className="text-right">Citation</th>
                  <th className="text-right">GEO</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_ai_tests?.map((t, i) => (
                  <tr key={i}>
                    <td className="text-xs" style={{ color: "var(--muted)" }}>{getRecordBrand(t)}</td>
                    <td className="truncate max-w-[200px] font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>{t.url}</td>
                    <td className="text-right font-bold" style={{ color: getScoreColor(t.citation_probability) }}>{t.citation_probability}%</td>
                    <td className="text-right font-bold" style={{ color: getScoreColor(t.geo_score) }}>
                      {t.geo_score !== undefined ? `${t.geo_score}%` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function TrendsTab({ data }) {
  const auditData = (data.audit_trends || []).map((a) => ({
    date: new Date(a.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    score: a.overall_score,
  }));
  const radarData = Object.entries(data.breakdown_averages || {}).map(([k, v]) => ({
    subject: k.charAt(0).toUpperCase() + k.slice(1),
    score: v,
    fullMark: 100,
  }));

  return (
    <div className="space-y-6" data-testid="trends-tab">
      <div className="grid grid-cols-2 gap-3">
        <DeltaCard label="AEO Score change" value={data.deltas?.audit_score_delta || 0} />
        <DeltaCard label="Citation probability change" value={data.deltas?.citation_probability_delta || 0} />
      </div>

      {auditData.length > 0 && (
        <div className="metric-card">
          <h3 className="text-sm font-semibold mb-5" style={{ color: "var(--foreground)" }}>AEO Score Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={auditData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gradIndigo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "rgba(79,70,229,0.3)", strokeWidth: 1 }} />
              <Area type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#gradIndigo)" dot={false} activeDot={{ r: 4, fill: "#4F46E5" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {radarData.some(r => r.score > 0) && (
        <div className="metric-card">
          <h3 className="text-sm font-semibold mb-5" style={{ color: "var(--foreground)" }}>Average Score Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={GRID_COLOR} />
              <PolarAngleAxis dataKey="subject" tick={AXIS_TICK} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--muted, #7070A0)" }} />
              <Radar dataKey="score" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.12} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {auditData.length === 0 && (
        <p className="text-sm" style={{ color: "var(--muted)" }}>No trend data yet. Run some audits to see performance over time.</p>
      )}
    </div>
  );
}

function CompetitorsTab({ data }) {
  const items = data.comparison || [];
  const chartData = items.filter(c => c.aeo_score > 0).map((c) => {
    let hostname = c.url;
    try { hostname = new URL(c.url).hostname.replace("www.", ""); } catch {}
    return { url: hostname, aeo: c.aeo_score, citation: c.citation_probability };
  });

  return (
    <div className="space-y-6" data-testid="competitors-tab">
      {chartData.length > 0 && (
        <div className="metric-card">
          <h3 className="text-sm font-semibold mb-5" style={{ color: "var(--foreground)" }}>Score Comparison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="url" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
              <Bar dataKey="aeo" name="AEO Score" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="citation" name="Citation %" fill="#7C3AED" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>No data yet. Run audits on multiple URLs to compare them here.</p>
      ) : (
        <div className="metric-card p-0 overflow-hidden">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>URL</th>
                <th className="text-center">AEO</th>
                <th className="text-center">Citation %</th>
                <th className="text-center">Audits</th>
                <th className="text-center">Tests</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} data-testid={`competitor-row-${i}`}>
                  <td className="truncate max-w-xs font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>{item.url}</td>
                  <td className="text-center font-bold text-sm" style={{ color: getScoreColor(item.aeo_score) }}>{item.aeo_score}</td>
                  <td className="text-center font-bold text-sm" style={{ color: getScoreColor(item.citation_probability) }}>{item.citation_probability}%</td>
                  <td className="text-center text-xs" style={{ color: "var(--muted)" }}>{item.audit_count}</td>
                  <td className="text-center text-xs" style={{ color: "var(--muted)" }}>{item.test_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DeltaCard({ label, value }) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  return (
    <div className="metric-card flex items-center gap-3">
      {isPositive ? (
        <TrendingUp className="w-4 h-4 flex-shrink-0" style={{ color: "#10B981" }} />
      ) : (
        <TrendingDown className="w-4 h-4 flex-shrink-0" style={{ color: isNeutral ? "var(--muted)" : "#EF4444" }} />
      )}
      <div>
        <span
          className="text-xl font-bold"
          style={{ color: isPositive ? "#10B981" : isNeutral ? "var(--muted)" : "#EF4444" }}
        >
          {isPositive ? "+" : ""}{value}
        </span>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{label}</p>
      </div>
    </div>
  );
}
