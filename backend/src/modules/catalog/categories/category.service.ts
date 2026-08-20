import { ApiError } from "@/shared/errors/apiError.js";
import { parsePagination } from "@/shared/http/pagination.js";
import { isUniqueViolation } from "@/modules/geo/pg-error.js";
import { slugify } from "@/modules/catalog/slug.js";
import type { ICategoryRepository } from "@/modules/catalog/categories/category.repository.js";
import type { Category } from "@/modules/catalog/categories/category.schema.js";

export type CategoryTree = Category & { children: Category[] };

export type CreateCategoryInput = {
    name: string;
    slug?: string;
    parentId?: string | null;
    isActive?: boolean;
};

export type PatchCategoryInput = {
    name?: string;
    slug?: string;
    parentId?: string | null;
    isActive?: boolean;
};

export type CategoryAdminListQuery = {
    page?: unknown;
    limit?: unknown;
    q?: unknown;
    isActive?: unknown;
    parentId?: unknown;
};

export interface ICategoryService {
    listActiveTree(): Promise<CategoryTree[]>;
    listAdmin(query: CategoryAdminListQuery): Promise<{
        items: Category[];
        page: number;
        limit: number;
        total: number;
    }>;
    create(input: CreateCategoryInput): Promise<Category>;
    patch(id: string, input: PatchCategoryInput): Promise<Category>;
}

export class CategoryService implements ICategoryService {
    constructor(private readonly categories: ICategoryRepository) {}

    async listActiveTree(): Promise<CategoryTree[]> {
        const rows = await this.categories.listActive();
        const childrenByParent = new Map<string, Category[]>();
        const tops: Category[] = [];
        for (const row of rows) {
            if (!row.parentId) {
                tops.push(row);
                continue;
            }
            const list = childrenByParent.get(row.parentId) ?? [];
            list.push(row);
            childrenByParent.set(row.parentId, list);
        }
        return tops.map((parent) => ({
            ...parent,
            children: childrenByParent.get(parent.id) ?? [],
        }));
    }

    async listAdmin(query: CategoryAdminListQuery) {
        const pagination = parsePagination(query);
        const q = typeof query.q === "string" ? query.q.trim() : "";
        const isActive =
            query.isActive === "true" ? true : query.isActive === "false" ? false : undefined;
        const parentRaw = typeof query.parentId === "string" ? query.parentId : undefined;
        const parentId =
            parentRaw === undefined
                ? undefined
                : parentRaw === "null" || parentRaw === ""
                  ? null
                  : parentRaw;
        const { items, total } = await this.categories.list(pagination, {
            q: q || undefined,
            isActive,
            parentId,
        });
        return { items, page: pagination.page, limit: pagination.limit, total };
    }

    async create(input: CreateCategoryInput): Promise<Category> {
        const name = input.name.trim();
        const slug = slugify(input.slug?.trim() || name);
        if (!slug) {
            throw ApiError.badRequest("invalid category slug");
        }
        const parentId = input.parentId ?? null;
        if (parentId) {
            await this.assertTopLevelParent(parentId);
        }
        try {
            return await this.categories.insert({
                name,
                slug,
                parentId,
                isActive: input.isActive ?? true,
            });
        } catch (err) {
            if (isUniqueViolation(err)) {
                throw ApiError.conflict("category slug already exists");
            }
            throw err;
        }
    }

    async patch(id: string, input: PatchCategoryInput): Promise<Category> {
        const existing = await this.categories.findById(id);
        if (!existing) {
            throw ApiError.notFound("category not found");
        }
        const data: Parameters<ICategoryRepository["update"]>[1] = {};
        if (input.name !== undefined) data.name = input.name.trim();
        if (input.slug !== undefined) {
            const slug = slugify(input.slug);
            if (!slug) throw ApiError.badRequest("invalid category slug");
            data.slug = slug;
        } else if (input.name !== undefined) {
            data.slug = slugify(input.name);
        }
        if (input.parentId !== undefined) {
            if (input.parentId === id) {
                throw ApiError.badRequest("category cannot parent itself");
            }
            if (input.parentId) {
                await this.assertTopLevelParent(input.parentId);
            }
            data.parentId = input.parentId;
        }
        if (input.isActive !== undefined) data.isActive = input.isActive;
        try {
            const row = await this.categories.update(id, data);
            if (!row) {
                throw ApiError.notFound("category not found");
            }
            return row;
        } catch (err) {
            if (isUniqueViolation(err)) {
                throw ApiError.conflict("category slug already exists");
            }
            throw err;
        }
    }

    private async assertTopLevelParent(parentId: string): Promise<void> {
        const parent = await this.categories.findById(parentId);
        if (!parent) {
            throw ApiError.notFound("parent category not found");
        }
        if (parent.parentId) {
            throw ApiError.badRequest("parent must be a top-level category");
        }
    }
}
