import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  fetchMe,
  login as apiLogin,
  logout as apiLogout,
  registerUser,
  type LoginPayload,
  type RegisterPayload,
} from "../api/auth";
import { getToken } from "../api/client";
import type { User } from "../types/user";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => apiLogout())
      .finally(() => setLoading(false));
  }, []);

  async function login(payload: LoginPayload) {
    const me = await apiLogin(payload);
    setUser(me);
  }

  async function register(payload: RegisterPayload) {
    await registerUser(payload);
    await login({ email: payload.email, password: payload.password });
  }

  function logout() {
    apiLogout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
