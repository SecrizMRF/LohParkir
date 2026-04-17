import { pgTable, serial, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { officersTable } from "./officers";

export const officerQrCodesTable = pgTable("officer_qr_codes", {
  id: serial("id").primaryKey(),
  officerId: integer("officer_id").notNull().references(() => officersTable.id, { onDelete: "cascade" }),
  vehicleType: varchar("vehicle_type", { length: 20 }).notNull(),
  qrCode: varchar("qr_code", { length: 100 }).notNull().unique(),
  rate: integer("rate").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertOfficerQrCodeSchema = createInsertSchema(officerQrCodesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOfficerQrCode = z.infer<typeof insertOfficerQrCodeSchema>;
export type OfficerQrCode = typeof officerQrCodesTable.$inferSelect;

export const VEHICLE_TYPES = {
  motor: { label: "Motor / Roda 2", rate: 3000, icon: "motorbike" },
  mobil: { label: "Mobil / Roda 4", rate: 5000, icon: "car" },
} as const;

export type VehicleType = keyof typeof VEHICLE_TYPES;
