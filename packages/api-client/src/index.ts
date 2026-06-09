const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ── Request types ──────────────────────────────────────────────────────────────

export interface RegisterReq {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  terms_accepted: boolean;
  marketing_consent: boolean;
}

export interface LoginReq {
  email: string;
  password: string;
}

export interface OTPVerifyReq {
  session_token: string;
  otp: string;
  device_id?: string;
}

// ── Response types ─────────────────────────────────────────────────────────────

export interface UserDTO {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  is_email_verified: boolean;
  profile_completed: boolean;
  is_buyer: boolean;
  is_vendor: boolean;
}

export interface AuthResp {
  access_token: string;
  user: UserDTO;
}

export interface OTPRequestResp {
  session_token: string;
  expires_in: number;
}

// ── Error class ────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fields?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Fetch wrapper ──────────────────────────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string; fields?: Array<{ field: string; message: string }> };
    throw new ApiError(res.status, body.error ?? res.statusText, body.fields);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Auth API ───────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: RegisterReq) =>
    request<AuthResp>("/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: LoginReq) =>
    request<AuthResp>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  requestOTP: (email: string) =>
    request<OTPRequestResp>("/v1/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  verifyOTP: (data: OTPVerifyReq) =>
    request<AuthResp>("/v1/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  refreshTokens: () =>
    request<AuthResp>("/v1/auth/token/refresh", {
      method: "POST",
    }),

  logout: () =>
    request<void>("/v1/auth/logout", {
      method: "POST",
    }),
};
