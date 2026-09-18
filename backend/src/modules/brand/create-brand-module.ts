import { BrandAdminController } from "@/modules/brand/brand.admin.controller.js";
import { createBrandAdminRouter } from "@/modules/brand/brand.admin.route.js";
import { SiteBrandService } from "@/modules/brand/site-brand.service.js";
import { SiteShellService } from "@/modules/brand/site-shell.service.js";
import { SettingRepository } from "@/modules/ops/settings/setting.repository.js";
import { CmsSocialLinkRepository } from "@/modules/cms/social-links/social-link.repository.js";
import { CmsSocialLinkService } from "@/modules/cms/social-links/social-link.service.js";
import { CmsFooterColumnRepository } from "@/modules/cms/footer-columns/footer-column.repository.js";
import { CmsFooterColumnService } from "@/modules/cms/footer-columns/footer-column.service.js";

export function createBrandModule() {
    const settings = new SettingRepository();
    const siteBrandService = new SiteBrandService(settings);
    const socialLinkRepository = new CmsSocialLinkRepository();
    const socialLinkService = new CmsSocialLinkService(socialLinkRepository);
    const footerColumnRepository = new CmsFooterColumnRepository();
    const footerColumnService = new CmsFooterColumnService(footerColumnRepository);
    const siteShellService = new SiteShellService(
        siteBrandService,
        socialLinkService,
        footerColumnService,
    );

    const brandAdminController = new BrandAdminController(
        siteBrandService,
        socialLinkService,
        footerColumnService,
    );

    return {
        brandAdminRouter: createBrandAdminRouter(brandAdminController),
        siteShellService,
        siteBrandService,
        socialLinkService,
        footerColumnService,
    };
}
