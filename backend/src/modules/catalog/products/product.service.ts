import { ApiError } from "@/shared/errors/apiError.js";
import { parsePagination } from "@/shared/http/pagination.js";
import { isForeignKeyViolation, isUniqueViolation } from "@/modules/geo/pg-error.js";
import { assertServiceable } from "@/modules/geo/index.js";
import { slugify } from "@/modules/catalog/slug.js";
import { displayUrl, getCompletedUpload, toPublicMedia, type PublicMedia } from "@/modules/upload/index.js";
import type { IMediaRepository } from "@/modules/upload/media/media.repository.js";
import type { ICategoryRepository } from "@/modules/catalog/categories/category.repository.js";
import type { IAddonRepository } from "@/modules/catalog/addons/addon.repository.js";
import type { ICityPriceRepository } from "@/modules/catalog/pricing/city-price.repository.js";
import type { IProductRepository } from "@/modules/catalog/products/product.repository.js";
import type { Product } from "@/modules/catalog/products/product.schema.js";
import type { CityPrice } from "@/modules/catalog/pricing/city-price.schema.js";
import type { PublicCity } from "@/modules/geo/cities/city.public.js";

export type ProductImagePublic = PublicMedia & {
    uploadId: string;
    sortIndex: number;
    url: string;
};

export type ProductAdmin = Product & {
    images: ProductImagePublic[];
    addonIds: string[];
};

export type ProductAdminDetail = ProductAdmin & {
    prices: CityPrice[];
};

export type ProductForCity = Product & {
    pricePaise: number;
    images: ProductImagePublic[];
    addonIds: string[];
};

export type CreateProductInput = {
    name: string;
    slug?: string;
    description?: string | null;
    categoryId: string;
    isActive?: boolean;
    imageUploadIds?: string[];
};

export type PatchProductInput = {
    name?: string;
    slug?: string;
    description?: string | null;
    categoryId?: string;
    isActive?: boolean;
    imageUploadIds?: string[];
};

export type ProductAdminListQuery = {
    page?: unknown;
    limit?: unknown;
    q?: unknown;
    isActive?: unknown;
    categoryId?: unknown;
};

export type PublicProductListQuery = {
    pincode?: unknown;
    categoryId?: unknown;
};

export interface IProductService {
    listAdmin(query: ProductAdminListQuery): Promise<{
        items: ProductAdmin[];
        page: number;
        limit: number;
        total: number;
    }>;
    getAdmin(id: string): Promise<ProductAdminDetail>;
    create(input: CreateProductInput): Promise<ProductAdminDetail>;
    patch(id: string, input: PatchProductInput): Promise<ProductAdminDetail>;
    listByPincode(query: PublicProductListQuery): Promise<{ city: PublicCity; items: ProductForCity[] }>;
    getForCity(productId: string, cityId: string): Promise<ProductForCity>;
}

export class ProductService implements IProductService {
    constructor(
        private readonly products: IProductRepository,
        private readonly addons: IAddonRepository,
        private readonly prices: ICityPriceRepository,
        private readonly media: IMediaRepository,
        private readonly categories: ICategoryRepository,
    ) {}

    async listAdmin(query: ProductAdminListQuery) {
        const pagination = parsePagination(query);
        const q = typeof query.q === "string" ? query.q.trim() : "";
        const isActive =
            query.isActive === "true" ? true : query.isActive === "false" ? false : undefined;
        const categoryId = typeof query.categoryId === "string" ? query.categoryId : undefined;
        const { items, total } = await this.products.list(pagination, {
            q: q || undefined,
            isActive,
            categoryId,
        });
        const withMedia = await Promise.all(items.map((item) => this.toAdmin(item)));
        return { items: withMedia, page: pagination.page, limit: pagination.limit, total };
    }

    async getAdmin(id: string): Promise<ProductAdminDetail> {
        const product = await this.requireProduct(id);
        const [admin, prices] = await Promise.all([
            this.toAdmin(product),
            this.prices.listProductPrices(id),
        ]);
        return { ...admin, prices };
    }

