import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db } from "@/db/postgres-client.js";
import { paginationOffset, type PaginationQuery } from "@/shared/http/pagination.js";
import {
    productImages,
    products,
    type NewProduct,
    type Product,
    type ProductImage,
} from "@/modules/catalog/products/product.schema.js";
import { cityPrices } from "@/modules/catalog/pricing/city-price.schema.js";

export type ProductPatch = Partial<Pick<Product, "name" | "slug" | "description" | "categoryId" | "isActive">>;

export type ProductListFilter = {
    q?: string;
    isActive?: boolean;
    categoryId?: string;
};

export type PricedProduct = {
    product: Product;
    pricePaise: number;
};

export interface IProductRepository {
    findById(id: string): Promise<Product | undefined>;
    list(
        pagination: PaginationQuery,
        filter?: ProductListFilter,
    ): Promise<{ items: Product[]; total: number }>;
    insert(data: NewProduct): Promise<Product>;
    update(id: string, data: ProductPatch): Promise<Product | undefined>;
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
    ): Promise<{ items: Product[]; total: number }> {
        const where = productListWhere(filter);
        const [totalRow] = await db.select({ value: count() }).from(products).where(where);
        const items = await db
            .select()
            .from(products)
            .where(where)
            .orderBy(desc(products.createdAt))
            .limit(pagination.limit)
            .offset(paginationOffset(pagination));
        return { items, total: Number(totalRow?.value ?? 0) };
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
        const conditions: SQL[] = [eq(products.isActive, true), eq(cityPrices.cityId, cityId)];
        if (filter.categoryId) {
            conditions.push(eq(products.categoryId, filter.categoryId));
        }
        return db
            .select({ product: products, pricePaise: cityPrices.pricePaise })
            .from(products)
            .innerJoin(cityPrices, eq(cityPrices.productId, products.id))
            .where(and(...conditions))
            .orderBy(asc(products.name));
    }
}
