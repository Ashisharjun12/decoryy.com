import type { UserRole } from "../modules/identity/users/user.schema.js";

declare global {
    namespace Express {
        interface Request {
            actor?: {
                id: string;
                role: UserRole;
            };
        }
    }
}

export {};
