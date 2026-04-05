import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { officersTable, scansTable, reportsTable, paymentsTable } from "@workspace/db/schema";
import { eq, sql, count, sum, and, gte } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res) => {
  try {
    const [totalScans] = await db.select({ count: count() }).from(scansTable);
    const [validScans] = await db.select({ count: count() }).from(scansTable).where(eq(scansTable.isValid, true));
    const [invalidScans] = await db.select({ count: count() }).from(scansTable).where(eq(scansTable.isValid, false));
    const [totalReports] = await db.select({ count: count() }).from(reportsTable);
    const [pendingReports] = await db.select({ count: count() }).from(reportsTable).where(eq(reportsTable.status, "pending"));
    const [totalPayments] = await db.select({ count: count() }).from(paymentsTable);
    const [revenue] = await db.select({ total: sum(paymentsTable.amount) }).from(paymentsTable).where(eq(paymentsTable.status, "completed"));
    const [activeOfficers] = await db.select({ count: count() }).from(officersTable).where(eq(officersTable.status, "active"));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [todayScans] = await db.select({ count: count() }).from(scansTable).where(gte(scansTable.scannedAt, today));
    const [todayPayments] = await db.select({ count: count() }).from(paymentsTable).where(gte(paymentsTable.createdAt, today));
    const [todayRevenue] = await db.select({ total: sum(paymentsTable.amount) }).from(paymentsTable).where(and(eq(paymentsTable.status, "completed"), gte(paymentsTable.createdAt, today)));

    res.json({
      totalScans: totalScans.count,
      validScans: validScans.count,
      invalidScans: invalidScans.count,
      totalReports: totalReports.count,
      pendingReports: pendingReports.count,
      totalPayments: totalPayments.count,
      totalRevenue: Number(revenue.total) || 0,
      activeOfficers: activeOfficers.count,
      todayScans: todayScans.count,
      todayPayments: todayPayments.count,
      todayRevenue: Number(todayRevenue.total) || 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mengambil data dashboard", details: err.message });
  }
});

router.get("/dashboard/recent-scans", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const scans = await db.select().from(scansTable).orderBy(sql`${scansTable.scannedAt} desc`).limit(limit);
    res.json(scans);
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mengambil data scan terbaru" });
  }
});

router.get("/dashboard/recent-reports", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const reports = await db.select().from(reportsTable).orderBy(sql`${reportsTable.createdAt} desc`).limit(limit);
    res.json(reports);
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mengambil data laporan terbaru" });
  }
});

export default router;
