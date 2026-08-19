import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "../users/user.schema.js";

export const vendorOnboardingStatusEnum = pgEnum("vendor_onboarding_status", [
    "PENDING",
    "ACTIVE",
    "REJECTED",
    "BLOCKED",
]);

export const vendors = pgTable("vendors", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .unique()
        .references(() => users.id, { onDelete: "cascade" }),
    city: text("city").notNull(),
    onboardingStatus: vendorOnboardingStatusEnum("onboarding_status").notNull().default("PENDING"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Vendor = typeof vendors.$inferSelect;
export type NewVendor = typeof vendors.$inferInsert;
