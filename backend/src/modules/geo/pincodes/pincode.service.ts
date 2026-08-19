import { ApiError } from "@/shared/errors/apiError.js";
import { parsePagination } from "@/shared/http/pagination.js";
import type { ICityRepository } from "@/modules/geo/cities/city.repository.js";
import { publicCity, type PublicCity } from "@/modules/geo/cities/city.public.js";
import { isUniqueViolation } from "@/modules/geo/pg-error.js";
import type { IPincodeRepository } from "@/modules/geo/pincodes/pincode.repository.js";
import { normalizePincode } from "@/modules/geo/pincodes/pincode.js";
import type { Pincode } from "@/modules/geo/pincodes/pincode.schema.js";

export type ResolvedPincode = {
    pincode: {
        id: string;
        code: string;
        locality: string | null;
        isServiceable: boolean;
    };
    city: PublicCity;
};

export type CreatePincodeInput = {
    code: string;
    cityId: string;
    locality?: string | null;
    isServiceable?: boolean;
};

export type PatchPincodeInput = {
    cityId?: string;
    locality?: string | null;
    isServiceable?: boolean;
};

export type PincodeAdminListQuery = {
    page?: unknown;
    limit?: unknown;
    cityId?: unknown;
    q?: unknown;
    isServiceable?: unknown;
};

export interface IPincodeService {
    resolve(pincodeRaw: string): Promise<ResolvedPincode>;
    assertServiceable(pincodeRaw: string): Promise<ResolvedPincode>;
    getCityByPincode(pincodeRaw: string): Promise<PublicCity>;
    listAdmin(
        query: PincodeAdminListQuery,
    ): Promise<{ items: Pincode[]; page: number; limit: number; total: number }>;
    create(input: CreatePincodeInput): Promise<Pincode>;
    patch(id: string, input: PatchPincodeInput): Promise<Pincode>;
}

export class PincodeService implements IPincodeService {
    constructor(
        private readonly pincodes: IPincodeRepository,
        private readonly cities: ICityRepository,
    ) {}

    async resolve(pincodeRaw: string): Promise<ResolvedPincode> {
        return this.assertServiceable(pincodeRaw);
    }

    async assertServiceable(pincodeRaw: string): Promise<ResolvedPincode> {
        const code = normalizePincode(pincodeRaw);
        const row = await this.pincodes.findByCodeWithCity(code);
        if (!row || !row.pincode.isServiceable || !row.city.isActive) {
            throw ApiError.badRequest("pincode not serviceable");
        }
        return {
            pincode: {
                id: row.pincode.id,
                code: row.pincode.code,
                locality: row.pincode.locality,
                isServiceable: row.pincode.isServiceable,
            },
            city: publicCity(row.city),
        };
    }

    async getCityByPincode(pincodeRaw: string): Promise<PublicCity> {
        const resolved = await this.assertServiceable(pincodeRaw);
        return resolved.city;
    }

    async listAdmin(query: PincodeAdminListQuery) {
        const pagination = parsePagination(query);
        const cityId = typeof query.cityId === "string" ? query.cityId : undefined;
        const q = typeof query.q === "string" ? query.q.replace(/\D/g, "") : "";
        const isServiceable =
            query.isServiceable === "true"
                ? true
                : query.isServiceable === "false"
                  ? false
                  : undefined;
        const { items, total } = await this.pincodes.list(pagination, {
            cityId,
            q: q || undefined,
            isServiceable,
        });
        return { items, page: pagination.page, limit: pagination.limit, total };
    }

    async create(input: CreatePincodeInput): Promise<Pincode> {
        const code = normalizePincode(input.code);
        const city = await this.cities.findById(input.cityId);
        if (!city) {
            throw ApiError.notFound("city not found");
        }
        try {
            return await this.pincodes.insert({
                code,
                cityId: input.cityId,
                locality: input.locality?.trim() || null,
                isServiceable: input.isServiceable ?? true,
            });
        } catch (err) {
            if (isUniqueViolation(err)) {
                throw ApiError.conflict("pincode already exists");
            }
            throw err;
        }
    }

    async patch(id: string, input: PatchPincodeInput): Promise<Pincode> {
        const existing = await this.pincodes.findById(id);
        if (!existing) {
            throw ApiError.notFound("pincode not found");
        }
        if (input.cityId) {
            const city = await this.cities.findById(input.cityId);
            if (!city) {
                throw ApiError.notFound("city not found");
            }
        }
        const row = await this.pincodes.update(id, {
            ...(input.cityId ? { cityId: input.cityId } : {}),
            ...(input.locality !== undefined ? { locality: input.locality?.trim() || null } : {}),
            ...(input.isServiceable !== undefined ? { isServiceable: input.isServiceable } : {}),
        });
        if (!row) {
            throw ApiError.notFound("pincode not found");
        }
        return row;
    }
}
