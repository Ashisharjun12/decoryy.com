import { CmsHomeService } from "@/modules/cms/cms-home.service.js";
import type { CmsBannerRepository } from "@/modules/cms/banners/banner.repository.js";
import type { CmsTestimonialRepository } from "@/modules/cms/testimonials/testimonial.repository.js";
import { getCompletedUpload, toPublicMedia } from "@/modules/upload/index.js";

export class CmsPublicService {
    private readonly home = new CmsHomeService();

    constructor(
        private readonly banners: CmsBannerRepository,
        private readonly testimonials: CmsTestimonialRepository,
    ) {}

    async getHome(query: { cityId?: string; platform?: string }) {
        const [bannerRows, testimonialRows] = await Promise.all([
            this.banners.listPublished(),
            this.testimonials.listPublished(),
        ]);

        const banners = await Promise.all(
            bannerRows.map(async (row) => ({
                ...row,
                imageUrl: row.imageUploadId ? await this.mediaUrl(row.imageUploadId) : null,
            })),
        );

        const testimonials = await Promise.all(
            testimonialRows.map(async (row) => ({
                ...row,
                avatarUrl: row.avatarUploadId ? await this.mediaUrl(row.avatarUploadId) : null,
            })),
        );

        return this.home.resolve(banners, testimonials, {
            cityId: query.cityId,
            platform: query.platform ?? "web",
        });
    }

    private async mediaUrl(uploadId: string) {
        const upload = await getCompletedUpload(uploadId);
        const media = toPublicMedia(upload);
        return media.optimizedUrl ?? media.publicUrl;
    }
}
