import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Logo from "../ui/Logo";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import AuthGraphShowcase from "./AuthGraphShowcase";

export default function RegisterPage({ onSwitch, onSuccess }) {
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
      if (onSuccess) onSuccess(); // Call success callback
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2" style={{ background: "var(--bg)" }} data-testid="register-page">
      <div className="relative flex items-center justify-center px-6 py-10">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 25% 15%, rgba(124,58,237,0.12), transparent 45%), radial-gradient(circle at 75% 85%, rgba(79,70,229,0.08), transparent 50%)",
          }}
        />

        <div className="w-full max-w-[520px]">
          <div
            className="rounded-[30px] border px-8 py-9 sm:px-10 sm:py-10"
            style={{
              background: "linear-gradient(180deg, rgba(17,18,35,0.9) 0%, rgba(12,13,28,0.95) 100%)",
              borderColor: "rgba(255,255,255,0.1)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
            }}
          >
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-5">
                <Logo size="md" />
              </div>
              <h1 className="text-5xl font-bold leading-tight mb-2" style={{ color: "#F3F4FF", letterSpacing: "-0.02em" }}>Create your free account</h1>
              <p className="text-base" style={{ color: "#9EA3C6" }}>
                Start optimizing AI visibility with Pinnacle.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form">
              {error && (
                <div className="rounded-xl bg-red-400/10 border border-red-400/20 px-4 py-3 text-sm text-red-400" data-testid="register-error">{error}</div>
              )}

              <input
                data-testid="register-nickname-input"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full h-12 rounded-2xl px-4 text-base"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.2)", color: "#F3F4FF" }}
                placeholder="Nickname (optional)"
                maxLength={50}
              />

              <input
                data-testid="register-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 rounded-2xl px-4 text-base"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.2)", color: "#F3F4FF" }}
                placeholder="Enter email address"
                required
              />

              <div className="relative">
                <input
                  data-testid="register-password-input"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 rounded-2xl px-4 pr-12 text-base"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.2)", color: "#F3F4FF" }}
                  placeholder="Create password"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors" data-testid="register-toggle-password">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <input
                data-testid="register-confirm-password-input"
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="w-full h-12 rounded-2xl px-4 text-base"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.2)", color: "#F3F4FF" }}
                placeholder="Confirm password"
                required
              />

              <button data-testid="register-submit-button" type="submit" disabled={loading} className="w-full h-12 rounded-full bg-white text-black font-semibold flex items-center justify-center gap-2 hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="text-xs text-center mt-6" style={{ color: "#8A90B0" }}>
              By continuing, you agree to Pinnacle's Terms and Data Policy.
            </p>

            <p className="text-sm text-center mt-8" style={{ color: "#9EA3C6" }}>
              Already have an account?{" "}
              <button data-testid="register-switch-to-login" onClick={onSwitch} className="font-medium transition-opacity hover:opacity-70" style={{ color: "#A5B4FC" }}>Sign in</button>
            </p>
          </div>
        </div>
      </div>

      <AuthGraphShowcase />
    </div>
  );
}
