import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  api,
  type ApiOfficer,
  type ApiReport,
  type ApiPayment,
  type ApiScan,
  type DashboardStats,
  type QrValidationResult,
} from "@/lib/api";

export type Officer = ApiOfficer;
export type Report = ApiReport;
export type Payment = ApiPayment;
export type ScanRecord = ApiScan;

interface AppContextType {
  officers: Officer[];
  reports: Report[];
  scanHistory: ScanRecord[];
  payments: Payment[];
  userRole: "public" | "admin" | "officer";
  roleChosen: boolean;
  authToken: string | null;
  authUser: { id: number; username: string; fullName: string; role: string } | null;
  demoUser: { name: string; email: string; provider: "email" | "google" } | null;
  points: number;
  setUserRole: (role: "public" | "admin" | "officer") => void;
  resetRole: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signInDemo: (data: { name: string; email: string; provider: "email" | "google" }) => Promise<void>;
  signOutDemo: () => Promise<void>;
  deviceId: string;
  scanLocked: boolean;
  setScanLocked: (locked: boolean) => void;
  addOfficer: (data: { name: string; area: string; location: string; phone: string }) => Promise<Officer>;
  removeOfficer: (id: number) => Promise<void>;
  updateOfficer: (id: number, data: Partial<Officer>) => Promise<Officer>;
  addReport: (data: { type: string; description: string; photoUrl?: string | null; latitude?: number | null; longitude?: number | null; address?: string | null; relatedQrCode?: string | null; reporterDeviceId?: string }) => Promise<Report>;
  updateReportStatus: (id: number, status: string, adminNotes?: string) => Promise<void>;
  addPayment: (data: { officerId?: number | null; officerName: string; amount: number; method?: string; area?: string; plateNumber?: string; duration?: number; deviceId?: string }) => Promise<Payment>;
  addPoints: (amount: number) => void;
  addPointsForVehicle: (vehicleType: "motor" | "mobil") => void;
  redeemPoints: (cost: number) => boolean;
  validateQR: (qrCode: string) => Promise<QrValidationResult>;
  refreshData: () => Promise<void>;
  dashboardStats: DashboardStats;
  loading: boolean;
}

