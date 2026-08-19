import { eq } from "drizzle-orm";
import { db } from "@/db/postgres-client.js";
import { users, type User } from "@/modules/identity/users/user.schema.js";
import { vendors, type NewVendor, type Vendor } from "@/modules/identity/vendors/vendor.schema.js";

export interface IVendorRepository {
    findByUserId(userId: string): Promise<Vendor | undefined>;
    create(data: NewVendor): Promise<Vendor>;
    createWithUser(input: { phone: string; name: string; city: string }): Promise<User>;
}

export class VendorRepository implements IVendorRepository {
    async findByUserId(userId: string): Promise<Vendor | undefined> {
        const [row] = await db.select().from(vendors).where(eq(vendors.userId, userId)).limit(1);
        return row;
    }

    async create(data: NewVendor): Promise<Vendor> {
        const [row] = await db.insert(vendors).values(data).returning();
        return row;
    }

    async createWithUser(input: { phone: string; name: string; city: string }): Promise<User> {
        return db.transaction(async (tx) => {
            const [user] = await tx
                .insert(users)
                .values({
                    phone: input.phone,
                    name: input.name,
                    role: "vendor",
                    phoneVerifiedAt: new Date(),
                })
                .returning();
            if (!user) {
                throw new Error("failed to create vendor user");
            }
            await tx.insert(vendors).values({
                userId: user.id,
                city: input.city,
            });
            return user;
        });
    }
}
