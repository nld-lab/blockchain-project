import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import type { AdminSession } from "@/types/election";
import { AdminAuthContext } from "./adminAuth";

const STORAGE_KEY = "vote.admin.session";

function readSession(): AdminSession | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const session = JSON.parse(stored) as AdminSession;
    return session.token && session.username ? session : null;
  } catch {
    return null;
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(readSession);
  const [loading, setLoading] = useState(() => Boolean(readSession()));

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  useEffect(() => {
    const stored = readSession();
    if (!stored) {
      return;
    }

    const verify = window.setTimeout(() => {
      void api
        .getAdminSession(stored.token)
        .then((current) => {
          const verified = { token: stored.token, username: current.username };
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(verified));
          setSession(verified);
        })
        .catch(clearSession)
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(verify);
  }, [clearSession]);

  const login = useCallback(async (username: string, password: string) => {
    const authenticated = await api.adminLogin(username, password);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(authenticated));
    setSession(authenticated);
  }, []);

  const logout = useCallback(async () => {
    if (session) {
      try {
        await api.adminLogout(session.token);
      } catch {
        // The local session is still removed if the backend is unavailable.
      }
    }
    clearSession();
  }, [clearSession, session]);

  const value = useMemo(
    () => ({ session, loading, login, logout, clearSession }),
    [session, loading, login, logout, clearSession],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
