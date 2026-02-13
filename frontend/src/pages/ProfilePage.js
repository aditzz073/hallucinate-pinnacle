import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getOverview } from "../api";
import { 
  User, Mail, Building2, Shield, 
  FileSearch, Search, Eye, Clock,
  CreditCard, Zap, Lock, LogOut,
  CheckCircle2
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOverview().then(setOverview).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = overview?.summary || {};
  const userName = user?.email?.split("@")[0] || "User";
  const domain = user?.email?.split("@")[1] || "";

  return (
    <div className="space-y-8" data-testid="profile-page">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Profile</span>
        </h1>
        <p className="text-gray-500">Manage your account settings and view usage statistics.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Information */}
        <div className="glass-card p-6" data-testid="account-info">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Account Information</h2>
              <p className="text-xs text-gray-600">Your personal details</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { icon: User, label: "Name", value: userName },
              { icon: Mail, label: "Email", value: user?.email || "—" },
              { icon: Building2, label: "Organization", value: domain || "—" },
              { icon: Shield, label: "Role", value: "Admin" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                  <Icon className="w-4 h-4 text-gray-600" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-0.5">{item.label}</p>
                    <p className="text-sm font-medium text-white capitalize">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Usage Overview */}
        <div className="glass-card p-6" data-testid="usage-overview">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Usage Overview</h2>
              <p className="text-xs text-gray-600">Your platform activity</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: FileSearch, label: "Audits Run", value: stats.total_audits || 0 },
                { icon: Search, label: "AI Tests", value: stats.total_ai_tests || 0 },
                { icon: Eye, label: "Pages Monitored", value: stats.total_monitored_pages || 0 },
                { icon: Clock, label: "Last Login", value: "Today" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-gray-600" />
                      <span className="text-xs text-gray-600">{item.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{item.value}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Subscription */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Subscription</h2>
              <p className="text-xs text-gray-600">Your current plan</p>
            </div>
          </div>

          <div className="flex items-center justify-between py-4 border-b border-white/5 mb-4">
            <div>
              <p className="text-sm font-medium text-white">Pro Plan</p>
              <p className="text-xs text-gray-600">Full access to all features</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Active</span>
            </div>
          </div>

          <button disabled className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-gray-500 cursor-not-allowed">
            Upgrade Plan (Coming Soon)
          </button>
        </div>

        {/* Security */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Security</h2>
              <p className="text-xs text-gray-600">Manage your account security</p>
            </div>
          </div>

          <div className="space-y-3">
            <button disabled className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.02] border border-white/5 text-sm font-medium text-gray-500 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4" />
                <span>Change Password</span>
              </div>
              <span className="text-xs text-gray-700">Coming Soon</span>
            </button>

            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
