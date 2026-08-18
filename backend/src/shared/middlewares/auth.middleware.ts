/** JWT → req.actor. Implement with identity tokens. See docs/project-requriment.md */
import type { RequestHandler } from "express";
import { asyncHandler } from "@/shared/middlewares/asyncHandler.js";
import { ApiError } from "@/shared/errors/apiError.js";

export const authRequired: RequestHandler = asyncHandler((req, _res, next) => {
    const header = req.headers.authorization;
    if (!header) {
        throw ApiError.unauthorized("missing authorization header");
    }
    next();
});

export const authOptional: RequestHandler = asyncHandler((_req, _res, next) => {
    next();
});
