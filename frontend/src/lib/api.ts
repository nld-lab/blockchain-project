import type { AdminSession, ApiError, Block, Election, Transaction, VoterStatus } from "@/types/election";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.token) headers["Authorization"] = `Bearer ${options.token}`;

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
    message?: string;
    details?: unknown;
  };

  if (!response.ok) {
    const error = new Error(data.message || "Une erreur est survenue.") as ApiError;
    error.code = data.error || "HTTP_ERROR";
    error.status = response.status;
    error.details = data.details;
    throw error;
  }
  return data;
}

export const api = {
  getElection: () => request<Election>("/api/election"),
  adminLogin: (username: string, password: string) =>
    request<AdminSession>("/api/admin/login", {
      method: "POST",
      body: { username, password },
    }),
  getAdminSession: (token: string) =>
    request<{ username: string }>("/api/admin/me", { token }),
  adminLogout: (token: string) =>
    request<{ status: string }>("/api/admin/logout", {
      method: "POST",
      token,
    }),
  identify: (idNumber: string, fullName: string) =>
    request<VoterStatus>("/api/voters/identify", {
      method: "POST",
      body: { idNumber, fullName },
    }),
  vote: (idNumber: string, fullName: string, choiceId: number) =>
    request<{ txHash: string; status: string }>("/api/votes", {
      method: "POST",
      body: { idNumber, fullName, choiceId },
    }),
  getTransactions: () => request<{ transactions: Transaction[] }>("/api/election/transactions"),
  getBlocks: () => request<{ blocks: Block[] }>("/api/blocks?limit=40"),
  createElection: (token: string, title: string, choices: string[]) =>
    request<{ txHash: string }>("/api/admin/election", {
      method: "POST",
      token,
      body: { title, choices },
    }),
  openElection: (token: string) =>
    request<{ txHash: string }>("/api/admin/election/open", { method: "POST", token }),
  closeElection: (token: string) =>
    request<{ txHash: string }>("/api/admin/election/close", { method: "POST", token }),
  publishResults: (token: string) =>
    request<{ txHash: string }>("/api/admin/election/publish-results", {
      method: "POST",
      token,
    }),
};
