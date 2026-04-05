import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { generateToken, authMiddleware } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res) => {
  try {
    const { username, password, fullName, email, phone, role } = req.body;

    if (!username || !password || !fullName) {
      res.status(400).json({ error: "Username, password, dan nama lengkap wajib diisi" });
      return;
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "Username sudah terdaftar" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({
      username,
      passwordHash,
      fullName,
      email: email || null,
      phone: phone || null,
      role: "public",
    }).returning();

    const token = generateToken({ userId: user.id, username: user.username, role: user.role });
    res.status(201).json({
      token,
      user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mendaftar", details: err.message });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Username dan password wajib diisi" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Username atau password salah" });
      return;
    }

    if (user.isActive !== "true") {
      res.status(403).json({ error: "Akun dinonaktifkan" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Username atau password salah" });
      return;
    }

    const token = generateToken({ userId: user.id, username: user.username, role: user.role });
    res.json({
      token,
      user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal login", details: err.message });
  }
});

router.get("/auth/me", authMiddleware, async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User tidak ditemukan" });
      return;
    }
    res.json({ id: user.id, username: user.username, fullName: user.fullName, role: user.role, email: user.email, phone: user.phone });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mengambil data user" });
  }
});

export default router;