    async create(input: CreateProductInput): Promise<ProductAdminDetail> {
        await this.assertCategory(input.categoryId);
        const name = input.name.trim();
        const slug = slugify(input.slug?.trim() || name);
        if (!slug) {
            throw ApiError.badRequest("invalid product slug");
        }
        try {
            const row = await this.products.insert({
                name,
                slug,
                description: input.description?.trim() || null,
                categoryId: input.categoryId,
                isActive: input.isActive ?? true,
            });
            if (input.imageUploadIds) {
                await this.setImages(row.id, input.imageUploadIds);
            }
            return this.getAdmin(row.id);
        } catch (err) {
            if (isUniqueViolation(err)) {
                throw ApiError.conflict("product slug already exists");
            }
            if (isForeignKeyViolation(err)) {
                throw ApiError.badRequest("category not found");
            }
            throw err;
        }
    }

    async patch(id: string, input: PatchProductInput): Promise<ProductAdminDetail> {
        const existing = await this.requireProduct(id);
        if (input.categoryId) {
            await this.assertCategory(input.categoryId);
        }
        const data: Parameters<IProductRepository["update"]>[1] = {};
        if (input.name !== undefined) data.name = input.name.trim();
        if (input.slug !== undefined) {
            const slug = slugify(input.slug);
            if (!slug) throw ApiError.badRequest("invalid product slug");
            data.slug = slug;
        } else if (input.name !== undefined) {
            data.slug = slugify(input.name);
        }
        if (input.description !== undefined) {
            data.description = input.description?.trim() || null;
        }
        if (input.categoryId !== undefined) data.categoryId = input.categoryId;
        if (input.isActive !== undefined) data.isActive = input.isActive;
        try {
            const row = await this.products.update(id, data);
            if (!row) {
                throw ApiError.notFound("product not found");
            }
            if (input.imageUploadIds) {
                await this.setImages(id, input.imageUploadIds);
            }
            return this.getAdmin(existing.id);
        } catch (err) {
            if (isUniqueViolation(err)) {
                throw ApiError.conflict("product slug already exists");
            }
            if (isForeignKeyViolation(err)) {
                throw ApiError.badRequest("category not found");
            }
            throw err;
        }
    }

    async listByPincode(query: PublicProductListQuery) {
        const resolved = await assertServiceable(String(query.pincode ?? ""));
        const categoryId = typeof query.categoryId === "string" ? query.categoryId : undefined;
        const rows = await this.products.listPricedForCity(resolved.city.id, { categoryId });
        const items = await Promise.all(
            rows.map(async (row) => this.toCityProduct(row.product, row.pricePaise)),
        );
        return { city: resolved.city, items };
    }

    async getForCity(productId: string, cityId: string): Promise<ProductForCity> {
        const product = await this.requireProduct(productId);
        if (!product.isActive) {
            throw ApiError.notFound("product not found");
        }
        const price = await this.prices.getProductPrice(productId, cityId);
        if (!price) {
            throw ApiError.badRequest("product is not priced for this city");
        }
        return this.toCityProduct(product, price.pricePaise);
    }

    private async setImages(productId: string, uploadIds: string[]): Promise<void> {
        for (const uploadId of uploadIds) {
            const upload = await getCompletedUpload(uploadId);
            if (upload.kind !== "image") {
                throw ApiError.badRequest("product image must be an image upload");
            }
        }
        await this.products.replaceImages(productId, uploadIds);
    }

    private async imagesFor(productId: string): Promise<ProductImagePublic[]> {
        const rows = await this.products.listImages(productId);
        const images: ProductImagePublic[] = [];
        for (const row of rows) {
            const upload = await this.media.findById(row.uploadId);
            if (!upload) continue;
            images.push({
                ...toPublicMedia(upload),
                uploadId: row.uploadId,
                sortIndex: row.sortIndex,
                url: displayUrl(upload),
            });
        }
        return images;
    }

    private async toAdmin(product: Product): Promise<ProductAdmin> {
        const [images, addonIds] = await Promise.all([
            this.imagesFor(product.id),
            this.addons.listMappedIds(product.id),
        ]);
        return { ...product, images, addonIds };
    }

    private async toCityProduct(product: Product, pricePaise: number): Promise<ProductForCity> {
        const admin = await this.toAdmin(product);
        return { ...admin, pricePaise };
    }

    private async requireProduct(id: string): Promise<Product> {
        const product = await this.products.findById(id);
        if (!product) {
            throw ApiError.notFound("product not found");
        }
        return product;
    }

    private async assertCategory(categoryId: string): Promise<void> {
        const category = await this.categories.findById(categoryId);
        if (!category) {
            throw ApiError.notFound("category not found");
        }
    }
}
