import { pgTable, text, serial, timestamp, varchar, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  ticketNumber: varchar("ticket_number", { length: 50 }).notNull().unique(),
  type: varchar("type", { length: 30 }).notNull(),
  description: text("description").notNull(),
  photoUrl: text("photo_url"),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
  address: text("address"),
  status: varchar("status", { length: 30 }).notNull().default("pending"),
  adminNotes: text("admin_notes"),
  reporterDeviceId: varchar("reporter_device_id", { length: 100 }),
  relatedQrCode: varchar("related_qr_code", { length: 100 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({ id: true, ticketNumber: true, status: true, createdAt: true, updatedAt: true });
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
