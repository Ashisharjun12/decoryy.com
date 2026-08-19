import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const cities = pgTable("cities", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    state: text("state").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type City = typeof cities.$inferSelect;
export type NewCity = typeof cities.$inferInsert;
