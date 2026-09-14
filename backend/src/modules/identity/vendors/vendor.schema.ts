import { boolean, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { cities } from "@/modules/geo/cities/city.schema.js";
import { uploads } from "@/modules/upload/media/media.schema.js";
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
    cityId: uuid("city_id")
        .notNull()
        .references(() => cities.id, { onDelete: "restrict" }),
    shopAddress: text("shop_address").notNull(),
    pincode: text("pincode").notNull(),
    altPhone: text("alt_phone"),
    shopImageUploadId: uuid("shop_image_upload_id").references(() => uploads.id, {
        onDelete: "set null",
    }),
    onboardingStatus: vendorOnboardingStatusEnum("onboarding_status").notNull().default("PENDING"),
    isOnDuty: boolean("is_on_duty").notNull().default(false),
    dutyChangedAt: timestamp("duty_changed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Vendor = typeof vendors.$inferSelect;
export type NewVendor = typeof vendors.$inferInsert;
export type VendorOnboardingStatus = (typeof vendorOnboardingStatusEnum.enumValues)[number];
