import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { reportsTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { authMiddleware, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

function generateTicketNumber(): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `LP-${dateStr}-${rand}`;
}

router.get("/reports", async (req, res) => {
  try {
    const { status, type, limit: limitStr } = req.query;
    let query = db.select().from(reportsTable).orderBy(desc(reportsTable.createdAt));

    const results = await query;
    let filtered = results;
    if (status) filtered = filtered.filter(r => r.status === status);
    if (type) filtered = filtered.filter(r => r.type === type);
    const limit = limitStr ? Number(limitStr) : undefined;
    if (limit) filtered = filtered.slice(0, limit);

    res.json(filtered);
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mengambil data laporan", details: err.message });
  }
});

router.get("/reports/:id", async (req, res) => {
  try {
    const [report] = await db.select().from(reportsTable).where(eq(reportsTable.id, Number(req.params.id))).limit(1);
    if (!report) {
      res.status(404).json({ error: "Laporan tidak ditemukan" });
      return;
    }
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mengambil data laporan" });
  }
});

router.post("/reports", async (req, res) => {
  try {
    const { type, description, photoUrl, latitude, longitude, address, reporterDeviceId, relatedQrCode } = req.body;

    if (!type || !description) {
      res.status(400).json({ error: "Tipe dan deskripsi wajib diisi" });
      return;
    }

    if (!["illegal_parking", "fake_qr"].includes(type)) {
      res.status(400).json({ error: "Tipe laporan tidak valid" });
      return;
    }

    const ticketNumber = generateTicketNumber();

    const [report] = await db.insert(reportsTable).values({
      ticketNumber,
      type,
      description,
      photoUrl: photoUrl || null,
      latitude: latitude ? String(latitude) : null,
      longitude: longitude ? String(longitude) : null,
      address: address || null,
      reporterDeviceId: reporterDeviceId || null,
      relatedQrCode: relatedQrCode || null,
    }).returning();

    res.status(201).json(report);
  } catch (err: any) {
    res.status(500).json({ error: "Gagal membuat laporan", details: err.message });
  }
});

router.put("/reports/:id/status", authMiddleware, requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, adminNotes } = req.body;

    if (!status || !["pending", "in_progress", "resolved", "rejected"].includes(status)) {
      res.status(400).json({ error: "Status tidak valid" });
      return;
    }

    const updates: any = { status, updatedAt: new Date() };
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;

    const [report] = await db.update(reportsTable).set(updates).where(eq(reportsTable.id, id)).returning();
    if (!report) {
      res.status(404).json({ error: "Laporan tidak ditemukan" });
      return;
    }
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mengupdate status laporan" });
  }
});

export default router;
