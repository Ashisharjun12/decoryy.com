import { ApiError } from "@/shared/errors/apiError.js";
import { parsePagination } from "@/shared/http/pagination.js";
import type { ICityRepository } from "@/modules/geo/cities/city.repository.js";
import { publicCity, slugify, type PublicCity } from "@/modules/geo/cities/city.public.js";
import type { City } from "@/modules/geo/cities/city.schema.js";
import { isUniqueViolation } from "@/modules/geo/pg-error.js";

export type CreateCityInput = {
    name: string;
    state: string;
    slug?: string;
    isActive?: boolean;
};

export type PatchCityInput = {
    name?: string;
    state?: string;
    slug?: string;
    isActive?: boolean;
};

export type CityAdminListQuery = {
    page?: unknown;
    limit?: unknown;
    q?: unknown;
    isActive?: unknown;
};

export interface ICityService {
    listActive(): Promise<PublicCity[]>;
    listAdmin(query: CityAdminListQuery): Promise<{
        items: City[];
        page: number;
        limit: number;
        total: number;
    }>;
    create(input: CreateCityInput): Promise<City>;
    patch(id: string, input: PatchCityInput): Promise<City>;
}

export class CityService implements ICityService {
    constructor(private readonly cities: ICityRepository) {}

    async listActive(): Promise<PublicCity[]> {
        const rows = await this.cities.listActive();
        return rows.map(publicCity);
    }

    async listAdmin(query: CityAdminListQuery) {
        const pagination = parsePagination(query);
        const q = typeof query.q === "string" ? query.q.trim() : "";
        const isActive =
            query.isActive === "true" ? true : query.isActive === "false" ? false : undefined;
        const { items, total } = await this.cities.list(pagination, {
            q: q || undefined,
            isActive,
        });
        return { items, page: pagination.page, limit: pagination.limit, total };
    }

    async create(input: CreateCityInput): Promise<City> {
        const name = input.name.trim();
        const state = input.state.trim();
        const slug = slugify(input.slug?.trim() || name);
        if (!slug) {
            throw ApiError.badRequest("invalid city slug");
        }
        try {
            return await this.cities.insert({
                name,
                slug,
                state,
                isActive: input.isActive ?? true,
            });
        } catch (err) {
            if (isUniqueViolation(err)) {
                throw ApiError.conflict("city name or slug already exists");
            }
            throw err;
        }
    }

    async patch(id: string, input: PatchCityInput): Promise<City> {
        const existing = await this.cities.findById(id);
        if (!existing) {
            throw ApiError.notFound("city not found");
        }
        const data: Parameters<ICityRepository["update"]>[1] = {};
        if (input.name !== undefined) data.name = input.name.trim();
        if (input.state !== undefined) data.state = input.state.trim();
        if (input.slug !== undefined) {
            const slug = slugify(input.slug);
            if (!slug) throw ApiError.badRequest("invalid city slug");
            data.slug = slug;
        } else if (input.name !== undefined) {
            data.slug = slugify(input.name);
        }
        if (input.isActive !== undefined) data.isActive = input.isActive;
        try {
            const row = await this.cities.update(id, data);
            if (!row) {
                throw ApiError.notFound("city not found");
            }
            return row;
        } catch (err) {
            if (isUniqueViolation(err)) {
                throw ApiError.conflict("city name or slug already exists");
            }
            throw err;
        }
    }
}
