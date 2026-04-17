import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, officersTable, officerQrCodesTable, VEHICLE_TYPES } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

interface SeedOfficer {
  nip: string;
  name: string;
  badgeNumber: string;
  area: string;
  location: string;
  phone: string;
  loginPassword: string;
}

const SEED_OFFICERS: SeedOfficer[] = [
  {
    nip: "198501012010011001",
    name: "Budi Santoso",
    badgeNumber: "DSH-2024-001",
    area: "Zona A - Jl. Sudirman",
    location: "Jl. Jend. Sudirman No. 1-50",
    phone: "081234567890",
    loginPassword: "petugas001",
  },
  {
    nip: "199002152012012002",
    name: "Siti Rahayu",
    badgeNumber: "DSH-2024-002",
    area: "Zona B - Jl. Thamrin",
    location: "Jl. MH Thamrin No. 1-30",
    phone: "081234567891",
    loginPassword: "petugas002",
  },
  {
    nip: "198807202015011003",
    name: "Ahmad Wijaya",
    badgeNumber: "DSH-2024-003",
    area: "Zona C - Jl. Gatot Subroto",
    location: "Jl. Gatot Subroto No. 10-80",
    phone: "081234567892",
    loginPassword: "petugas003",
  },
];

async function ensureOfficerQrCodes(officerId: number, badgeNumber: string) {
  for (const vt of Object.keys(VEHICLE_TYPES) as Array<keyof typeof VEHICLE_TYPES>) {
    const info = VEHICLE_TYPES[vt];
    const qrCode = `LOHPARKIR-${badgeNumber}-${vt.toUpperCase()}`;
    const existing = await db.select().from(officerQrCodesTable).where(eq(officerQrCodesTable.qrCode, qrCode)).limit(1);
    if (existing.length === 0) {
      await db.insert(officerQrCodesTable).values({
        officerId,
        vehicleType: vt,
        qrCode,
        rate: info.rate,
        status: "active",
      });
    }
  }
}

router.post("/seed", async (_req, res) => {
  try {
    const existingAdmins = await db.select().from(usersTable).where(eq(usersTable.username, "admin")).limit(1);
    if (existingAdmins.length === 0) {
      const adminHash = await bcrypt.hash("admin123", 10);
      const superadminHash = await bcrypt.hash("superadmin123", 10);
      await db.insert(usersTable).values([
        { username: "admin", passwordHash: adminHash, fullName: "Admin Dishub", role: "admin", email: "admin@dishub.go.id" },
        { username: "superadmin", passwordHash: superadminHash, fullName: "Super Admin", role: "superadmin", email: "superadmin@dishub.go.id" },
      ]);
    }

    const officerCredentials: Array<{ name: string; username: string; password: string }> = [];

    for (const seed of SEED_OFFICERS) {
      let [officer] = await db.select().from(officersTable).where(eq(officersTable.nip, seed.nip)).limit(1);

      if (!officer) {
        const passwordHash = await bcrypt.hash(seed.loginPassword, 10);
        const [user] = await db.insert(usersTable).values({
          username: seed.nip,
          passwordHash,
          fullName: seed.name,
          role: "officer",
          phone: seed.phone,
        }).returning();

        const [created] = await db.insert(officersTable).values({
          userId: user.id,
          nip: seed.nip,
          name: seed.name,
          badgeNumber: seed.badgeNumber,
          qrCode: `LOHPARKIR-${seed.badgeNumber}`,
          area: seed.area,
          location: seed.location,
          rate: 3000,
          status: "active",
          phone: seed.phone,
        }).returning();
        officer = created;
      } else if (!officer.userId) {
        const existingUser = await db.select().from(usersTable).where(eq(usersTable.username, seed.nip)).limit(1);
        let userId: number;
        if (existingUser.length === 0) {
          const passwordHash = await bcrypt.hash(seed.loginPassword, 10);
          const [user] = await db.insert(usersTable).values({
            username: seed.nip,
            passwordHash,
            fullName: seed.name,
            role: "officer",
            phone: seed.phone,
          }).returning();
          userId = user.id;
        } else {
          userId = existingUser[0].id;
        }
        await db.update(officersTable).set({ userId }).where(eq(officersTable.id, officer.id));
      }

      await ensureOfficerQrCodes(officer.id, officer.badgeNumber);
      officerCredentials.push({ name: seed.name, username: seed.nip, password: seed.loginPassword });
    }

    res.json({
      message: "Seed data berhasil dibuat / diperbarui",
      credentials: {
        admin: { username: "admin", password: "admin123" },
        superadmin: { username: "superadmin", password: "superadmin123" },
        officers: officerCredentials,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal membuat seed data", details: err.message });
  }
});

export default router;
