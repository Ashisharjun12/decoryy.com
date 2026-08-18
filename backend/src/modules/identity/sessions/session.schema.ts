import { pgTable , uuid ,text,timestamp } from "drizzle-orm/pg-core";


export const sessionTable = pgTable("sessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    // userId: uuid("user_id").references(() => ),
    token: text("token").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})