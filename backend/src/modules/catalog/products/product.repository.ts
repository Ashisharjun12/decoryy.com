import { and, asc, count, desc, eq, ilike, isNotNull, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db/postgres-client.js";
import { paginationOffset, type PaginationQuery } from "@/shared/http/pagination.js";
import { categories } from "@/modules/catalog/categories/category.schema.js";
import {
    productImages,
    products,
    type NewProduct,
    type Product,
    type ProductImage,
} from "@/modules/catalog/products/product.schema.js";
import { cityPrices } from "@/modules/catalog/pricing/city-price.schema.js";

export type ProductPatch = Partial<
    Pick<
        Product,
        | "name"
        | "slug"
        | "description"
        | "categoryId"
        | "isActive"
        | "scheduledEnabled"
        | "instantEnabled"
        | "pricePaise"
        | "compareAtPaise"
    >
>;

export type ProductListFilter = {
    q?: string;
    isActive?: boolean;
    categoryId?: string;
};

export type ProductListRow = Product & { categoryName: string };

export type PricedProduct = {
    product: Product;
    pricePaise: number;
};

export interface IProductRepository {
    findById(id: string): Promise<Product | undefined>;
    list(
        pagination: PaginationQuery,
        filter?: ProductListFilter,
    ): Promise<{ items: ProductListRow[]; total: number }>;
    insert(data: NewProduct): Promise<Product>;
    update(id: string, data: ProductPatch): Promise<Product | undefined>;
    delete(id: string): Promise<boolean>;
    listImages(productId: string): Promise<ProductImage[]>;
    replaceImages(productId: string, uploadIds: string[]): Promise<void>;
    listPricedForCity(cityId: string, filter?: { categoryId?: string }): Promise<PricedProduct[]>;
}

function productListWhere(filter: ProductListFilter = {}): SQL | undefined {
    const conditions: SQL[] = [];
    const q = filter.q?.trim().replace(/[%_\\]/g, "");
    if (q) {
        const pattern = `%${q}%`;
        const match = or(ilike(products.name, pattern), ilike(products.slug, pattern));
        if (match) conditions.push(match);
    }
    if (filter.isActive !== undefined) {
        conditions.push(eq(products.isActive, filter.isActive));
    }
    if (filter.categoryId) {
        conditions.push(eq(products.categoryId, filter.categoryId));
    }
    return conditions.length ? and(...conditions) : undefined;
}

export class ProductRepository implements IProductRepository {
    async findById(id: string): Promise<Product | undefined> {
        const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
        return row;
    }

    async list(
        pagination: PaginationQuery,
        filter: ProductListFilter = {},
    ): Promise<{ items: ProductListRow[]; total: number }> {
        const where = productListWhere(filter);
        const [totalRow] = await db.select({ value: count() }).from(products).where(where);
        const rows = await db
            .select({
                product: products,
                categoryName: categories.name,
            })
            .from(products)
            .innerJoin(categories, eq(products.categoryId, categories.id))
            .where(where)
            .orderBy(desc(products.createdAt))
            .limit(pagination.limit)
            .offset(paginationOffset(pagination));
        return {
            items: rows.map((row) => ({ ...row.product, categoryName: row.categoryName })),
            total: Number(totalRow?.value ?? 0),
        };
    }

    async insert(data: NewProduct): Promise<Product> {
        const [row] = await db.insert(products).values(data).returning();
        if (!row) {
            throw new Error("failed to create product");
        }
        return row;
    }

    async update(id: string, data: ProductPatch): Promise<Product | undefined> {
        const [row] = await db
            .update(products)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(products.id, id))
            .returning();
        return row;
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
        return deleted.length > 0;
    }

    async listImages(productId: string): Promise<ProductImage[]> {
        return db
            .select()
            .from(productImages)
            .where(eq(productImages.productId, productId))
            .orderBy(asc(productImages.sortIndex));
    }

    async replaceImages(productId: string, uploadIds: string[]): Promise<void> {
        await db.transaction(async (tx) => {
            await tx.delete(productImages).where(eq(productImages.productId, productId));
            if (uploadIds.length === 0) return;
            await tx.insert(productImages).values(
                uploadIds.map((uploadId, sortIndex) => ({ productId, uploadId, sortIndex })),
            );
        });
    }

    async listPricedForCity(
        cityId: string,
        filter: { categoryId?: string } = {},
    ): Promise<PricedProduct[]> {
        const conditions: SQL[] = [eq(products.isActive, true)];
        if (filter.categoryId) {
            conditions.push(eq(products.categoryId, filter.categoryId));
        }
        const priced = or(isNotNull(cityPrices.pricePaise), isNotNull(products.pricePaise));
        if (priced) conditions.push(priced);
        return db
            .select({
                product: products,
                pricePaise: sql<number>`coalesce(${cityPrices.pricePaise}, ${products.pricePaise})`.mapWith(Number),
            })
            .from(products)
            .leftJoin(
                cityPrices,
                and(eq(cityPrices.productId, products.id), eq(cityPrices.cityId, cityId)),
            )
            .where(and(...conditions))
            .orderBy(asc(products.name));
    }
}
