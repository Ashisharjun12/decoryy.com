import { ApiError } from "@/shared/errors/apiError.js";
import type { CmsFooterColumnRepository } from "@/modules/cms/footer-columns/footer-column.repository.js";
import type { z } from "zod";
import type {
    createCmsFooterColumnDto,
    patchCmsFooterColumnDto,
    putCmsFooterColumnLinksDto,
} from "@/modules/cms/footer-columns/footer-column.dto.js";

type CreateInput = z.infer<typeof createCmsFooterColumnDto>;
type PatchInput = z.infer<typeof patchCmsFooterColumnDto>;
type LinksInput = z.infer<typeof putCmsFooterColumnLinksDto>;

export class CmsFooterColumnService {
    constructor(private readonly columns: CmsFooterColumnRepository) {}

    async listAdmin() {
        const items = await this.columns.listAdminWithLinks();
        return { items };
    }

    async getAdmin(id: string) {
        const row = await this.columns.findById(id);
        if (!row) throw ApiError.notFound("Footer column not found");
        const links = await this.columns.listLinksForColumn(id);
        return { ...row, links };
    }

    async create(input: CreateInput) {
        this.assertPublishable(input.status, input.title);
        const sortIndex = input.sortIndex ?? await this.columns.nextSortIndex();
        const row = await this.columns.insert({
            title: input.title.trim(),
            platforms: input.platforms,
            status: input.status,
            sortIndex,
        });
        return { ...row, links: [] };
    }

    async patch(id: string, input: PatchInput) {
        const existing = await this.columns.findById(id);
        if (!existing) throw ApiError.notFound("Footer column not found");
        const status = input.status ?? existing.status;
        const title = (input.title ?? existing.title).trim();
        this.assertPublishable(status, title);
        const row = await this.columns.update(id, {
            title: input.title !== undefined ? input.title.trim() : undefined,
            platforms: input.platforms,
            status: input.status,
            sortIndex: input.sortIndex,
        });
        if (!row) throw ApiError.notFound("Footer column not found");
        const links = await this.columns.listLinksForColumn(id);
        return { ...row, links };
    }

    async delete(id: string) {
        const ok = await this.columns.delete(id);
        if (!ok) throw ApiError.notFound("Footer column not found");
        return { id };
    }

    async reorder(ids: string[]) {
        try {
            await this.columns.reorder(ids);
        } catch {
            throw ApiError.badRequest("Invalid footer column reorder payload");
        }
        return { ok: true };
    }

    async replaceLinks(id: string, input: LinksInput) {
        const result = await this.columns.replaceLinks(id, input.links);
        if (!result) throw ApiError.notFound("Footer column not found");
        return result;
    }

    async listPublished() {
        return this.columns.listPublishedWithLinks();
    }

    private assertPublishable(status: CreateInput["status"], title: string) {
        if (status !== "published") return;
        if (!title.trim()) {
            throw ApiError.badRequest("title is required to publish");
        }
    }
}
