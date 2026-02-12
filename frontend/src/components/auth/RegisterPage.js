import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, ArrowRight, Zap } from "lucide-react";

export default function RegisterPage({ onSwitch }) {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPw) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(email, password);
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="register-page">
      {/* Left - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-10">
          {/* Logo */}
          <div className="flex items-center gap-3" data-testid="register-logo">
            <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">Pinnacle.AI</span>
          </div>

          <div>
            <h1 className="font-heading font-bold text-3xl tracking-tight mb-2">Create your account</h1>
            <p className="text-muted-foreground text-sm">Start optimizing your AI discoverability</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="register-form">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-md" data-testid="register-error">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-[0.1em] font-mono">Email</label>
              <input
                data-testid="register-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors duration-200"
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-[0.1em] font-mono">Password</label>
              <div className="relative">
                <input
                  data-testid="register-password-input"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors duration-200"
                  placeholder="Min 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  data-testid="register-toggle-password"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-[0.1em] font-mono">Confirm Password</label>
              <input
                data-testid="register-confirm-password-input"
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors duration-200"
                placeholder="Re-enter password"
                required
              />
            </div>

            <button
              data-testid="register-submit-button"
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-primary-foreground font-medium rounded-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-[0_0_20px_rgba(79,70,229,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <button
              data-testid="register-switch-to-login"
              onClick={onSwitch}
              className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>

      {/* Right - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/80 z-10" />
        <img
          src="https://images.unsplash.com/photo-1762278804941-27ff5cba5a2e?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200"
          alt="Abstract"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-12 left-12 right-12 z-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">AI Engine Optimization</p>
          <h2 className="font-heading font-bold text-2xl tracking-tight leading-tight">
            Get discovered by AI-powered search engines.
          </h2>
        </div>
      </div>
    </div>
  );
}
