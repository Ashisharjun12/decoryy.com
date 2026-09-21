import { z } from "zod";

export const placesAutocompleteQueryDto = z.object({
    input: z.string().trim().min(2).max(200),
    sessionToken: z.string().trim().min(8).max(128).optional(),
    location: z
        .string()
        .trim()
        .regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/, "location must be lat,lng")
        .optional(),
});

export const placeIdParamsDto = z.object({
    placeId: z.string().trim().min(1).max(256),
});

export const placeDetailsBodyDto = z.object({
    sessionToken: z.string().trim().min(8).max(128).optional(),
});
