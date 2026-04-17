import { Platform } from "react-native";

const getBaseUrl = () => {
  if (Platform.OS === "web") {
    return "/api";
  }
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit;
  const replitDomain = process.env.EXPO_PUBLIC_DOMAIN;
  if (replitDomain) return `https://${replitDomain}/api`;
  return "http://localhost:8080/api";
};

const BASE_URL = getBaseUrl();

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export interface ApiOfficer {
  id: number;
  nip: string;
  name: string;
  badgeNumber: string;
  qrCode: string;
  area: string;
  location: string;
  rate: number;
  status: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiReport {
  id: number;
  ticketNumber: string;
  type: string;
  description: string;
  photoUrl: string | null;
  latitude: string | null;
  longitude: string | null;
  address: string | null;
  status: string;
  adminNotes: string | null;
  reporterDeviceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiPayment {
  id: number;
  transactionId: string;
  officerId: number | null;
  officerName: string;
  amount: number;
  method: string;
  status: string;
  area: string | null;
  createdAt: string;
}

export interface ApiScan {
  id: number;
  qrCode: string;
  isValid: boolean;
  officerId: number | null;
  officerName: string | null;
  location: string | null;
  scannedAt: string;
}

export interface ApiOfficerQrCode {
  id: number;
  vehicleType: string;
  vehicleLabel: string;
  qrCode: string;
  rate: number;
  status: string;
}

export interface QrValidationResult {
  isValid: boolean;
  message: string;
  vehicleType?: string | null;
  vehicleLabel?: string | null;
  rate?: number | null;
  officer: {
    id: number;
    name: string;
    badgeNumber: string;
    area: string;
    location: string;
    rate: number;
    status: string;
  } | null;
}

export interface MyQrCodesResult {
  officer: {
    id: number;
    name: string;
    badgeNumber: string;
    area: string;
    location: string;
  };
  qrCodes: ApiOfficerQrCode[];
}

export interface DashboardStats {
  totalScans: number;
  validScans: number;
  invalidScans: number;
  totalReports: number;
  pendingReports: number;
  totalPayments: number;
  totalRevenue: number;
  activeOfficers: number;
  todayScans: number;
  todayPayments: number;
  todayRevenue: number;
}

export interface AuthResponse {
  token: string;
  user: { id: number; username: string; fullName: string; role: string };
}

export const api = {
  validateQr: (qrCode: string, deviceId?: string) =>
    request<QrValidationResult>("/qr/validate", {
      method: "POST",
      body: JSON.stringify({ qrCode, deviceId }),
    }),

  getOfficers: () => request<ApiOfficer[]>("/officers"),

  getOfficer: (id: number) => request<ApiOfficer>(`/officers/${id}`),

  getNextBadge: (token: string) =>
    request<{ badgeNumber: string }>("/officers/next-badge", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  createOfficer: (data: any, token: string) =>
    request<ApiOfficer>("/officers", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),

  updateOfficer: (id: number, data: any, token: string) =>
    request<ApiOfficer>(`/officers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),

  deleteOfficer: (id: number, token: string) =>
    request<{ message: string }>(`/officers/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),

  getReports: (params?: { status?: string; type?: string; deviceId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.type) qs.set("type", params.type);
    if (params?.deviceId) qs.set("deviceId", params.deviceId);
    const query = qs.toString();
    return request<ApiReport[]>(`/reports${query ? `?${query}` : ""}`);
  },

  getReport: (id: number) => request<ApiReport>(`/reports/${id}`),

  createReport: (data: any) =>
    request<ApiReport>("/reports", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateReportStatus: (id: number, status: string, adminNotes: string | undefined, token: string) =>
    request<ApiReport>(`/reports/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, adminNotes }),
      headers: { Authorization: `Bearer ${token}` },
    }),

  getPayments: (params?: { deviceId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.deviceId) qs.set("deviceId", params.deviceId);
    const query = qs.toString();
    return request<ApiPayment[]>(`/payments${query ? `?${query}` : ""}`);
  },

  createPayment: (data: any) =>
    request<ApiPayment>("/payments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getDashboardStats: () => request<DashboardStats>("/dashboard/stats"),

  getRecentScans: (limit = 10) => request<ApiScan[]>(`/dashboard/recent-scans?limit=${limit}`),

  getRecentReports: (limit = 10) => request<ApiReport[]>(`/dashboard/recent-reports?limit=${limit}`),

  login: (username: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  register: (data: any) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  seed: () => request<any>("/seed", { method: "POST" }),

  getMyQrCodes: (token: string) =>
    request<MyQrCodesResult>("/qr/my-codes", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  recordCashPayment: (token: string, vehicleType: string) =>
    request<{ message: string; payment: ApiPayment; vehicleLabel: string }>("/qr/cash-payment", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ vehicleType }),
    }),
};
