import { createContext, useContext } from "react";
import type { AdminSession } from "@/types/election";

export type AdminAuthContextValue = {
  session: AdminSession | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
};

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth doit être utilisé dans AdminAuthProvider.");
  }
  return context;
}
