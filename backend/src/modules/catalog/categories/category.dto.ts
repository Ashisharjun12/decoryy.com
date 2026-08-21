import { z } from "zod";

export const createCategoryDto = z.object({
    name: z.string().min(2),
    slug: z.string().min(2).optional(),
    parentId: z.string().uuid().nullable().optional(),
    imageUploadId: z.string().uuid().nullable().optional(),
    isActive: z.boolean().optional(),
});

export const patchCategoryDto = z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).optional(),
    parentId: z.string().uuid().nullable().optional(),
    imageUploadId: z.string().uuid().nullable().optional(),
    isActive: z.boolean().optional(),
});

export const categoryIdParamsDto = z.object({
    id: z.string().uuid(),
});

export const adminCategoryListQueryDto = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    q: z.string().optional(),
    isActive: z.enum(["true", "false"]).optional(),
    parentId: z.string().optional(),
});
