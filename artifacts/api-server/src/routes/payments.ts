import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { paymentsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

function generateTransactionId(): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `TXN-${dateStr}-${rand}`;
}

router.get("/payments", async (req, res) => {
  try {
    const { deviceId, limit: limitStr } = req.query;
    let results = await db.select().from(paymentsTable).orderBy(desc(paymentsTable.createdAt));

    if (deviceId) results = results.filter(p => p.deviceId === deviceId);
    const limit = limitStr ? Number(limitStr) : undefined;
    if (limit) results = results.slice(0, limit);

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mengambil data pembayaran", details: err.message });
  }
});

router.get("/payments/:id", async (req, res) => {
  try {
    const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.id, Number(req.params.id))).limit(1);
    if (!payment) {
      res.status(404).json({ error: "Pembayaran tidak ditemukan" });
      return;
    }
    res.json(payment);
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mengambil data pembayaran" });
  }
});

router.post("/payments", async (req, res) => {
  try {
    const { officerId, officerName, amount, method, deviceId, area } = req.body;

    if (!officerName || !amount) {
      res.status(400).json({ error: "Nama petugas dan jumlah pembayaran wajib diisi" });
      return;
    }

    const transactionId = generateTransactionId();

    const [payment] = await db.insert(paymentsTable).values({
      transactionId,
      officerId: officerId || null,
      officerName,
      amount,
      method: method || "qris",
      status: "completed",
      deviceId: deviceId || null,
      area: area || null,
    }).returning();

    res.status(201).json(payment);
  } catch (err: any) {
    res.status(500).json({ error: "Gagal memproses pembayaran", details: err.message });
  }
});

export default router;
