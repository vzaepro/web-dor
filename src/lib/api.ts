// src/lib/api.ts
// Minimal fetch wrapper + token store lokal (localStorage)

const BASE = import.meta.env.VITE_API_BASE as string; // contoh: "https://web-dor.up.railway.app"

type Tokens = {
  id_token: string;
  access_token: string;
  refresh_token: string;
};

let TOKENS: Tokens | null = null;

export function setTokens(t: Tokens) {
  TOKENS = t;
  localStorage.setItem("myxl_tokens", JSON.stringify(t));
}

export function loadTokens(): Tokens | null {
  if (TOKENS) return TOKENS;
  const raw = localStorage.getItem("myxl_tokens");
  if (!raw) return null;
  try {
    TOKENS = JSON.parse(raw);
    return TOKENS;
  } catch {
    localStorage.removeItem("myxl_tokens");
    return null;
  }
}

export function clearTokens() {
  TOKENS = null;
  localStorage.removeItem("myxl_tokens");
}

async function api<T>(
  path: string,
  opts: RequestInit = {},
  useAuth: boolean = true,
  retryOn401: boolean = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as any),
  };

  const t = loadTokens();
  if (useAuth && t?.id_token) {
    headers["Authorization"] = `Bearer ${t.id_token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...opts, headers });

  // auto-refresh kalau 401
  if (res.status === 401 && retryOn401 && t?.refresh_token) {
    const rr = await fetch(`${BASE}/auth/token/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: t.refresh_token }),
    });

    if (rr.ok) {
      const nt = (await rr.json()) as any;
      setTokens({
        id_token: nt.id_token,
        access_token: nt.access_token,
        refresh_token: nt.refresh_token ?? t.refresh_token,
      });
      // ulangi request sekali
      return api<T>(path, opts, useAuth, false);
    } else {
      clearTokens();
      throw new Error("Session expired. Please login again.");
    }
  }

  if (!res.ok) {
    // coba ambil detail error dari backend
    let msg = res.statusText;
    try {
      const j = await res.json();
      msg = JSON.stringify(j);
    } catch {
      try {
        msg = await res.text();
      } catch {}
    }
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }

  // parse json normal
  return res.json();
}

/** ========== Public API calls ========== **/

export async function requestOtp(contact: string) {
  return api<{ subscriber_id: string }>(`/auth/otp`, {
    method: "POST",
    body: JSON.stringify({ contact }),
  }, /*useAuth*/ false);
}

export async function submitOtp(contact: string, code: string) {
  const data = await api<any>(`/auth/token`, {
    method: "POST",
    body: JSON.stringify({ contact, code }),
  }, false);
  // simpan tokens untuk request berikutnya
  setTokens({
    id_token: data.id_token,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });
  return data;
}

export async function getBalance() {
  // id_token otomatis dikirim via Authorization: Bearer
  return api<any>(`/balance`, { method: "GET" });
}

export async function getProfile() {
  const t = loadTokens();
  if (!t?.access_token) throw new Error("No access_token. Login first.");
  const q = new URLSearchParams({ access_token: t.access_token });
  return api<any>(`/profile?${q.toString()}`, { method: "GET" });
}

export const tokenStore = {
  get: loadTokens,
  set: setTokens,
  clear: clearTokens,
};
