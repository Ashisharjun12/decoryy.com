import type { SiteBrandService } from "@/modules/brand/site-brand.service.js";
import type { CmsSocialLinkService } from "@/modules/cms/social-links/social-link.service.js";
import type { CmsFooterColumnService } from "@/modules/cms/footer-columns/footer-column.service.js";
import { resolveCompletedDisplayUrls, urlFromMap } from "@/modules/upload/index.js";

function matchesPlatform(platforms: string[], platform: string) {
    return platforms.includes(platform);
}

export class SiteShellService {
    constructor(
        private readonly siteBrand: SiteBrandService,
        private readonly socialLinks: CmsSocialLinkService,
        private readonly footerColumns: CmsFooterColumnService,
    ) {}

    async get(options: { platform?: string } = {}) {
        const platform = options.platform ?? "web";

        const [brand, socialRows, columnRows] = await Promise.all([
            this.siteBrand.getPublicBrand(),
            this.socialLinks.listPublished(),
            this.footerColumns.listPublished(),
        ]);

        const filteredSocial = socialRows.filter((row) => matchesPlatform(row.platforms, platform));
        const iconUrlMap = await resolveCompletedDisplayUrls(
            filteredSocial.map((row) => row.iconUploadId).filter(Boolean) as string[],
        );
        const socialLinks = filteredSocial.map((row) => ({
            id: row.id,
            label: row.label,
            href: row.href,
            iconPreset: row.iconPreset,
            iconUrl: urlFromMap(iconUrlMap, row.iconUploadId),
        }));

        const footerColumns = columnRows
            .filter((row) => matchesPlatform(row.platforms, platform))
            .map((row) => ({
                id: row.id,
                title: row.title,
                links: row.links.map((link) => ({
                    label: link.label,
                    href: link.href,
                })),
            }))
            .filter((row) => row.links.length > 0);

        return {
            brand,
            socialLinks,
            footerColumns,
        };
    }
}
