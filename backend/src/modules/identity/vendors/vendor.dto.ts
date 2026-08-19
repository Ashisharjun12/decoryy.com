import { z } from "zod";

export const vendorRegisterDto = z.object({
    name: z.string().min(2),
    phone: z.string().min(10),
    city: z.string().min(2),
});
