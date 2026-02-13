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
    getOverview()
      .then(setOverview)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = overview?.summary || {};
  const userName = user?.email?.split("@")[0] || "User";
  const domain = user?.email?.split("@")[1] || "";

  return (
    <div className="space-y-8" data-testid="profile-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your account settings and view usage statistics.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Information */}
        <div className="glass-card p-6" data-testid="account-info">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
              <User className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Account Information</h2>
              <p className="text-xs text-gray-500">Your personal details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 py-3 border-b border-white/5">
              <User className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Name</p>
                <p className="text-sm font-medium text-white capitalize">{userName}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 py-3 border-b border-white/5">
              <Mail className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                <p className="text-sm font-medium text-white">{user?.email || "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 py-3 border-b border-white/5">
              <Building2 className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Organization</p>
                <p className="text-sm font-medium text-white capitalize">{domain || "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 py-3">
              <Shield className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Role</p>
                <p className="text-sm font-medium text-white">Admin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Overview */}
        <div className="glass-card p-6" data-testid="usage-overview">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Usage Overview</h2>
              <p className="text-xs text-gray-500">Your platform activity</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-gray-600 border-t-brand-blue rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileSearch className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500">Audits Run</span>
                </div>
                <p className="text-2xl font-semibold text-white">{stats.total_audits || 0}</p>
              </div>

              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500">AI Tests</span>
                </div>
                <p className="text-2xl font-semibold text-white">{stats.total_ai_tests || 0}</p>
              </div>

              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500">Pages Monitored</span>
                </div>
                <p className="text-2xl font-semibold text-white">{stats.total_monitored_pages || 0}</p>
              </div>

              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500">Last Login</span>
                </div>
                <p className="text-sm font-medium text-white">Today</p>
              </div>
            </div>
          )}
        </div>

        {/* Subscription / Plan */}
        <div className="glass-card p-6" data-testid="subscription-info">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Subscription</h2>
              <p className="text-xs text-gray-500">Your current plan</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div>
                <p className="text-sm font-medium text-white">Pro Plan</p>
                <p className="text-xs text-gray-500">Full access to all features</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">Active</span>
              </div>
            </div>

            <button 
              disabled
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-gray-400 cursor-not-allowed"
            >
              Upgrade Plan (Coming Soon)
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="glass-card p-6" data-testid="security-section">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Security</h2>
              <p className="text-xs text-gray-500">Manage your account security</p>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              disabled
              className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.02] border border-white/5 text-sm font-medium text-gray-400 cursor-not-allowed hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4" />
                <span>Change Password</span>
              </div>
              <span className="text-xs text-gray-600">Coming Soon</span>
            </button>

            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-400/10 border border-red-400/20 text-sm font-medium text-red-400 hover:bg-red-400/20 transition-colors"
              data-testid="profile-logout"
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
