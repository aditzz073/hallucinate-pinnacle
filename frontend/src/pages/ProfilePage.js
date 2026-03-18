import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getOverview } from "../api";
import { changePassword, generateApiKey } from "../api";
import { 
  User, Mail, Shield, FileSearch, Search, 
  Clock, TrendingUp, Activity, ChevronDown,
  LogOut, Lock, ExternalLink, Eye, EyeOff, Check, X, Key, Copy, UserRound
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwVisibility, setPwVisibility] = useState({ current: false, next: false, confirm: false });
  const [pwStatus, setPwStatus] = useState(null); // null | "loading" | "success" | "error"
  const [pwError, setPwError] = useState("");
  
  const [generatingKey, setGeneratingKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [keyCopied, setKeyCopied] = useState(false);

  const handleGenerateKey = async () => {
    setGeneratingKey(true);
    setKeyCopied(false);
    try {
      const res = await generateApiKey();
      setGeneratedKey(res.api_key);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingKey(false);
    }
  };

  const copyKeyToClipboard = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    }
  };

  useEffect(() => {
    getOverview().then(setOverview).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = overview?.summary || {};
  
  // Determine role display
  const getRoleInfo = () => {
    if (user) {
      return { text: "Pro User", color: "from-blue-400 to-cyan-400", icon: Shield };
    }
    return { text: "Guest", color: "from-gray-400 to-gray-500", icon: User };
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  return (
    <div className="space-y-8 animate-in fade-in duration-700" data-testid="profile-page">
      
      {/* 1️⃣ PROFILE HEADER CARD (Hero Section) */}
      <div className="glass-card p-10 lg:p-12 border-white/10">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Avatar */}
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-white/10 flex items-center justify-center backdrop-blur-sm shadow-2xl">
              <div className="w-20 h-20 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                <UserRound className="w-10 h-10 text-white" strokeWidth={1.8} />
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
              <h1 className="font-display text-3xl font-bold text-white">
                {user?.nickname || user?.email?.split("@")[0] || "User"}
              </h1>
            </div>
            
            <p className="text-gray-400 mb-4 flex items-center justify-center lg:justify-start gap-2">
              <Mail className="w-4 h-4" />
              {user?.email || "guest@pinnacle.ai"}
            </p>

            {/* Role Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <RoleIcon className="w-4 h-4" style={{ color: `var(--tw-gradient-stops)` }} />
              <span className={`text-sm font-semibold bg-gradient-to-r ${roleInfo.color} bg-clip-text text-transparent`}>
                {roleInfo.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2️⃣ ACCOUNT & USAGE METRICS */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Usage Metrics
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Metric Cards */}
            {[
              { 
                icon: FileSearch, 
                label: "Total Audits", 
                value: stats.total_audits || 0,
                iconColor: "text-blue-400",
                bgColor: "from-blue-500/10 to-cyan-500/10"
              },
              { 
                icon: Search, 
                label: "AI Tests", 
                value: stats.total_ai_tests || 0,
                iconColor: "text-purple-400",
                bgColor: "from-purple-500/10 to-pink-500/10"
              },
              { 
                icon: TrendingUp, 
                label: "Avg Score", 
                value: stats.avg_score || "N/A",
                iconColor: "text-emerald-400",
                bgColor: "from-emerald-500/10 to-green-500/10"
              },
              { 
                icon: Clock, 
                label: "Last Active", 
                value: "Today",
                iconColor: "text-amber-400",
                bgColor: "from-amber-500/10 to-orange-500/10"
              },
            ].map((metric, i) => {
              const Icon = metric.icon;
              return (
                <div 
                  key={i} 
                  className="glass-card p-6 hover:border-white/20 transition-all duration-300 group"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${metric.bgColor} border border-white/10 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${metric.iconColor}`} />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{metric.label}</p>
                  <p className="text-3xl font-bold text-white">{metric.value}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3️⃣ ACTIONS SECTION */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          Account Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Change Password */}
          <div className="glass-card overflow-hidden">
            <button
              onClick={() => { setShowPasswordForm(v => !v); setPwStatus(null); setPwError(""); setPwForm({ current: "", next: "", confirm: "" }); }}
              className="w-full p-6 flex items-center gap-4 hover:bg-white/5 transition-all duration-200"
            >
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Lock className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-white mb-1">Change Password</p>
                <p className="text-xs text-gray-500">{showPasswordForm ? "Cancel" : "Update your account password"}</p>
              </div>
              {showPasswordForm ? <X className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
            </button>

            {showPasswordForm && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setPwError("");
                  if (pwForm.next !== pwForm.confirm) { setPwError("New passwords do not match"); return; }
                  if (pwForm.next.length < 6) { setPwError("New password must be at least 6 characters"); return; }
                  setPwStatus("loading");
                  try {
                    await changePassword(pwForm.current, pwForm.next);
                    setPwStatus("success");
                    setPwForm({ current: "", next: "", confirm: "" });
                    setTimeout(() => { setShowPasswordForm(false); setPwStatus(null); }, 1800);
                  } catch (err) {
                    setPwError(err?.response?.data?.detail || "Failed to change password");
                    setPwStatus("error");
                  }
                }}
                className="px-6 pb-6 border-t border-white/5 pt-4 space-y-3"
              >
                {[{key: "current", label: "Current password"}, {key: "next", label: "New password"}, {key: "confirm", label: "Confirm new password"}].map(({ key, label }) => (
                  <div key={key} className="relative">
                    <input
                      type={pwVisibility[key] ? "text" : "password"}
                      placeholder={label}
                      value={pwForm[key]}
                      onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                      required
                      className="w-full h-10 rounded-lg px-3 pr-10 text-sm bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setPwVisibility(v => ({ ...v, [key]: !v[key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {pwVisibility[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                ))}

                {pwError && <p className="text-xs text-red-400">{pwError}</p>}

                <button
                  type="submit"
                  disabled={pwStatus === "loading" || pwStatus === "success"}
                  className="w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{ background: pwStatus === "success" ? "rgba(16,185,129,0.2)" : "rgba(79,70,229,0.8)", color: "white", border: pwStatus === "success" ? "1px solid rgba(16,185,129,0.4)" : "none" }}
                >
                  {pwStatus === "loading" && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {pwStatus === "success" && <><Check className="w-4 h-4 text-emerald-400" /> Password updated</>}
                  {(pwStatus === null || pwStatus === "error") && "Update Password"}
                </button>
              </form>
            )}
          </div>

          {/* API Keys (For CLI) */}
          <div className="glass-card p-6 border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <Key className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-white mb-1">Pinnacle CLI Access</p>
                <p className="text-xs text-gray-500">Generate an API key to use Pinnacle locally.</p>
              </div>
            </div>

            {!generatedKey ? (
              <button
                onClick={handleGenerateKey}
                disabled={generatingKey}
                className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                {generatingKey ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Generate New API Key</>
                )}
              </button>
            ) : (
              <div className="bg-[#0B0B14] border border-indigo-500/30 rounded-lg p-3">
                <p className="text-xs text-green-400 mb-2 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Key generated successfully! 
                </p>
                <p className="text-[10px] text-gray-400 mb-2 leading-relaxed">
                  Copy this key and paste it when running <code className="text-indigo-400 bg-indigo-400/10 px-1 rounded">pinnacle auth</code> in your terminal. You will only see this key once.
                </p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={generatedKey} 
                    className="flex-1 bg-black/50 border border-white/10 rounded px-2 py-1.5 text-xs text-gray-300 font-mono outline-none"
                  />
                  <button 
                    onClick={copyKeyToClipboard}
                    className="p-1.5 rounded bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
                  >
                    {keyCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sign Out (Destructive Action) */}
          <button 
            onClick={() => {
              // Logout will be handled by parent component
              window.location.href = '/';
            }}
            className="glass-card p-6 flex items-center gap-4 border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5 transition-all duration-300 group"
          >
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 group-hover:bg-red-500/20 transition-colors">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-red-400 mb-1">Sign Out</p>
              <p className="text-xs text-gray-500">End your session</p>
            </div>
            <ExternalLink className="w-4 h-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </div>
  );
}
