import { pgTable, text, serial, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { officersTable } from "./officers";

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  transactionId: varchar("transaction_id", { length: 100 }).notNull().unique(),
  officerId: integer("officer_id").references(() => officersTable.id),
  officerName: varchar("officer_name", { length: 200 }).notNull(),
  amount: integer("amount").notNull(),
  method: varchar("method", { length: 20 }).notNull().default("qris"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  deviceId: varchar("device_id", { length: 100 }),
  area: varchar("area", { length: 200 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({ id: true, transactionId: true, createdAt: true, updatedAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
