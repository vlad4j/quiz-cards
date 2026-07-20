import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const cards = pgTable("cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  language: text("language").notNull(),
  foreignText: text("foreign_text").notNull(),
  englishText: text("english_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;
