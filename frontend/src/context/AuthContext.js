import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { normalizeUserAccess } from "../utils/featureAccess";

const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_BACKEND_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const normalizeAndSetUser = useCallback((rawUser) => {
    if (!rawUser) {
      setUser(null);
      return null;
    }

    const normalizedUser = {
      ...normalizeUserAccess(rawUser),
      isLoggedIn: true,
    };
    setUser(normalizedUser);
    return normalizedUser;
  }, []);

  const refreshUser = useCallback(async (activeToken = token) => {
    if (!activeToken) {
      setUser(null);
      return null;
    }

    const res = await axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${activeToken}` },
    });

    return normalizeAndSetUser(res.data);
  }, [normalizeAndSetUser, token]);

  useEffect(() => {
    let isCancelled = false;

    if (token) {
      setLoading(true);
      refreshUser(token)
        .catch(() => {
          if (isCancelled) return;
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          if (!isCancelled) {
            setLoading(false);
          }
        });
    } else {
      setUser(null);
      setLoading(false);
    }

    return () => {
      isCancelled = true;
    };
  }, [refreshUser, token]);

  useEffect(() => {
    if (!token) return undefined;

    const syncUser = () => {
      refreshUser(token).catch((error) => {
        if (error?.response?.status === 401) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }

        // Background sync should not interrupt active UX for transient failures.
      });
    };

    window.addEventListener("focus", syncUser);
    const intervalId = window.setInterval(syncUser, 30000);

    return () => {
      window.removeEventListener("focus", syncUser);
      window.clearInterval(intervalId);
    };
  }, [refreshUser, token]);

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    const { access_token } = res.data;
    localStorage.setItem("token", access_token);
    setToken(access_token);

    setLoading(true);
    try {
      return await refreshUser(access_token);
    } catch (error) {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, nickname = null) => {
    const res = await axios.post(`${API_URL}/api/auth/register`, { email, password, nickname });
    const { access_token } = res.data;
    localStorage.setItem("token", access_token);
    setToken(access_token);

    setLoading(true);
    try {
      return await refreshUser(access_token);
    } catch (error) {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isLoggedIn: Boolean(user?.isLoggedIn),
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
