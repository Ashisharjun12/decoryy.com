import { ErrorRequestHandler } from "express";
import { logger } from "@/utils/logger.js";
import { ApiError } from "@/shared/errors/apiError.js";


//error handling middleware
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
    logger.error({ err, method: req.method, path: req.path, requestId: req.id })


    if (err instanceof ApiError && err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors
        })
    }

    //unexpectd crash
    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        errors: []
    })

}