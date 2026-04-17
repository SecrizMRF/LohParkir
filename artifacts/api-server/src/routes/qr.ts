import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { officersTable, officerQrCodesTable, paymentsTable, scansTable, VEHICLE_TYPES } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/qr/validate", async (req, res) => {
  try {
    const { qrCode, deviceId, location } = req.body;

    if (!qrCode) {
      res.status(400).json({ error: "QR code wajib diisi" });
      return;
    }

    const newPattern = /^LOHPARKIR-DSH-\d{4}-\d{3}-(MOTOR|MOBIL)$/;
    const legacyPattern = /^LOHPARKIR-DSH-\d{4}-\d{3}$/;

    if (!newPattern.test(qrCode) && !legacyPattern.test(qrCode)) {
      await db.insert(scansTable).values({
        qrCode,
        isValid: false,
        deviceId: deviceId || null,
        location: location || null,
      });
      res.json({ isValid: false, message: "Format QR code tidak valid", officer: null });
      return;
    }

    let officer: typeof officersTable.$inferSelect | undefined;
    let vehicleType: string | null = null;
    let rate: number | null = null;

    if (newPattern.test(qrCode)) {
      const [qrRow] = await db.select().from(officerQrCodesTable).where(eq(officerQrCodesTable.qrCode, qrCode)).limit(1);
      if (qrRow && qrRow.status === "active") {
        vehicleType = qrRow.vehicleType;
        rate = qrRow.rate;
        const [o] = await db.select().from(officersTable).where(eq(officersTable.id, qrRow.officerId)).limit(1);
        officer = o;
      }
    } else {
      const [o] = await db.select().from(officersTable).where(eq(officersTable.qrCode, qrCode)).limit(1);
      officer = o;
      rate = o?.rate ?? null;
    }

    const isValid = !!officer && officer.status === "active";

    await db.insert(scansTable).values({
      qrCode,
      isValid,
      officerId: officer?.id || null,
      officerName: officer?.name || null,
      deviceId: deviceId || null,
      location: location || null,
    });

    if (isValid && officer) {
      res.json({
        isValid: true,
        message: "QR code valid — petugas resmi terdaftar",
        vehicleType,
        vehicleLabel: vehicleType ? VEHICLE_TYPES[vehicleType as keyof typeof VEHICLE_TYPES]?.label : null,
        rate,
        officer: {
          id: officer.id,
          name: officer.name,
          badgeNumber: officer.badgeNumber,
          area: officer.area,
          location: officer.location,
          rate: rate ?? officer.rate,
          status: officer.status,
        },
      });
    } else {
      res.json({
        isValid: false,
        message: officer ? "Petugas tidak aktif" : "QR code tidak terdaftar dalam sistem",
        officer: null,
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: "Gagal memvalidasi QR code", details: err.message });
  }
});

router.get("/qr/my-codes", authMiddleware, async (req: any, res) => {
  try {
    if (req.user.role !== "officer") {
      res.status(403).json({ error: "Hanya petugas yang bisa mengakses" });
      return;
    }
    const [officer] = await db.select().from(officersTable).where(eq(officersTable.userId, req.user.userId)).limit(1);
    if (!officer) {
      res.status(404).json({ error: "Data petugas tidak ditemukan" });
      return;
    }
    if (officer.status !== "active") {
      res.status(403).json({ error: "Akun petugas dinonaktifkan" });
      return;
    }
    const codes = await db.select().from(officerQrCodesTable).where(eq(officerQrCodesTable.officerId, officer.id));
    res.json({
      officer: {
        id: officer.id,
        name: officer.name,
        badgeNumber: officer.badgeNumber,
        area: officer.area,
        location: officer.location,
      },
      qrCodes: codes.map((c) => ({
        id: c.id,
        vehicleType: c.vehicleType,
        vehicleLabel: VEHICLE_TYPES[c.vehicleType as keyof typeof VEHICLE_TYPES]?.label || c.vehicleType,
        qrCode: c.qrCode,
        rate: c.rate,
        status: c.status,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mengambil QR codes", details: err.message });
  }
});

router.post("/qr/cash-payment", authMiddleware, async (req: any, res) => {
  try {
    if (req.user.role !== "officer") {
      res.status(403).json({ error: "Hanya petugas yang bisa mencatat pembayaran tunai" });
      return;
    }
    const { vehicleType } = req.body as { vehicleType?: string };
    if (!vehicleType || !VEHICLE_TYPES[vehicleType as keyof typeof VEHICLE_TYPES]) {
      res.status(400).json({ error: "Tipe kendaraan tidak valid" });
      return;
    }
    const [officer] = await db.select().from(officersTable).where(eq(officersTable.userId, req.user.userId)).limit(1);
    if (!officer || officer.status !== "active") {
      res.status(403).json({ error: "Akun petugas tidak aktif" });
      return;
    }
    const [qrRow] = await db.select().from(officerQrCodesTable)
      .where(eq(officerQrCodesTable.officerId, officer.id))
      .limit(50);
    const matching = await db.select().from(officerQrCodesTable)
      .where(eq(officerQrCodesTable.officerId, officer.id));
    const vehicleQr = matching.find((q) => q.vehicleType === vehicleType);
    const amount = vehicleQr?.rate ?? VEHICLE_TYPES[vehicleType as keyof typeof VEHICLE_TYPES].rate;

    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const rand = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
    const transactionId = `TXN-${dateStr}-${rand}`;

    const [payment] = await db.insert(paymentsTable).values({
      transactionId,
      officerId: officer.id,
      officerName: officer.name,
      amount,
      method: "cash",
      status: "completed",
      area: officer.area,
    }).returning();

    res.status(201).json({
      message: "Pembayaran tunai berhasil dicatat",
      payment,
      vehicleLabel: VEHICLE_TYPES[vehicleType as keyof typeof VEHICLE_TYPES].label,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mencatat pembayaran tunai", details: err.message });
  }
});

export default router;
