import { z } from "zod";

const cmsStatusSchema = z.enum(["draft", "published", "hidden"]);
const platformsSchema = z.array(z.enum(["web", "mobile"])).min(1).default(["web", "mobile"]);

const faqBaseSchema = z.object({
    question: z.string().trim().min(1).max(500),
    answer: z.string().trim().min(1).max(5000),
    platforms: platformsSchema,
    status: cmsStatusSchema.default("draft"),
    sortIndex: z.number().int().nonnegative().optional(),
});

export const createCmsFaqDto = faqBaseSchema;
export const patchCmsFaqDto = faqBaseSchema.partial();

export const listCmsFaqsQueryDto = z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(200).optional(),
    status: cmsStatusSchema.optional(),
});

export const reorderCmsFaqsDto = z.object({
    ids: z.array(z.string().uuid()).min(1),
});
