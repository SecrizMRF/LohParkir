import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { officersTable, scansTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/qr/validate", async (req, res) => {
  try {
    const { qrCode, deviceId, location } = req.body;

    if (!qrCode) {
      res.status(400).json({ error: "QR code wajib diisi" });
      return;
    }

    const qrPattern = /^LOHPARKIR-DSH-\d{4}-\d{3}$/;
    if (!qrPattern.test(qrCode)) {
      await db.insert(scansTable).values({
        qrCode,
        isValid: false,
        deviceId: deviceId || null,
        location: location || null,
      });

      res.json({
        isValid: false,
        message: "Format QR code tidak valid",
        officer: null,
      });
      return;
    }

    const [officer] = await db.select().from(officersTable).where(eq(officersTable.qrCode, qrCode)).limit(1);

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
        officer: {
          id: officer.id,
          name: officer.name,
          badgeNumber: officer.badgeNumber,
          area: officer.area,
          location: officer.location,
          rate: officer.rate,
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

export default router;
