import React, { useState, useEffect } from "react";
import { getOverview, getTrends, getCompetitors } from "../api";
import { ScoreBadge, getScoreColor } from "../components/ui/ScoreRing";
import { BarChart3, TrendingUp, Users, Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line,
} from "recharts";

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "trends", label: "Trends", icon: TrendingUp },
  { id: "competitors", label: "Competitors", icon: Users },
];

export default function ReportsPage() {
  const [tab, setTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState(null);
  const [competitors, setCompetitors] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === "overview" && !overview) {
        setOverview(await getOverview());
      } else if (tab === "trends" && !trends) {
        setTrends(await getTrends());
      } else if (tab === "competitors" && !competitors) {
        setCompetitors(await getCompetitors());
      }
    } catch (e) { /* ignore */ }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl" data-testid="reports-page">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Phase 4</p>
        <h1 className="font-heading font-bold text-3xl tracking-tight mb-2">Reports & Analytics</h1>
        <p className="text-muted-foreground text-sm">Aggregated insights across all your audits and tests.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-muted rounded-lg p-1 w-fit">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              data-testid={`tab-${t.id}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {loading && !overview && !trends && !competitors ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
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
    { label: "Avg Citation Prob", value: s.average_citation_probability, isScore: true },
  ];

  return (
    <div className="space-y-8" data-testid="overview-tab">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((st) => (
          <div key={st.label} className="bg-card border border-border rounded-lg p-4 text-center">
            <p className="font-heading font-bold text-2xl" style={st.isScore ? { color: getScoreColor(st.value) } : {}}>
              {st.isScore ? `${st.value}` : st.value}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-1">{st.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-heading font-semibold text-sm mb-4">Recent Audits</h3>
          {data.recent_audits?.length === 0 ? (
            <p className="text-xs text-muted-foreground">No audits yet.</p>
          ) : (
            <div className="space-y-2">
              {data.recent_audits?.map((a, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="truncate max-w-[200px] text-muted-foreground">{a.url}</span>
                  <ScoreBadge score={a.overall_score} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-heading font-semibold text-sm mb-4">Recent AI Tests</h3>
          {data.recent_ai_tests?.length === 0 ? (
            <p className="text-xs text-muted-foreground">No tests yet.</p>
          ) : (
            <div className="space-y-2">
              {data.recent_ai_tests?.map((t, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="truncate max-w-[180px] text-muted-foreground">{t.url}</span>
                  <ScoreBadge score={t.citation_probability} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TrendsTab({ data }) {
  const auditData = (data.audit_trends || []).map((a) => ({
    date: new Date(a.created_at).toLocaleDateString(),
    score: a.overall_score,
    ...a.breakdown_json,
  }));

  const breakdownAvg = data.breakdown_averages || {};
  const radarData = Object.entries(breakdownAvg).map(([key, value]) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1),
    score: value,
    fullMark: 100,
  }));

  return (
    <div className="space-y-8" data-testid="trends-tab">
      {/* Deltas */}
      <div className="flex gap-4">
        <DeltaCard label="AEO Score Delta" value={data.deltas?.audit_score_delta || 0} />
        <DeltaCard label="Citation Prob Delta" value={data.deltas?.citation_probability_delta || 0} />
      </div>

      {/* Score Over Time */}
      {auditData.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-heading font-semibold text-sm mb-4">AEO Score Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={auditData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A1A1AA" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#A1A1AA" }} />
              <Tooltip contentStyle={{ backgroundColor: "#0A0A0A", border: "1px solid #27272A", borderRadius: 8 }} />
              <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={2} dot={{ fill: "#4F46E5" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Breakdown Radar */}
      {radarData.length > 0 && radarData.some(r => r.score > 0) && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-heading font-semibold text-sm mb-4">Average Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#27272A" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#A1A1AA" }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#A1A1AA" }} />
              <Radar dataKey="score" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weekly Averages */}
      {(data.weekly_averages || []).length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-heading font-semibold text-sm mb-4">Weekly Averages</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.weekly_averages}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#A1A1AA" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#A1A1AA" }} />
              <Tooltip contentStyle={{ backgroundColor: "#0A0A0A", border: "1px solid #27272A", borderRadius: 8 }} />
              <Bar dataKey="average" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {auditData.length === 0 && (
        <p className="text-muted-foreground text-sm">No trend data yet. Run some audits to see trends.</p>
      )}
    </div>
  );
}

function CompetitorsTab({ data }) {
  const items = data.comparison || [];

  const chartData = items.filter(c => c.aeo_score > 0).map((c) => ({
    url: new URL(c.url).hostname.replace("www.", ""),
    aeo: c.aeo_score,
    citation: c.citation_probability,
  }));

  return (
    <div className="space-y-8" data-testid="competitors-tab">
      <p className="text-xs text-muted-foreground">{data.total_urls} URLs compared</p>

      {chartData.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-heading font-semibold text-sm mb-4">Score Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
              <XAxis dataKey="url" tick={{ fontSize: 10, fill: "#A1A1AA" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#A1A1AA" }} />
              <Tooltip contentStyle={{ backgroundColor: "#0A0A0A", border: "1px solid #27272A", borderRadius: 8 }} />
              <Bar dataKey="aeo" name="AEO Score" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="citation" name="Citation Prob" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No competitor data. Run audits on multiple URLs to compare.</p>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 font-mono text-xs text-muted-foreground uppercase">URL</th>
                <th className="text-center px-3 py-3 font-mono text-xs text-muted-foreground uppercase">AEO Score</th>
                <th className="text-center px-3 py-3 font-mono text-xs text-muted-foreground uppercase">Citation %</th>
                <th className="text-center px-3 py-3 font-mono text-xs text-muted-foreground uppercase">Audits</th>
                <th className="text-center px-3 py-3 font-mono text-xs text-muted-foreground uppercase">Tests</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors duration-200" data-testid={`competitor-row-${i}`}>
                  <td className="px-5 py-3">
                    <span className="truncate max-w-xs block text-xs">{item.url}</span>
                  </td>
                  <td className="text-center px-3 py-3"><ScoreBadge score={item.aeo_score} /></td>
                  <td className="text-center px-3 py-3"><ScoreBadge score={item.citation_probability} /></td>
                  <td className="text-center px-3 py-3 text-xs text-muted-foreground">{item.audit_count}</td>
                  <td className="text-center px-3 py-3 text-xs text-muted-foreground">{item.test_count}</td>
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
    <div className="bg-card border border-border rounded-lg px-5 py-4 flex items-center gap-3">
      <span className={`font-heading font-bold text-lg ${isPositive ? "text-emerald-400" : isNeutral ? "text-muted-foreground" : "text-red-400"}`}>
        {isPositive ? "+" : ""}{value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
