import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { officersTable, officerQrCodesTable, usersTable, VEHICLE_TYPES } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { authMiddleware, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

async function attachQrCodes(officers: (typeof officersTable.$inferSelect)[]) {
  if (officers.length === 0) return [];
  const allCodes = await db.select().from(officerQrCodesTable);
  const byOfficer = new Map<number, typeof allCodes>();
  for (const c of allCodes) {
    const arr = byOfficer.get(c.officerId) || [];
    arr.push(c);
    byOfficer.set(c.officerId, arr);
  }
  return officers.map((o) => ({
    ...o,
    qrCodes: (byOfficer.get(o.id) || []).map((c) => ({
      id: c.id,
      vehicleType: c.vehicleType,
      vehicleLabel: VEHICLE_TYPES[c.vehicleType as keyof typeof VEHICLE_TYPES]?.label || c.vehicleType,
      qrCode: c.qrCode,
      rate: c.rate,
      status: c.status,
    })),
  }));
}

router.get("/officers", async (_req, res) => {
  try {
    const officers = await db.select().from(officersTable).orderBy(desc(officersTable.createdAt));
    const enriched = await attachQrCodes(officers);
    res.json(enriched);
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

    const loginPassword = `petugas${badgeNumber.replace(/\D/g, "").slice(-3) || "000"}`;
    const passwordHash = await bcrypt.hash(loginPassword, 10);
    const [user] = await db.insert(usersTable).values({
      username: nip,
      passwordHash,
      fullName: name,
      role: "officer",
      phone: phone || null,
    }).returning();

    const [officer] = await db.insert(officersTable).values({
      userId: user.id,
      nip,
      name,
      badgeNumber,
      qrCode,
      area,
      location,
      rate: rate || 3000,
      phone: phone || null,
    }).returning();

    for (const vt of Object.keys(VEHICLE_TYPES) as Array<keyof typeof VEHICLE_TYPES>) {
      const info = VEHICLE_TYPES[vt];
      await db.insert(officerQrCodesTable).values({
        officerId: officer.id,
        vehicleType: vt,
        qrCode: `LOHPARKIR-${badgeNumber}-${vt.toUpperCase()}`,
        rate: info.rate,
        status: "active",
      });
    }

    const [enriched] = await attachQrCodes([officer]);
    res.status(201).json({ ...enriched, loginCredentials: { username: nip, password: loginPassword } });
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
    const [existing] = await db.select().from(officersTable).where(eq(officersTable.id, id)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "Petugas tidak ditemukan" });
      return;
    }
    await db.delete(officersTable).where(eq(officersTable.id, id));
    if (existing.userId) {
      await db.delete(usersTable).where(eq(usersTable.id, existing.userId));
    }
    res.json({ message: "Petugas berhasil dihapus" });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal menghapus petugas", details: err.message });
  }
});

export default router;
