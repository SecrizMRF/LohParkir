import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface Officer {
  id: string;
  name: string;
  badgeNumber: string;
  qrCode: string;
  area: string;
  location: string;
  rate: number;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Report {
  id: string;
  ticketNumber: string;
  type: "illegal_parking" | "fake_qr";
  photoUri: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string;
  status: "pending" | "in_progress" | "resolved";
  createdAt: string;
}

export interface ScanRecord {
  id: string;
  qrCode: string;
  officerName: string | null;
  location: string | null;
  isValid: boolean;
  scannedAt: string;
}

export interface Payment {
  id: string;
  officerId: string;
  officerName: string;
  amount: number;
  status: "pending" | "completed";
  createdAt: string;
}

interface AppContextType {
  officers: Officer[];
  reports: Report[];
  scanHistory: ScanRecord[];
  payments: Payment[];
  userRole: "public" | "admin";
  setUserRole: (role: "public" | "admin") => void;
  addOfficer: (officer: Omit<Officer, "id" | "qrCode" | "createdAt">) => Promise<Officer>;
  removeOfficer: (id: string) => Promise<void>;
  addReport: (report: Omit<Report, "id" | "ticketNumber" | "status" | "createdAt">) => Promise<Report>;
  updateReportStatus: (id: string, status: Report["status"]) => Promise<void>;
  addScanRecord: (record: Omit<ScanRecord, "id" | "scannedAt">) => Promise<void>;
  addPayment: (payment: Omit<Payment, "id" | "status" | "createdAt">) => Promise<Payment>;
  validateQR: (qrCode: string) => Officer | null;
  dashboardStats: {
    totalScans: number;
    validScans: number;
    invalidScans: number;
    totalReports: number;
    pendingReports: number;
    totalPayments: number;
    totalRevenue: number;
    activeOfficers: number;
  };
}

const AppContext = createContext<AppContextType | null>(null);

const SEED_OFFICERS: Officer[] = [
  {
    id: "off-001",
    name: "Budi Santoso",
    badgeNumber: "DSH-2024-001",
    qrCode: "LOHPARKIR-DSH-2024-001",
    area: "Zona A - Jl. Sudirman",
    location: "Jl. Jend. Sudirman No. 1-50",
    rate: 3000,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "off-002",
    name: "Siti Rahayu",
    badgeNumber: "DSH-2024-002",
    qrCode: "LOHPARKIR-DSH-2024-002",
    area: "Zona B - Jl. Thamrin",
    location: "Jl. MH Thamrin No. 1-30",
    rate: 5000,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "off-003",
    name: "Ahmad Wijaya",
    badgeNumber: "DSH-2024-003",
    qrCode: "LOHPARKIR-DSH-2024-003",
    area: "Zona C - Jl. Gatot Subroto",
    location: "Jl. Gatot Subroto No. 10-80",
    rate: 3000,
    status: "active",
    createdAt: new Date().toISOString(),
  },
];

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function generateTicketNumber() {
  const date = new Date();
  const prefix = "LP";
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}-${dateStr}-${rand}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [officers, setOfficers] = useState<Officer[]>(SEED_OFFICERS);
  const [reports, setReports] = useState<Report[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [userRole, setUserRole] = useState<"public" | "admin">("public");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedOfficers, storedReports, storedScans, storedPayments, storedRole] =
        await Promise.all([
          AsyncStorage.getItem("officers"),
          AsyncStorage.getItem("reports"),
          AsyncStorage.getItem("scanHistory"),
          AsyncStorage.getItem("payments"),
          AsyncStorage.getItem("userRole"),
        ]);

      if (storedOfficers) setOfficers(JSON.parse(storedOfficers));
      else await AsyncStorage.setItem("officers", JSON.stringify(SEED_OFFICERS));
      if (storedReports) setReports(JSON.parse(storedReports));
      if (storedScans) setScanHistory(JSON.parse(storedScans));
      if (storedPayments) setPayments(JSON.parse(storedPayments));
      if (storedRole) setUserRole(storedRole as "public" | "admin");
    } catch {}
  };

  const saveOfficers = async (data: Officer[]) => {
    setOfficers(data);
    await AsyncStorage.setItem("officers", JSON.stringify(data));
  };

  const saveReports = async (data: Report[]) => {
    setReports(data);
    await AsyncStorage.setItem("reports", JSON.stringify(data));
  };

  const saveScanHistory = async (data: ScanRecord[]) => {
    setScanHistory(data);
    await AsyncStorage.setItem("scanHistory", JSON.stringify(data));
  };

  const savePayments = async (data: Payment[]) => {
    setPayments(data);
    await AsyncStorage.setItem("payments", JSON.stringify(data));
  };

  const handleSetUserRole = useCallback(async (role: "public" | "admin") => {
    setUserRole(role);
    await AsyncStorage.setItem("userRole", role);
  }, []);

  const validateQR = useCallback(
    (qrCode: string): Officer | null => {
      return officers.find((o) => o.qrCode === qrCode && o.status === "active") || null;
    },
    [officers],
  );

  const addOfficer = useCallback(
    async (data: Omit<Officer, "id" | "qrCode" | "createdAt">): Promise<Officer> => {
      const officer: Officer = {
        ...data,
        id: generateId(),
        qrCode: `LOHPARKIR-${data.badgeNumber}`,
        createdAt: new Date().toISOString(),
      };
      const updated = [...officers, officer];
      await saveOfficers(updated);
      return officer;
    },
    [officers],
  );

  const removeOfficer = useCallback(
    async (id: string) => {
      const updated = officers.filter((o) => o.id !== id);
      await saveOfficers(updated);
    },
    [officers],
  );

  const addReport = useCallback(
    async (data: Omit<Report, "id" | "ticketNumber" | "status" | "createdAt">): Promise<Report> => {
      const report: Report = {
        ...data,
        id: generateId(),
        ticketNumber: generateTicketNumber(),
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      const updated = [report, ...reports];
      await saveReports(updated);
      return report;
    },
    [reports],
  );

  const updateReportStatus = useCallback(
    async (id: string, status: Report["status"]) => {
      const updated = reports.map((r) => (r.id === id ? { ...r, status } : r));
      await saveReports(updated);
    },
    [reports],
  );

  const addScanRecord = useCallback(
    async (record: Omit<ScanRecord, "id" | "scannedAt">) => {
      const newRecord: ScanRecord = {
        ...record,
        id: generateId(),
        scannedAt: new Date().toISOString(),
      };
      const updated = [newRecord, ...scanHistory];
      await saveScanHistory(updated);
    },
    [scanHistory],
  );

  const addPayment = useCallback(
    async (data: Omit<Payment, "id" | "status" | "createdAt">): Promise<Payment> => {
      const payment: Payment = {
        ...data,
        id: generateId(),
        status: "completed",
        createdAt: new Date().toISOString(),
      };
      const updated = [payment, ...payments];
      await savePayments(updated);
      return payment;
    },
    [payments],
  );

  const dashboardStats = {
    totalScans: scanHistory.length,
    validScans: scanHistory.filter((s) => s.isValid).length,
    invalidScans: scanHistory.filter((s) => !s.isValid).length,
    totalReports: reports.length,
    pendingReports: reports.filter((r) => r.status === "pending").length,
    totalPayments: payments.length,
    totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
    activeOfficers: officers.filter((o) => o.status === "active").length,
  };

  return (
    <AppContext.Provider
      value={{
        officers,
        reports,
        scanHistory,
        payments,
        userRole,
        setUserRole: handleSetUserRole,
        addOfficer,
        removeOfficer,
        addReport,
        updateReportStatus,
        addScanRecord,
        addPayment,
        validateQR,
        dashboardStats,
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
