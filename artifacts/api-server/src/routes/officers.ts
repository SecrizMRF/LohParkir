import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { officersTable, officerQrCodesTable, usersTable, VEHICLE_TYPES } from "@workspace/db/schema";
import { eq, desc, like } from "drizzle-orm";
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

function todayDateStr(): string {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
}

async function generateNextBadge(): Promise<string> {
  const dateStr = todayDateStr();
  const prefix = `DSH-${dateStr}-`;
  const existing = await db
    .select({ badgeNumber: officersTable.badgeNumber })
    .from(officersTable)
    .where(like(officersTable.badgeNumber, `${prefix}%`));

  let bestLetter = "A";
  let bestNum = 0;
  const re = /^DSH-\d{8}-([A-Z])-(\d{3})$/;
  for (const row of existing) {
    const m = row.badgeNumber.match(re);
    if (!m) continue;
    const letter = m[1];
    const num = parseInt(m[2], 10);
    if (
      letter > bestLetter ||
      (letter === bestLetter && num > bestNum)
    ) {
      bestLetter = letter;
      bestNum = num;
    }
  }

  if (bestNum === 0) return `${prefix}A-001`;

  let nextLetter = bestLetter;
  let nextNum = bestNum + 1;
  if (nextNum > 999) {
    nextNum = 1;
    nextLetter = String.fromCharCode(bestLetter.charCodeAt(0) + 1);
    if (nextLetter > "Z") nextLetter = "A";
  }
  return `${prefix}${nextLetter}-${String(nextNum).padStart(3, "0")}`;
}

router.get("/officers/next-badge", authMiddleware, requireRole("admin", "superadmin"), async (_req, res) => {
  try {
    const badgeNumber = await generateNextBadge();
    res.json({ badgeNumber });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal membuat nomor badge", details: err.message });
  }
});

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
    const { name, area, location, phone } = req.body;

    if (!name || !area || !location) {
      res.status(400).json({ error: "Nama, area, dan lokasi wajib diisi" });
      return;
    }
    if (!phone || !String(phone).trim()) {
      res.status(400).json({ error: "Nomor HP wajib diisi" });
      return;
    }

    const badgeNumber = await generateNextBadge();

    const existingBadge = await db.select().from(officersTable).where(eq(officersTable.badgeNumber, badgeNumber)).limit(1);
    if (existingBadge.length > 0) {
      res.status(409).json({ error: "Konflik nomor badge, silakan coba lagi" });
      return;
    }

    const qrCode = `LOHPARKIR-${badgeNumber}`;

    const username = badgeNumber.toLowerCase();
    const loginPassword = `petugas${badgeNumber.replace(/\D/g, "").slice(-4) || "0001"}`;
    const passwordHash = await bcrypt.hash(loginPassword, 10);
    const [user] = await db.insert(usersTable).values({
      username,
      passwordHash,
      fullName: name,
      role: "officer",
      phone,
    }).returning();

    const [officer] = await db.insert(officersTable).values({
      userId: user.id,
      name,
      badgeNumber,
      qrCode,
      area,
      location,
      rate: 2000,
      phone,
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
    res.status(201).json({ ...enriched, loginCredentials: { username, password: loginPassword } });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal menambah petugas", details: err.message });
  }
});

router.put("/officers/:id", authMiddleware, requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, area, location, status, phone } = req.body;

    const updates: any = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (area !== undefined) updates.area = area;
    if (location !== undefined) updates.location = location;
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
