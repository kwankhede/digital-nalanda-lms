"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const ACCESS_KEY = "dn_access";
const REFRESH_KEY = "dn_refresh";

export interface Profile {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  gender: string;
  date_of_birth: string | null;
  city: string;
  district: string;
  state: string;
  education_level: string;
  profession: string;
  category: string;
  preferred_language: string;
  role: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  email_verified?: boolean;
}

interface AuthContextValue {
  user: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Profile | null>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<Profile>;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// --- token storage helpers (localStorage) ---
const getAccess = () =>
  typeof window === "undefined" ? null : localStorage.getItem(ACCESS_KEY);
const getRefresh = () =>
  typeof window === "undefined" ? null : localStorage.getItem(REFRESH_KEY);
const setTokens = (access: string, refresh: string) => {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
};
const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

// Parse DRF error responses into a single readable message.
async function errorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    const first = Object.values(data)[0];
    if (Array.isArray(first)) return String(first[0]);
    if (first) return String(first);
  } catch {
    /* ignore */
  }
  return fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async (): Promise<Profile | null> => {
    const access = getAccess();
    if (!access) return null;
    const res = await fetch(`${API_URL}/api/auth/me/`, {
      headers: { Authorization: `Bearer ${access}` },
    });
    if (res.ok) return res.json();
    // Try one refresh on 401.
    if (res.status === 401) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        const retry = await fetch(`${API_URL}/api/auth/me/`, {
          headers: { Authorization: `Bearer ${getAccess()}` },
        });
        if (retry.ok) return retry.json();
      }
    }
    clearTokens();
    return null;
  }, []);

  useEffect(() => {
    fetchMe()
      .then(setUser)
      .finally(() => setLoading(false));
  }, [fetchMe]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(await errorMessage(res, "Login failed"));
    const data = await res.json();
    setTokens(data.access, data.refresh);
    const me = await fetchMe();
    setUser(me);
    return me;
  };

  const register = async (data: RegisterData) => {
    const res = await fetch(`${API_URL}/api/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await errorMessage(res, "Registration failed"));
    const out = await res.json();
    setTokens(out.access, out.refresh);
    setUser(out.user);
  };

  const logout = async () => {
    const refresh = getRefresh();
    const access = getAccess();
    if (refresh && access) {
      await fetch(`${API_URL}/api/auth/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ refresh }),
      }).catch(() => undefined);
    }
    clearTokens();
    setUser(null);
  };

  const updateProfile = async (data: Partial<Profile>): Promise<Profile> => {
    const res = await fetch(`${API_URL}/api/auth/me/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccess()}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await errorMessage(res, "Update failed"));
    const updated = await res.json();
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

async function tryRefresh(): Promise<boolean> {
  const refresh = getRefresh();
  if (!refresh) return false;
  const res = await fetch(`${API_URL}/api/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  localStorage.setItem(ACCESS_KEY, data.access);
  if (data.refresh) localStorage.setItem(REFRESH_KEY, data.refresh);
  return true;
}

// Authenticated fetch: attaches the access token and retries once after a
// token refresh on 401. Use from client components for student APIs.
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const access = getAccess();
  if (access) headers.set("Authorization", `Bearer ${access}`);
  let res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (res.status === 401 && (await tryRefresh())) {
    headers.set("Authorization", `Bearer ${getAccess()}`);
    res = await fetch(`${API_URL}${path}`, { ...init, headers });
  }
  return res;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
