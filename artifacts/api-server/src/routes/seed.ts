import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, officersTable } from "@workspace/db/schema";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.post("/seed", async (_req, res) => {
  try {
    const existingUsers = await db.select().from(usersTable).limit(1);
    if (existingUsers.length > 0) {
      res.json({ message: "Data sudah ada, seed dilewati" });
      return;
    }

    const adminHash = await bcrypt.hash("admin123", 10);
    const superadminHash = await bcrypt.hash("superadmin123", 10);

    await db.insert(usersTable).values([
      { username: "admin", passwordHash: adminHash, fullName: "Admin Dishub", role: "admin", email: "admin@dishub.go.id" },
      { username: "superadmin", passwordHash: superadminHash, fullName: "Super Admin", role: "superadmin", email: "superadmin@dishub.go.id" },
    ]);

    await db.insert(officersTable).values([
      {
        nip: "198501012010011001",
        name: "Budi Santoso",
        badgeNumber: "DSH-2024-001",
        qrCode: "LOHPARKIR-DSH-2024-001",
        area: "Zona A - Jl. Sudirman",
        location: "Jl. Jend. Sudirman No. 1-50",
        rate: 3000,
        status: "active",
        phone: "081234567890",
      },
      {
        nip: "199002152012012002",
        name: "Siti Rahayu",
        badgeNumber: "DSH-2024-002",
        qrCode: "LOHPARKIR-DSH-2024-002",
        area: "Zona B - Jl. Thamrin",
        location: "Jl. MH Thamrin No. 1-30",
        rate: 5000,
        status: "active",
        phone: "081234567891",
      },
      {
        nip: "198807202015011003",
        name: "Ahmad Wijaya",
        badgeNumber: "DSH-2024-003",
        qrCode: "LOHPARKIR-DSH-2024-003",
        area: "Zona C - Jl. Gatot Subroto",
        location: "Jl. Gatot Subroto No. 10-80",
        rate: 3000,
        status: "active",
        phone: "081234567892",
      },
    ]);

    res.json({
      message: "Seed data berhasil dibuat",
      credentials: {
        admin: { username: "admin", password: "admin123" },
        superadmin: { username: "superadmin", password: "superadmin123" },
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal membuat seed data", details: err.message });
  }
});

export default router;
