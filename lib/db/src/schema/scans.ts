import { pgTable, text, serial, timestamp, varchar, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { officersTable } from "./officers";

export const scansTable = pgTable("scans", {
  id: serial("id").primaryKey(),
  qrCode: varchar("qr_code", { length: 100 }).notNull(),
  isValid: boolean("is_valid").notNull(),
  officerId: integer("officer_id").references(() => officersTable.id),
  officerName: varchar("officer_name", { length: 200 }),
  location: text("location"),
  deviceId: varchar("device_id", { length: 100 }),
  scannedAt: timestamp("scanned_at").notNull().defaultNow(),
});

export const insertScanSchema = createInsertSchema(scansTable).omit({ id: true, scannedAt: true });
export type InsertScan = z.infer<typeof insertScanSchema>;
export type Scan = typeof scansTable.$inferSelect;
