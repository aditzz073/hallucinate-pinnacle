import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Logo from "../ui/Logo";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage({ onSwitch, onSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      if (onSuccess) onSuccess(); // Call success callback
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: "var(--bg)" }} data-testid="login-page">
      <div className="w-full max-w-md px-4">
        <div className="metric-card p-8 space-y-8" style={{ maxWidth: "440px", margin: "0 auto" }}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Logo size="md" />
              <span className="text-xl font-semibold text-white">Pinnacle</span>
              <span className="text-xl font-semibold text-gray-400">.ai</span>
            </div>
            <h1 className="text-2xl font-thin text-white mb-1">Welcome back</h1>
            <p className="text-sm text-gray-400">Sign in to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
            {error && (
              <div className="rounded-xl bg-red-400/10 border border-red-400/20 px-4 py-3 text-sm text-red-400" data-testid="login-error">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Email</label>
              <input
                data-testid="login-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input w-full h-12 px-4 text-sm"
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Password</label>
              <div className="relative">
                <input
                  data-testid="login-password-input"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full h-12 px-4 pr-12 text-sm"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  data-testid="login-toggle-password"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              data-testid="login-submit-button"
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-12 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center">
            Don't have an account?{" "}
            <button
              data-testid="login-switch-to-register"
              onClick={onSwitch}
              className="font-medium transition-opacity hover:opacity-70" style={{ color: "#818CF8" }}
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
