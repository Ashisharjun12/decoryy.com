import { CmsHomeService } from "@/modules/cms/cms-home.service.js";
import type { CmsBannerRepository } from "@/modules/cms/banners/banner.repository.js";
import type { CmsTestimonialRepository } from "@/modules/cms/testimonials/testimonial.repository.js";
import { getCompletedUpload, toPublicMedia } from "@/modules/upload/index.js";

import type { CmsHomeLayoutService } from "@/modules/cms/home-layout/home-layout.service.js";
import type { CmsHomeFaqRepository } from "@/modules/cms/faq/faq.repository.js";

export class CmsPublicService {
    private readonly home = new CmsHomeService();

    constructor(
        private readonly banners: CmsBannerRepository,
        private readonly testimonials: CmsTestimonialRepository,
        private readonly homeLayout: CmsHomeLayoutService,
        private readonly faqs: CmsHomeFaqRepository,
    ) {}

    async getHome(query: { cityId?: string; pincode?: string; platform?: string }) {
        const [bannerRows, testimonialRows, faqRows] = await Promise.all([
            this.banners.listPublished(),
            this.testimonials.listPublished(),
            this.faqs.listPublished(),
        ]);

        const banners = await Promise.all(
            bannerRows.map(async (row) => ({
                ...row,
                imageUrl: row.imageUploadId ? await this.mediaUrl(row.imageUploadId) : null,
                mobileImageUrl: row.mobileImageUploadId
                    ? await this.mediaUrl(row.mobileImageUploadId)
                    : null,
            })),
        );

        const testimonials = await Promise.all(
            testimonialRows.map(async (row) => ({
                ...row,
                avatarUrl: row.avatarUploadId ? await this.mediaUrl(row.avatarUploadId) : null,
            })),
        );

        const resolved = this.home.resolve(banners, testimonials, faqRows, {
            cityId: query.cityId,
            platform: query.platform ?? "web",
        });
        const layoutBlocks = await this.homeLayout.resolvePublic({
            cityId: query.cityId,
            pincode: query.pincode,
            platform: query.platform ?? "web",
        });
        return { ...resolved, layoutBlocks };
    }

    private async mediaUrl(uploadId: string) {
        const upload = await getCompletedUpload(uploadId);
        const media = toPublicMedia(upload);
        return media.optimizedUrl ?? media.publicUrl;
    }
}
