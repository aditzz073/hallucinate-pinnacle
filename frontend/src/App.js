import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";

function AppContent() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState("login");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="loading-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-[0.2em]">Loading</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return authMode === "login" ? (
      <LoginPage onSwitch={() => setAuthMode("register")} />
    ) : (
      <RegisterPage onSwitch={() => setAuthMode("login")} />
    );
  }

  return <Layout />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
