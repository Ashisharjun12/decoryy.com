import { cacheService } from "@/infrastructure/cache/index.js";
import { CMS_HOME_PREFIX, CMS_SITE_SHELL_PREFIX } from "./cms-cache.keys.js";

export async function invalidateHome(): Promise<void> {
    await cacheService.delByPrefix(CMS_HOME_PREFIX);
}

export async function invalidateSiteShell(): Promise<void> {
    await cacheService.delByPrefix(CMS_SITE_SHELL_PREFIX);
}
