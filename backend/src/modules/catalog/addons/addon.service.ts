import { ApiError } from "@/shared/errors/apiError.js";
import { parsePagination } from "@/shared/http/pagination.js";
import { isUniqueViolation } from "@/modules/geo/pg-error.js";
import { slugify } from "@/modules/catalog/slug.js";
import { getCompletedUpload } from "@/modules/upload/index.js";
import type { IAddonRepository } from "@/modules/catalog/addons/addon.repository.js";
import type { IProductRepository } from "@/modules/catalog/products/product.repository.js";
import type { Addon } from "@/modules/catalog/addons/addon.schema.js";

export type CreateAddonInput = {
    name: string;
    slug?: string;
    imageUploadId?: string | null;
    isActive?: boolean;
};

export type PatchAddonInput = {
    name?: string;
    slug?: string;
    imageUploadId?: string | null;
    isActive?: boolean;
};

export type AddonAdminListQuery = {
    page?: unknown;
    limit?: unknown;
    q?: unknown;
    isActive?: unknown;
};

export interface IAddonService {
    listAdmin(query: AddonAdminListQuery): Promise<{
        items: Addon[];
        page: number;
        limit: number;
        total: number;
    }>;
    create(input: CreateAddonInput): Promise<Addon>;
    patch(id: string, input: PatchAddonInput): Promise<Addon>;
    mapToProduct(productId: string, addonId: string): Promise<{ productId: string; addonId: string }>;
    unmapFromProduct(productId: string, addonId: string): Promise<void>;
    listMappedIds(productId: string): Promise<string[]>;
}

export class AddonService implements IAddonService {
    constructor(
        private readonly addons: IAddonRepository,
        private readonly products: IProductRepository,
    ) {}

    async listAdmin(query: AddonAdminListQuery) {
        const pagination = parsePagination(query);
        const q = typeof query.q === "string" ? query.q.trim() : "";
        const isActive =
            query.isActive === "true" ? true : query.isActive === "false" ? false : undefined;
        const { items, total } = await this.addons.list(pagination, {
            q: q || undefined,
            isActive,
        });
        return { items, page: pagination.page, limit: pagination.limit, total };
    }

    async create(input: CreateAddonInput): Promise<Addon> {
        const name = input.name.trim();
        const slug = slugify(input.slug?.trim() || name);
        if (!slug) {
            throw ApiError.badRequest("invalid addon slug");
        }
        const imageUploadId = await this.assertImage(input.imageUploadId);
        try {
            return await this.addons.insert({
                name,
                slug,
                imageUploadId,
                isActive: input.isActive ?? true,
            });
        } catch (err) {
            if (isUniqueViolation(err)) {
                throw ApiError.conflict("addon slug already exists");
            }
            throw err;
        }
    }

    async patch(id: string, input: PatchAddonInput): Promise<Addon> {
        const existing = await this.addons.findById(id);
        if (!existing) {
            throw ApiError.notFound("addon not found");
        }
        const data: Parameters<IAddonRepository["update"]>[1] = {};
        if (input.name !== undefined) data.name = input.name.trim();
        if (input.slug !== undefined) {
            const slug = slugify(input.slug);
            if (!slug) throw ApiError.badRequest("invalid addon slug");
            data.slug = slug;
        } else if (input.name !== undefined) {
            data.slug = slugify(input.name);
        }
        if (input.imageUploadId !== undefined) {
            data.imageUploadId = await this.assertImage(input.imageUploadId);
        }
        if (input.isActive !== undefined) data.isActive = input.isActive;
        try {
            const row = await this.addons.update(id, data);
            if (!row) {
                throw ApiError.notFound("addon not found");
            }
            return row;
        } catch (err) {
            if (isUniqueViolation(err)) {
                throw ApiError.conflict("addon slug already exists");
            }
            throw err;
        }
    }

    async mapToProduct(productId: string, addonId: string) {
        const product = await this.products.findById(productId);
        if (!product) {
            throw ApiError.notFound("product not found");
        }
        const addon = await this.addons.findById(addonId);
        if (!addon) {
            throw ApiError.notFound("addon not found");
        }
        await this.addons.map(productId, addonId);
        return { productId, addonId };
    }

    async unmapFromProduct(productId: string, addonId: string): Promise<void> {
        const product = await this.products.findById(productId);
        if (!product) {
            throw ApiError.notFound("product not found");
        }
        await this.addons.unmap(productId, addonId);
    }

    listMappedIds(productId: string): Promise<string[]> {
        return this.addons.listMappedIds(productId);
    }

    private async assertImage(imageUploadId: string | null | undefined): Promise<string | null> {
        if (!imageUploadId) {
            return null;
        }
        const upload = await getCompletedUpload(imageUploadId);
        if (upload.kind !== "image") {
            throw ApiError.badRequest("addon image must be an image upload");
        }
        return imageUploadId;
    }
}
