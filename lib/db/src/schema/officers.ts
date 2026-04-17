import { pgTable, text, serial, timestamp, varchar, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const officersTable = pgTable("officers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  nip: varchar("nip", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  badgeNumber: varchar("badge_number", { length: 50 }).notNull().unique(),
  qrCode: varchar("qr_code", { length: 100 }).notNull().unique(),
  area: varchar("area", { length: 200 }).notNull(),
  location: text("location").notNull(),
  rate: integer("rate").notNull().default(2000),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  phone: varchar("phone", { length: 20 }),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertOfficerSchema = createInsertSchema(officersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOfficer = z.infer<typeof insertOfficerSchema>;
export type Officer = typeof officersTable.$inferSelect;
