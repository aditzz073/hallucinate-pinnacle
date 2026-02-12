import React, { useState, useEffect } from "react";
import { getOverview, getTrends, getCompetitors } from "../api";
import { getScoreColor } from "../components/ui/ScoreRing";
import { BarChart3, TrendingUp, Users, Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area,
} from "recharts";

const TOOLTIP_STYLE = { backgroundColor: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", backdropFilter: "blur(12px)" };

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

  useEffect(() => { loadData(); }, [tab]);

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
    <div className="space-y-10" data-testid="reports-page">
      <div>
        <h1 className="text-3xl lg:text-4xl font-thin text-white mb-2">Reports & Analytics</h1>
        <p className="text-gray-400 font-light">Aggregated insights across all your audits and tests.</p>
      </div>

      {/* Tabs */}
      <div className="glass-card inline-flex p-1 gap-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} data-testid={`tab-${t.id}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${tab === t.id ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {loading && !overview && !trends && !competitors ? <div className="flex items-center gap-2 text-gray-500"><Loader2 className="w-4 h-4 animate-spin" />Loading...</div> : (
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
    <div className="space-y-8" data-testid="overview-tab">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((st) => (
          <div key={st.label} className="glass-card p-4 text-center">
            <p className="text-2xl font-light" style={st.isScore ? { color: getScoreColor(st.value) } : { color: "#fff" }}>{st.isScore ? `${st.value}` : st.value}</p>
            <p className="text-[10px] text-gray-500 mt-1">{st.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Audits</h3>
          {data.recent_audits?.length === 0 ? <p className="text-xs text-gray-500">No audits yet.</p> : data.recent_audits?.map((a, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1.5"><span className="truncate max-w-[200px] text-gray-400">{a.url}</span><span style={{ color: getScoreColor(a.overall_score) }}>{a.overall_score}</span></div>
          ))}
        </div>
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Recent AI Tests</h3>
          {data.recent_ai_tests?.length === 0 ? <p className="text-xs text-gray-500">No tests yet.</p> : data.recent_ai_tests?.map((t, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1.5"><span className="truncate max-w-[180px] text-gray-400">{t.url}</span><span style={{ color: getScoreColor(t.citation_probability) }}>{t.citation_probability}%</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrendsTab({ data }) {
  const auditData = (data.audit_trends || []).map((a) => ({ date: new Date(a.created_at).toLocaleDateString(), score: a.overall_score }));
  const radarData = Object.entries(data.breakdown_averages || {}).map(([k, v]) => ({ subject: k.charAt(0).toUpperCase() + k.slice(1), score: v, fullMark: 100 }));

  return (
    <div className="space-y-8" data-testid="trends-tab">
      <div className="flex gap-4">
        <DeltaCard label="AEO Score Delta" value={data.deltas?.audit_score_delta || 0} />
        <DeltaCard label="Citation Prob Delta" value={data.deltas?.citation_probability_delta || 0} />
      </div>
      {auditData.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-4">AEO Score Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={auditData}>
              <defs><linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3A9BFF" stopOpacity={0.3}/><stop offset="95%" stopColor="#3A9BFF" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="score" stroke="#3A9BFF" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      {radarData.some(r => r.score > 0) && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Average Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#6b7280" }} />
              <Radar dataKey="score" stroke="#3A9BFF" fill="#3A9BFF" fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
      {auditData.length === 0 && <p className="text-gray-500 text-sm">No trend data yet. Run some audits.</p>}
    </div>
  );
}

function CompetitorsTab({ data }) {
  const items = data.comparison || [];
  const chartData = items.filter(c => c.aeo_score > 0).map((c) => ({ url: new URL(c.url).hostname.replace("www.", ""), aeo: c.aeo_score, citation: c.citation_probability }));

  return (
    <div className="space-y-8" data-testid="competitors-tab">
      {chartData.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Score Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="url" tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="aeo" name="AEO Score" fill="#3A9BFF" radius={[4, 4, 0, 0]} />
              <Bar dataKey="citation" name="Citation %" fill="#60D5C8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {items.length === 0 ? <p className="text-gray-500 text-sm">No data. Run audits on multiple URLs.</p> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/5">
              <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">URL</th>
              <th className="text-center px-3 py-3 text-xs text-gray-500 font-medium">AEO</th>
              <th className="text-center px-3 py-3 text-xs text-gray-500 font-medium">Citation %</th>
              <th className="text-center px-3 py-3 text-xs text-gray-500 font-medium">Audits</th>
              <th className="text-center px-3 py-3 text-xs text-gray-500 font-medium">Tests</th>
            </tr></thead>
            <tbody>{items.map((item, i) => (
              <tr key={i} className="border-b border-white/3 hover:bg-white/[0.02] transition-colors" data-testid={`competitor-row-${i}`}>
                <td className="px-5 py-3 text-xs text-gray-400 truncate max-w-xs">{item.url}</td>
                <td className="text-center px-3 py-3"><span className="text-xs font-semibold" style={{ color: getScoreColor(item.aeo_score) }}>{item.aeo_score}</span></td>
                <td className="text-center px-3 py-3"><span className="text-xs font-semibold" style={{ color: getScoreColor(item.citation_probability) }}>{item.citation_probability}%</span></td>
                <td className="text-center px-3 py-3 text-xs text-gray-500">{item.audit_count}</td>
                <td className="text-center px-3 py-3 text-xs text-gray-500">{item.test_count}</td>
              </tr>
            ))}</tbody>
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
    <div className="glass-card px-5 py-4 flex items-center gap-3">
      <span className={`text-lg font-semibold ${isPositive ? "text-green-400" : isNeutral ? "text-gray-500" : "text-red-400"}`}>{isPositive ? "+" : ""}{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}