const defaultStats: DashboardStats = {
  totalScans: 0,
  validScans: 0,
  invalidScans: 0,
  totalReports: 0,
  pendingReports: 0,
  totalPayments: 0,
  totalRevenue: 0,
  activeOfficers: 0,
  todayScans: 0,
  todayPayments: 0,
  todayRevenue: 0,
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [userRole, setUserRoleState] = useState<"public" | "admin" | "officer">("public");
  const [roleChosen, setRoleChosen] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<{ id: number; username: string; fullName: string; role: string } | null>(null);
  const [demoUser, setDemoUser] = useState<{ name: string; email: string; provider: "email" | "google" } | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(defaultStats);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deviceId, setDeviceId] = useState<string>("");
  const [scanLocked, setScanLocked] = useState(false);

  useEffect(() => {
    loadInitialData();
    ensureDeviceId();
  }, []);

  const ensureDeviceId = async () => {
    try {
      let id = await AsyncStorage.getItem("deviceId");
      if (!id) {
        id = `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        await AsyncStorage.setItem("deviceId", id);
      }
      setDeviceId(id);
    } catch {}
  };

  const loadInitialData = async () => {
    try {
      const [storedToken, storedUser, storedRole, storedPoints, storedRoleChosen, storedDemoUser] = await Promise.all([
        AsyncStorage.getItem("authToken"),
        AsyncStorage.getItem("authUser"),
        AsyncStorage.getItem("userRole"),
        AsyncStorage.getItem("parkingPoints"),
        AsyncStorage.getItem("roleChosen"),
        AsyncStorage.getItem("demoUser"),
      ]);

      if (storedToken) setAuthToken(storedToken);
      if (storedUser) setAuthUser(JSON.parse(storedUser));
      if (storedRole) setUserRoleState(storedRole as "public" | "admin" | "officer");
      if (storedPoints) setPoints(Number(storedPoints) || 0);
      if (storedRoleChosen === "1") setRoleChosen(true);
      if (storedDemoUser) {
        try { setDemoUser(JSON.parse(storedDemoUser)); } catch {}
      }

      const role = (storedRole as "public" | "admin" | "officer") || "public";
      const did = await AsyncStorage.getItem("deviceId");
      const scopedDeviceId = role === "admin" ? undefined : (did || undefined);

      const results = await Promise.allSettled([
        api.getOfficers(),
        api.getReports(scopedDeviceId ? { deviceId: scopedDeviceId } : undefined),
        api.getPayments(scopedDeviceId ? { deviceId: scopedDeviceId } : undefined),
        api.getRecentScans(50),
        api.getDashboardStats(),
      ]);

      const allFailed = results.every((r) => r.status === "rejected");

      if (allFailed) {
        console.log("All API calls failed, loading from cache");
        await loadFromCache();
      } else {
        const [officersResult, reportsResult, paymentsResult, scansResult, statsResult] = results;
        if (officersResult.status === "fulfilled" && officersResult.value) {
          setOfficers(officersResult.value);
          saveToCache("officers", officersResult.value);
        }
        if (reportsResult.status === "fulfilled" && reportsResult.value) {
          setReports(reportsResult.value);
          saveToCache("reports", reportsResult.value);
        }
        if (paymentsResult.status === "fulfilled" && paymentsResult.value) {
          setPayments(paymentsResult.value);
          saveToCache("payments", paymentsResult.value);
        }
        if (scansResult.status === "fulfilled" && scansResult.value) {
          setScanHistory(scansResult.value);
          saveToCache("scans", scansResult.value);
        }
        if (statsResult.status === "fulfilled" && statsResult.value) {
          setDashboardStats(statsResult.value);
        }
      }
    } catch (err) {
      console.log("Failed to load initial data, using cache:", err);
      await loadFromCache();
    } finally {
      setLoading(false);
    }
  };

  const loadFromCache = async () => {
    try {
      const [cachedOfficers, cachedReports, cachedPayments, cachedScans] = await Promise.all([
        AsyncStorage.getItem("cache_officers"),
        AsyncStorage.getItem("cache_reports"),
        AsyncStorage.getItem("cache_payments"),
        AsyncStorage.getItem("cache_scans"),
      ]);
      if (cachedOfficers) setOfficers(JSON.parse(cachedOfficers));
      if (cachedReports) setReports(JSON.parse(cachedReports));
      if (cachedPayments) setPayments(JSON.parse(cachedPayments));
      if (cachedScans) setScanHistory(JSON.parse(cachedScans));
    } catch {}
  };

  const saveToCache = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(data));
    } catch {}
  };

  const fetchAllData = async () => {
    try {
      const scoped = userRole === "admin" ? undefined : (deviceId || undefined);
      const [officersData, reportsData, paymentsData, scansData, stats] = await Promise.all([
        api.getOfficers().catch(() => null),
        api.getReports(scoped ? { deviceId: scoped } : undefined).catch(() => null),
        api.getPayments(scoped ? { deviceId: scoped } : undefined).catch(() => null),
        api.getRecentScans(50).catch(() => null),
        api.getDashboardStats().catch(() => null),
      ]);

      if (officersData) {
        setOfficers(officersData);
        saveToCache("officers", officersData);
      }
      if (reportsData) {
        setReports(reportsData);
        saveToCache("reports", reportsData);
      }
      if (paymentsData) {
        setPayments(paymentsData);
        saveToCache("payments", paymentsData);
      }
      if (scansData) {
        setScanHistory(scansData);
        saveToCache("scans", scansData);
      }
      if (stats) {
        setDashboardStats(stats);
      }
    } catch (err) {
      console.log("Failed to fetch data from server:", err);
    }
  };

  const refreshData = useCallback(async () => {
    await fetchAllData();
  }, []);

  const setUserRole = useCallback(async (role: "public" | "admin" | "officer") => {
    setUserRoleState(role);
    setRoleChosen(true);
    await AsyncStorage.multiSet([
      ["userRole", role],
      ["roleChosen", "1"],
    ]);
  }, []);

  const resetRole = useCallback(async () => {
    setAuthToken(null);
    setAuthUser(null);
    setDemoUser(null);
    setUserRoleState("public");
    setRoleChosen(false);
    await Promise.all([
      AsyncStorage.removeItem("authToken"),
      AsyncStorage.removeItem("authUser"),
      AsyncStorage.removeItem("userRole"),
      AsyncStorage.removeItem("roleChosen"),
      AsyncStorage.removeItem("demoUser"),
    ]);
  }, []);

  const signInDemo = useCallback(async (data: { name: string; email: string; provider: "email" | "google" }) => {
    setDemoUser(data);
    setUserRoleState("public");
    setRoleChosen(true);
    await Promise.all([
      AsyncStorage.setItem("demoUser", JSON.stringify(data)),
      AsyncStorage.setItem("userRole", "public"),
      AsyncStorage.setItem("roleChosen", "1"),
    ]);
  }, []);

  const signOutDemo = useCallback(async () => {
    setDemoUser(null);
    await AsyncStorage.removeItem("demoUser");
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const response = await api.login(username, password);
    setAuthToken(response.token);
    setAuthUser(response.user);
    await AsyncStorage.setItem("authToken", response.token);
    await AsyncStorage.setItem("authUser", JSON.stringify(response.user));
    if (response.user.role === "admin" || response.user.role === "superadmin") {
      setUserRoleState("admin");
      setRoleChosen(true);
      await AsyncStorage.multiSet([["userRole", "admin"], ["roleChosen", "1"]]);
    } else if (response.user.role === "officer") {
      setUserRoleState("officer");
      setRoleChosen(true);
      await AsyncStorage.multiSet([["userRole", "officer"], ["roleChosen", "1"]]);
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthToken(null);
    setAuthUser(null);
    setDemoUser(null);
    setUserRoleState("public");
    setRoleChosen(false);
    await Promise.all([
      AsyncStorage.removeItem("authToken"),
      AsyncStorage.removeItem("authUser"),
      AsyncStorage.removeItem("userRole"),
      AsyncStorage.removeItem("roleChosen"),
      AsyncStorage.removeItem("demoUser"),
    ]);
  }, []);

  const validateQR = useCallback(async (qrCode: string): Promise<QrValidationResult> => {
    try {
      const result = await api.validateQr(qrCode);
      await fetchAllData();
      return result;
    } catch {
      const localOfficer = officers.find((o) => o.qrCode === qrCode && o.status === "active");
      if (localOfficer) {
        return {
          isValid: true,
          message: "QR code valid (offline)",
          officer: {
            id: localOfficer.id,
            name: localOfficer.name,
            badgeNumber: localOfficer.badgeNumber,
            area: localOfficer.area,
            location: localOfficer.location,
            rate: localOfficer.rate,
            status: localOfficer.status,
          },
        };
      }
      return { isValid: false, message: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.", officer: null };
    }
  }, [officers]);

  const addOfficer = useCallback(async (data: { name: string; area: string; location: string; phone: string }): Promise<Officer> => {
    if (!authToken) throw new Error("Silakan login sebagai admin terlebih dahulu");
    const officer = await api.createOfficer(data, authToken);
    setOfficers((prev) => [officer, ...prev]);
    return officer;
  }, [authToken]);

  const removeOfficer = useCallback(async (id: number) => {
    if (!authToken) throw new Error("Silakan login sebagai admin terlebih dahulu");
    await api.deleteOfficer(id, authToken);
    setOfficers((prev) => prev.filter((o) => o.id !== id));
  }, [authToken]);

  const updateOfficer = useCallback(async (id: number, data: Partial<Officer>): Promise<Officer> => {
    if (!authToken) throw new Error("Silakan login sebagai admin terlebih dahulu");
    const officer = await api.updateOfficer(id, data, authToken);
    setOfficers((prev) => prev.map((o) => (o.id === id ? officer : o)));
    return officer;
  }, [authToken]);

  const addReport = useCallback(async (data: { type: string; description: string; photoUrl?: string | null; latitude?: number | null; longitude?: number | null; address?: string | null; relatedQrCode?: string | null }): Promise<Report> => {
    const report = await api.createReport(data);
    setReports((prev) => [report, ...prev]);
    return report;
  }, []);

  const updateReportStatus = useCallback(async (id: number, status: string, adminNotes?: string) => {
    if (!authToken) throw new Error("Silakan login sebagai admin terlebih dahulu");
    const updated = await api.updateReportStatus(id, status, adminNotes, authToken);
    setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }, [authToken]);

  const addPayment = useCallback(async (data: { officerId?: number | null; officerName: string; amount: number; method?: string; area?: string; plateNumber?: string; duration?: number }): Promise<Payment> => {
    const payment = await api.createPayment(data);
    setPayments((prev) => [payment, ...prev]);
    await fetchAllData();
    return payment;
  }, []);

  const addPoints = useCallback((amount: number) => {
    setPoints((prev) => {
      const newTotal = prev + amount;
      AsyncStorage.setItem("parkingPoints", String(newTotal)).catch(() => {});
      return newTotal;
    });
  }, []);

  const addPointsForVehicle = useCallback((vehicleType: "motor" | "mobil") => {
    const earned = vehicleType === "mobil" ? 2 : 1;
    setPoints((prev) => {
      const newTotal = prev + earned;
      AsyncStorage.setItem("parkingPoints", String(newTotal)).catch(() => {});
      return newTotal;
    });
  }, []);

  const redeemPoints = useCallback((cost: number) => {
    if (points < cost) return false;
    const newTotal = points - cost;
    setPoints(newTotal);
    AsyncStorage.setItem("parkingPoints", String(newTotal)).catch(() => {});
    return true;
  }, [points]);

  return (
    <AppContext.Provider
      value={{
        officers,
        reports,
        scanHistory,
        payments,
        userRole,
        roleChosen,
        authToken,
        authUser,
        demoUser,
        points,
        setUserRole,
        resetRole,
        login,
        logout,
        signInDemo,
        signOutDemo,
        addOfficer,
        removeOfficer,
        updateOfficer,
        addReport,
        updateReportStatus,
        addPayment,
        addPoints,
        addPointsForVehicle,
        redeemPoints,
        deviceId,
        scanLocked,
        setScanLocked,
        validateQR,
        refreshData,
        dashboardStats,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
