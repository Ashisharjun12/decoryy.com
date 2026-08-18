/** Role gate: user | vendor | admin. See docs/project-requriment.md */
import type { RequestHandler } from "express";
import { asyncHandler } from "@/shared/middlewares/asyncHandler.js";
import { ApiError } from "@/shared/errors/apiError.js";

export type ActorRole = "user" | "vendor" | "admin";

export function requireRole(...roles: ActorRole[]): RequestHandler {
    return asyncHandler((req, _res, next) => {
        const role = (req as { actor?: { role?: ActorRole } }).actor?.role;
        if (!role || !roles.includes(role)) {
            throw ApiError.forbidden("insufficient role");
        }
        next();
    });
}
