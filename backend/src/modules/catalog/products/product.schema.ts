import { boolean, integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { categories } from "@/modules/catalog/categories/category.schema.js";
import { uploads } from "@/modules/upload/media/media.schema.js";

export const products = pgTable("products", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    categoryId: uuid("category_id")
        .notNull()
        .references(() => categories.id, { onDelete: "restrict" }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const productImages = pgTable(
    "product_images",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        productId: uuid("product_id")
            .notNull()
            .references(() => products.id, { onDelete: "cascade" }),
        uploadId: uuid("upload_id")
            .notNull()
            .references(() => uploads.id, { onDelete: "restrict" }),
        sortIndex: integer("sort_index").notNull().default(0),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [unique("product_images_product_upload").on(table.productId, table.uploadId)],
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
