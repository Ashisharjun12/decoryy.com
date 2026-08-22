import { ApiError } from "@/shared/errors/apiError.js";
import { isUniqueViolation } from "@/modules/geo/pg-error.js";
import { assertServiceable } from "@/modules/geo/index.js";
import { slugify } from "@/modules/catalog/slug.js";
import type { ICityRepository } from "@/modules/geo/cities/city.repository.js";
import { publicCity, type PublicCity } from "@/modules/geo/cities/city.public.js";
import type { IProductService, ProductAdmin, ProductForCity } from "@/modules/catalog/products/product.service.js";
import type { ISectionRepository } from "@/modules/catalog/sections/section.repository.js";
import type { CatalogSection } from "@/modules/catalog/sections/section.schema.js";

export type CreateSectionInput = {
    name: string;
    slug?: string;
    sortIndex?: number;
    isActive?: boolean;
};

export type PatchSectionInput = {
    name?: string;
    slug?: string;
    sortIndex?: number;
    isActive?: boolean;
};

export type PutSectionProductsInput = {
    cityId: string | null;
    productIds: string[];
};

export type SectionMembershipItem = {
    productId: string;
    sortIndex: number;
    product: ProductAdmin;
};

export type SectionMembership = {
    source: "global" | "city";
    items: SectionMembershipItem[];
};

export type PublicSection = CatalogSection & {
    source: "global" | "city";
    items: ProductForCity[];
};

export interface ISectionService {
    listAdmin(): Promise<{ items: CatalogSection[] }>;
    create(input: CreateSectionInput): Promise<CatalogSection>;
    patch(id: string, input: PatchSectionInput): Promise<CatalogSection>;
    delete(id: string): Promise<void>;
    listProducts(id: string, cityId?: string): Promise<SectionMembership>;
    replaceProducts(id: string, input: PutSectionProductsInput): Promise<SectionMembership>;
    deleteCityOverride(id: string, cityId: string): Promise<SectionMembership>;
    listPublic(query: {
        pincode?: string;
        cityId?: string;
    }): Promise<{ city: PublicCity; sections: PublicSection[] }>;
}

export class SectionService implements ISectionService {
    constructor(
        private readonly sections: ISectionRepository,
        private readonly products: IProductService,
        private readonly cities: ICityRepository,
    ) {}

    async listAdmin(): Promise<{ items: CatalogSection[] }> {
        const items = await this.sections.listAll();
        return { items };
    }

    async create(input: CreateSectionInput): Promise<CatalogSection> {
        const name = input.name.trim();
        const slug = slugify(input.slug?.trim() || name);
        if (!slug) {
            throw ApiError.badRequest("invalid section slug");
        }
        try {
            return await this.sections.insert({
                name,
                slug,
                sortIndex: input.sortIndex ?? 0,
                isActive: input.isActive ?? true,
            });
        } catch (err) {
            if (isUniqueViolation(err)) {
                throw ApiError.conflict("section slug already exists");
            }
            throw err;
        }
    }

    async patch(id: string, input: PatchSectionInput): Promise<CatalogSection> {
        await this.requireSection(id);
        const data: Parameters<ISectionRepository["update"]>[1] = {};
        if (input.name !== undefined) data.name = input.name.trim();
        if (input.slug !== undefined) {
            const slug = slugify(input.slug);
            if (!slug) throw ApiError.badRequest("invalid section slug");
            data.slug = slug;
        } else if (input.name !== undefined) {
            data.slug = slugify(input.name);
        }
        if (input.sortIndex !== undefined) data.sortIndex = input.sortIndex;
        if (input.isActive !== undefined) data.isActive = input.isActive;
        try {
            const row = await this.sections.update(id, data);
            if (!row) {
                throw ApiError.notFound("section not found");
            }
            return row;
        } catch (err) {
            if (isUniqueViolation(err)) {
                throw ApiError.conflict("section slug already exists");
            }
            throw err;
        }
    }

    async delete(id: string): Promise<void> {
        await this.requireSection(id);
        const deleted = await this.sections.delete(id);
        if (!deleted) {
            throw ApiError.notFound("section not found");
        }
    }

    async listProducts(id: string, cityId?: string): Promise<SectionMembership> {
        await this.requireSection(id);
        if (cityId) {
            await this.requireCity(cityId);
        }
        return this.membership(id, cityId);
    }

    async replaceProducts(id: string, input: PutSectionProductsInput): Promise<SectionMembership> {
        await this.requireSection(id);
        if (input.cityId) {
            await this.requireCity(input.cityId);
        }
        await this.assertProductsExist(input.productIds);
        await this.sections.replaceProducts(id, input.cityId, input.productIds);
        return this.membership(id, input.cityId ?? undefined);
    }

    async deleteCityOverride(id: string, cityId: string): Promise<SectionMembership> {
        await this.requireSection(id);
        await this.requireCity(cityId);
        const deleted = await this.sections.deleteCityOverride(id, cityId);
        if (!deleted) {
            throw ApiError.notFound("city override not found");
        }
        return this.membership(id, cityId);
    }

    async listPublic(query: {
        pincode?: string;
        cityId?: string;
    }): Promise<{ city: PublicCity; sections: PublicSection[] }> {
        const resolved = await this.resolvePublicCity(query);
        const cityId = resolved.id;
        const rows = await this.sections.listActive();
        const sections: PublicSection[] = [];
        for (const section of rows) {
            const override = await this.sections.findOverride(section.id, cityId);
            const source: "global" | "city" = override ? "city" : "global";
            const membership = await this.sections.listProducts(
                section.id,
                source === "city" ? cityId : null,
            );
            const items = await this.products.listForCityByIds(
                cityId,
                membership.map((row) => row.productId),
            );
            if (items.length === 0) continue;
            sections.push({ ...section, source, items });
        }
        return { city: resolved, sections };
    }

    private async resolvePublicCity(query: {
        pincode?: string;
        cityId?: string;
    }): Promise<PublicCity> {
        if (query.cityId) {
            const row = await this.cities.findById(query.cityId);
            if (!row || !row.isActive) {
                throw ApiError.badRequest("city not serviceable");
            }
            return publicCity(row);
        }
        const resolved = await assertServiceable(String(query.pincode ?? ""));
        return resolved.city;
    }

    private async membership(sectionId: string, cityId?: string): Promise<SectionMembership> {
        const override = cityId ? await this.sections.findOverride(sectionId, cityId) : undefined;
        const source: "global" | "city" = override ? "city" : "global";
        const rows = await this.sections.listProducts(sectionId, source === "city" && cityId ? cityId : null);
        const products = await this.products.adminByIds(rows.map((row) => row.productId));
        const byId = new Map(products.map((product) => [product.id, product]));
        const items: SectionMembershipItem[] = [];
        for (const row of rows) {
            const product = byId.get(row.productId);
            if (!product) continue;
            items.push({ productId: row.productId, sortIndex: row.sortIndex, product });
        }
        return { source, items };
    }

    private async requireSection(id: string): Promise<CatalogSection> {
        const row = await this.sections.findById(id);
        if (!row) {
            throw ApiError.notFound("section not found");
        }
        return row;
    }

    private async requireCity(cityId: string): Promise<void> {
        const city = await this.cities.findById(cityId);
        if (!city) {
            throw ApiError.notFound("city not found");
        }
    }

    private async assertProductsExist(productIds: string[]): Promise<void> {
        if (productIds.length === 0) return;
        const found = await this.products.findByIds(productIds);
        if (found.length !== productIds.length) {
            throw ApiError.badRequest("product not found");
        }
    }
}
