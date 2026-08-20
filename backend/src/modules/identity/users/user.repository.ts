import { eq } from "drizzle-orm";
import { db } from "@/db/postgres-client.js";
import { users, type NewUser, type User } from "@/modules/identity/users/user.schema.js";

export interface IUserRepository {
    findById(id: string): Promise<User | undefined>;
    findByPhone(phone: string): Promise<User | undefined>;
    findByEmail(email: string): Promise<User | undefined>;
    findByGoogleId(googleId: string): Promise<User | undefined>;
    create(data: NewUser): Promise<User>;
    markPhoneVerified(id: string): Promise<void>;
    linkGoogleId(id: string, googleId: string): Promise<User>;
    setAvatar(id: string, avatar: string): Promise<User>;
}

export class UserRepository implements IUserRepository {
    async findById(id: string): Promise<User | undefined> {
        const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return row;
    }

    async findByPhone(phone: string): Promise<User | undefined> {
        const [row] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
        return row;
    }

    async findByEmail(email: string): Promise<User | undefined> {
        const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return row;
    }

    async findByGoogleId(googleId: string): Promise<User | undefined> {
        const [row] = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
        return row;
    }

    async create(data: NewUser): Promise<User> {
        const [row] = await db.insert(users).values(data).returning();
        return row;
    }

    async markPhoneVerified(id: string): Promise<void> {
        await db
            .update(users)
            .set({ phoneVerifiedAt: new Date(), updatedAt: new Date() })
            .where(eq(users.id, id));
    }

    async linkGoogleId(id: string, googleId: string): Promise<User> {
        const [row] = await db
            .update(users)
            .set({ googleId, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        if (!row) {
            throw new Error("failed to link google id");
        }
        return row;
    }

    async setAvatar(id: string, avatar: string): Promise<User> {
        const [row] = await db
            .update(users)
            .set({ avatar, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        if (!row) {
            throw new Error("failed to set avatar");
        }
        return row;
    }
}
