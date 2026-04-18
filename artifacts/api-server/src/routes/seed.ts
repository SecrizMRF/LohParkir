import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, officersTable, officerQrCodesTable, reportsTable, paymentsTable, scansTable, VEHICLE_TYPES } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

interface SeedOfficer {
  name: string;
  badgeNumber: string;
  area: string;
  location: string;
  phone: string;
  loginPassword: string;
}

const SEED_OFFICERS: SeedOfficer[] = [
  {
    name: "Budi Santoso",
    badgeNumber: "DSH-2024-001",
    area: "Zona A - Jl. Sudirman",
    location: "Jl. Jend. Sudirman No. 1-50",
    phone: "081234567890",
    loginPassword: "petugas001",
  },
  {
    name: "Siti Rahayu",
    badgeNumber: "DSH-2024-002",
    area: "Zona B - Jl. Thamrin",
    location: "Jl. MH Thamrin No. 1-30",
    phone: "081234567891",
    loginPassword: "petugas002",
  },
  {
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
    } else if (existing[0].rate !== info.rate) {
      await db.update(officerQrCodesTable)
        .set({ rate: info.rate, updatedAt: new Date() })
        .where(eq(officerQrCodesTable.id, existing[0].id));
    }
  }
}

function dateStr(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function pad(n: number, len = 5): string {
  return String(n).padStart(len, "0");
}

const DEMO_DEVICE_IDS = [
  "demo-device-warga-001",
  "demo-device-warga-002",
  "demo-device-warga-003",
];

const DEMO_REPORTS: Array<{
  type: string; description: string; address: string; status: string; daysAgo: number;
  latitude: string; longitude: string; deviceIdx: number; adminNotes?: string;
}> = [
  { type: "tarif", description: "Petugas meminta Rp10.000 untuk parkir motor di area Pasar Petisah, jauh di atas tarif resmi.", address: "Jl. Razak Hamid, Pasar Petisah, Medan Petisah", status: "pending", daysAgo: 0, latitude: "3.5868", longitude: "98.6712", deviceIdx: 0 },
  { type: "qr_palsu", description: "QR yang ditempel di pohon tidak menampilkan info petugas saat dipindai. Diduga QR palsu.", address: "Jl. Gatot Subroto depan Plaza Medan Fair", status: "in_review", daysAgo: 1, latitude: "3.5912", longitude: "98.6602", deviceIdx: 1, adminNotes: "Sedang ditinjau tim lapangan." },
  { type: "petugas_palsu", description: "Orang berseragam tidak resmi memungut parkir di Lapangan Merdeka tanpa karcis.", address: "Lapangan Merdeka, Medan Barat", status: "resolved", daysAgo: 3, latitude: "3.5894", longitude: "98.6783", deviceIdx: 2, adminNotes: "Petugas tidak terdaftar telah ditindak. Terima kasih atas laporannya." },
  { type: "lainnya", description: "Tidak diberikan struk/karcis setelah membayar parkir mobil di Center Point.", address: "Jl. Jawa, Center Point Mall", status: "rejected", daysAgo: 5, latitude: "3.5836", longitude: "98.6831", deviceIdx: 0, adminNotes: "Bukti tidak mencukupi untuk ditindaklanjuti." },
  { type: "tarif", description: "Tarif motor dipungut Rp5.000 di area Sun Plaza tanpa karcis.", address: "Jl. KH. Zainul Arifin, Sun Plaza", status: "pending", daysAgo: 0, latitude: "3.5778", longitude: "98.6756", deviceIdx: 1 },
  { type: "qr_palsu", description: "QR berbeda format dari yang resmi, tidak mengarah ke aplikasi LohParkir.", address: "Jl. Iskandar Muda, Medan Baru", status: "resolved", daysAgo: 7, latitude: "3.5743", longitude: "98.6512", deviceIdx: 2, adminNotes: "QR palsu telah dicabut. Pelaku diserahkan ke pihak berwajib." },
];

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
      const officerUsername = seed.badgeNumber.toLowerCase();
      let [officer] = await db.select().from(officersTable).where(eq(officersTable.badgeNumber, seed.badgeNumber)).limit(1);

      if (!officer) {
        const passwordHash = await bcrypt.hash(seed.loginPassword, 10);
        const [user] = await db.insert(usersTable).values({
          username: officerUsername,
          passwordHash,
          fullName: seed.name,
          role: "officer",
          phone: seed.phone,
        }).returning();

        const [created] = await db.insert(officersTable).values({
          userId: user.id,
          name: seed.name,
          badgeNumber: seed.badgeNumber,
          qrCode: `LOHPARKIR-${seed.badgeNumber}`,
          area: seed.area,
          location: seed.location,
          rate: 2000,
          status: "active",
          phone: seed.phone,
        }).returning();
        officer = created;
      } else {
        const existingUser = await db.select().from(usersTable).where(eq(usersTable.username, officerUsername)).limit(1);
        let userId: number;
        if (existingUser.length === 0) {
          const passwordHash = await bcrypt.hash(seed.loginPassword, 10);
          const [user] = await db.insert(usersTable).values({
            username: officerUsername,
            passwordHash,
            fullName: seed.name,
            role: "officer",
            phone: seed.phone,
          }).returning();
          userId = user.id;
        } else {
          userId = existingUser[0].id;
          const passwordHash = await bcrypt.hash(seed.loginPassword, 10);
          await db.update(usersTable).set({ passwordHash, fullName: seed.name, role: "officer" }).where(eq(usersTable.id, userId));
        }
        if (officer.userId !== userId) {
          await db.update(officersTable).set({ userId }).where(eq(officersTable.id, officer.id));
        }
      }

      await ensureOfficerQrCodes(officer.id, officer.badgeNumber);
      officerCredentials.push({ name: seed.name, username: officerUsername, password: seed.loginPassword });
    }

    const allOfficers = await db.select().from(officersTable);
    const officerById = new Map(allOfficers.map(o => [o.id, o]));
    const officerList = allOfficers.length > 0 ? allOfficers : [];

    let reportsAdded = 0;
    if (officerList.length > 0) {
      const today = new Date();
      for (let i = 0; i < DEMO_REPORTS.length; i++) {
        const r = DEMO_REPORTS[i];
        const created = new Date(today);
        created.setDate(created.getDate() - r.daysAgo);
        created.setHours(8 + i, 15 + i * 5, 0, 0);
        const ticketNumber = `LP-${dateStr(created)}-${pad(1000 + i, 4)}`;
        const exists = await db.select().from(reportsTable).where(eq(reportsTable.ticketNumber, ticketNumber)).limit(1);
        if (exists.length === 0) {
          await db.insert(reportsTable).values({
            ticketNumber,
            type: r.type,
            description: r.description,
            address: r.address,
            latitude: r.latitude,
            longitude: r.longitude,
            status: r.status,
            adminNotes: r.adminNotes ?? null,
            reporterDeviceId: DEMO_DEVICE_IDS[r.deviceIdx],
            createdAt: created,
            updatedAt: created,
          });
          reportsAdded++;
        }
      }
    }

    let paymentsAdded = 0;
    if (officerList.length > 0) {
      const now = new Date();
      let txnSeq = 0;
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const day = new Date(now);
        day.setDate(day.getDate() - dayOffset);
        const txCount = dayOffset === 0 ? 6 : 4;
        for (let i = 0; i < txCount; i++) {
          const officer = officerList[(dayOffset + i) % officerList.length];
          const isCar = (i % 3) === 0;
          const amount = isCar ? 4000 : 2000;
          const created = new Date(day);
          created.setHours(7 + i * 2, 5 + i * 11, 0, 0);
          const transactionId = `TXN-${dateStr(created)}-${pad(80000 + txnSeq, 5)}`;
          txnSeq++;
          const exists = await db.select().from(paymentsTable).where(eq(paymentsTable.transactionId, transactionId)).limit(1);
          if (exists.length === 0) {
            await db.insert(paymentsTable).values({
              transactionId,
              officerId: officer.id,
              officerName: officer.name,
              amount,
              method: i % 2 === 0 ? "qris" : "cash",
              status: "success",
              deviceId: DEMO_DEVICE_IDS[(dayOffset + i) % DEMO_DEVICE_IDS.length],
              area: officer.area,
              createdAt: created,
              updatedAt: created,
            });
            paymentsAdded++;
          }
        }
      }
    }

    let scansAdded = 0;
    if (officerList.length > 0) {
      const existingScansCount = await db.select({ c: sql<number>`count(*)::int` }).from(scansTable);
      if ((existingScansCount[0]?.c ?? 0) < 10) {
        const now = new Date();
        for (let i = 0; i < 12; i++) {
          const officer = officerList[i % officerList.length];
          const isValid = i % 5 !== 0;
          const scanned = new Date(now);
          scanned.setHours(scanned.getHours() - i * 2);
          await db.insert(scansTable).values({
            qrCode: isValid ? `LOHPARKIR-${officer.badgeNumber}-MOTOR` : `FAKE-QR-${i}`,
            isValid,
            officerId: isValid ? officer.id : null,
            officerName: isValid ? officer.name : null,
            location: officer.area,
            deviceId: DEMO_DEVICE_IDS[i % DEMO_DEVICE_IDS.length],
            scannedAt: scanned,
          });
          scansAdded++;
        }
      }
    }

    res.json({
      message: "Seed data berhasil dibuat / diperbarui",
      credentials: {
        admin: { username: "admin", password: "admin123" },
        superadmin: { username: "superadmin", password: "superadmin123" },
        officers: officerCredentials,
      },
      stats: { reportsAdded, paymentsAdded, scansAdded },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal membuat seed data", details: err.message });
  }
});

export default router;
