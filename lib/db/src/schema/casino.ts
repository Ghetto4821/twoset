import { pgTable, text, serial, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const playersTable = pgTable("players", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  username: text("username").notNull(),
  balance: real("balance").notNull().default(1000),
  totalSpins: integer("total_spins").notNull().default(0),
  totalWon: real("total_won").notNull().default(0),
  totalLost: real("total_lost").notNull().default(0),
  biggestWin: real("biggest_win").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const giftsTable = pgTable("gifts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  rarity: text("rarity").notNull(),
  emoji: text("emoji").notNull(),
  value: real("value").notNull(),
  wonAt: timestamp("won_at").notNull().defaultNow(),
});

export const spinsTable = pgTable("spins", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  betAmount: real("bet_amount").notNull(),
  reels: text("reels").notNull(),
  isWin: integer("is_win").notNull().default(0),
  winAmount: real("win_amount").notNull().default(0),
  spunAt: timestamp("spun_at").notNull().defaultNow(),
});

export const insertPlayerSchema = createInsertSchema(playersTable).omit({ id: true, createdAt: true });
export const insertGiftSchema = createInsertSchema(giftsTable).omit({ id: true, wonAt: true });
export const insertSpinSchema = createInsertSchema(spinsTable).omit({ id: true, spunAt: true });

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof playersTable.$inferSelect;
export type InsertGift = z.infer<typeof insertGiftSchema>;
export type Gift = typeof giftsTable.$inferSelect;
export type InsertSpin = z.infer<typeof insertSpinSchema>;
export type Spin = typeof spinsTable.$inferSelect;
