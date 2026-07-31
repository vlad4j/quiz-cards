import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const cards = pgTable("cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  language: text("language").notNull(),
  foreignText: text("foreign_text").notNull(),
  englishText: text("english_text").notNull(),
  foreignImageUrls: text("foreign_image_urls").array().notNull().default([]),
  englishImageUrls: text("english_image_urls").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;
