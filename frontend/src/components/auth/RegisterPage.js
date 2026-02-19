import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Logo from "../ui/Logo";
import Blobs from "../ui/Blobs";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage({ onSwitch }) {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPw) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await register(email, password, nickname.trim() || null);
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-black" data-testid="register-page">
      <Blobs variant="hero" />
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="glass-card p-8 space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Logo size="md" />
              <span className="text-xl font-semibold text-white">Pinnacle</span>
              <span className="text-xl font-semibold text-gray-400">.ai</span>
            </div>
            <h1 className="text-2xl font-thin text-white mb-1">Create your account</h1>
            <p className="text-sm text-gray-400">Start optimizing your AI discoverability</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" data-testid="register-form">
            {error && (
              <div className="rounded-xl bg-red-400/10 border border-red-400/20 px-4 py-3 text-sm text-red-400" data-testid="register-error">{error}</div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Email</label>
              <input data-testid="register-email-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="glass-input w-full h-12 px-4 text-sm" placeholder="you@company.com" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Password</label>
              <div className="relative">
                <input data-testid="register-password-input" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="glass-input w-full h-12 px-4 pr-12 text-sm" placeholder="Min 6 characters" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors" data-testid="register-toggle-password">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Confirm Password</label>
              <input data-testid="register-confirm-password-input" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="glass-input w-full h-12 px-4 text-sm" placeholder="Re-enter password" required />
            </div>
            <button data-testid="register-submit-button" type="submit" disabled={loading} className="w-full h-12 rounded-full bg-white text-black font-medium flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center">
            Already have an account?{" "}
            <button data-testid="register-switch-to-login" onClick={onSwitch} className="text-brand-blue hover:text-brand-teal font-medium transition-colors">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}
