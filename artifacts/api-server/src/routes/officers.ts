import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { officersTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { authMiddleware, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/officers", async (_req, res) => {
  try {
    const officers = await db.select().from(officersTable).orderBy(desc(officersTable.createdAt));
    res.json(officers);
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mengambil data petugas", details: err.message });
  }
});

router.get("/officers/:id", async (req, res) => {
  try {
    const [officer] = await db.select().from(officersTable).where(eq(officersTable.id, Number(req.params.id))).limit(1);
    if (!officer) {
      res.status(404).json({ error: "Petugas tidak ditemukan" });
      return;
    }
    res.json(officer);
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mengambil data petugas" });
  }
});

router.post("/officers", authMiddleware, requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const { nip, name, badgeNumber, area, location, rate, phone } = req.body;

    if (!nip || !name || !badgeNumber || !area || !location) {
      res.status(400).json({ error: "NIP, nama, nomor badge, area, dan lokasi wajib diisi" });
      return;
    }

    const existingNip = await db.select().from(officersTable).where(eq(officersTable.nip, nip)).limit(1);
    if (existingNip.length > 0) {
      res.status(409).json({ error: "NIP sudah terdaftar" });
      return;
    }

    const existingBadge = await db.select().from(officersTable).where(eq(officersTable.badgeNumber, badgeNumber)).limit(1);
    if (existingBadge.length > 0) {
      res.status(409).json({ error: "Nomor badge sudah terdaftar" });
      return;
    }

    const qrCode = `LOHPARKIR-${badgeNumber}`;
    const [officer] = await db.insert(officersTable).values({
      nip,
      name,
      badgeNumber,
      qrCode,
      area,
      location,
      rate: rate || 3000,
      phone: phone || null,
    }).returning();

    res.status(201).json(officer);
  } catch (err: any) {
    res.status(500).json({ error: "Gagal menambah petugas", details: err.message });
  }
});

router.put("/officers/:id", authMiddleware, requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, area, location, rate, status, phone } = req.body;

    const updates: any = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (area !== undefined) updates.area = area;
    if (location !== undefined) updates.location = location;
    if (rate !== undefined) updates.rate = rate;
    if (status !== undefined) updates.status = status;
    if (phone !== undefined) updates.phone = phone;

    const [officer] = await db.update(officersTable).set(updates).where(eq(officersTable.id, id)).returning();
    if (!officer) {
      res.status(404).json({ error: "Petugas tidak ditemukan" });
      return;
    }
    res.json(officer);
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mengupdate petugas" });
  }
});

router.delete("/officers/:id", authMiddleware, requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [deleted] = await db.delete(officersTable).where(eq(officersTable.id, id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Petugas tidak ditemukan" });
      return;
    }
    res.json({ message: "Petugas berhasil dihapus" });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal menghapus petugas" });
  }
});

export default router;
