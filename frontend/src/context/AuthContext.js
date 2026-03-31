import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_BACKEND_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (token) {
      axios
        .get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const u = res.data;
          setUser({ ...u, isSubscribed: !!(u.is_subscribed || u.isSubscribed) });
        })
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem("token", access_token);
    setToken(access_token);
    setUser({ ...userData, isSubscribed: !!(userData.is_subscribed || userData.isSubscribed) });
    return userData;
  };

  const register = async (email, password, nickname = null) => {
    const res = await axios.post(`${API_URL}/api/auth/register`, { email, password, nickname });
    const { access_token, user: userData } = res.data;
    localStorage.setItem("token", access_token);
    setToken(access_token);
    setUser({ ...userData, isSubscribed: !!(userData.is_subscribed || userData.isSubscribed) });
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isLoggedIn: !!user,
    isSubscribed: !!user?.isSubscribed,
    showUpgradeModal,
    setShowUpgradeModal
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
