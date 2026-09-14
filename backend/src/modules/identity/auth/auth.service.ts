import { randomInt, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { _config } from "@/config/config.js";
import type { INotificationService } from "@/modules/notifications/notification.service.js";
import { ApiError } from "@/shared/errors/apiError.js";
import {
    assertOtpRateLimit,
    consumeOtp,
    peekOtp,
    peekVendorPending,
    saveOtp,
    saveVendorPending,
    takeVendorPending,
    type OtpPurpose,
} from "@/modules/identity/auth/otp.store.js";
import { normalizePhone } from "@/modules/identity/auth/phone.js";
import {
    resolveDevice,
    type AuthTokens,
    type ClientType,
    type Device,
    type ISessionService,
} from "@/modules/identity/sessions/session.service.js";
import type { IUserService } from "@/modules/identity/users/user.service.js";
import type { User } from "@/modules/identity/users/user.schema.js";
import type { IVendorService } from "@/modules/identity/vendors/vendor.service.js";
import type { PublicVendorProfile } from "@/modules/identity/vendors/vendor.public.js";
import type { VendorRegisterInput } from "@/modules/identity/vendors/vendor.dto.js";

export type PublicUser = {
    id: string;
    phone: string | null;
    email: string | null;
    name: string;
    avatar: string | null;
    role: User["role"];
    status: User["status"];
    linkedGoogle: boolean;
    vendor?: PublicVendorProfile;
};

export interface IAuthService {
    requestOtp(
        phoneRaw: string,
        ip?: string,
        androidAppHash?: string,
    ): Promise<{ phone: string; otp?: string }>;
    registerVendor(
        input: VendorRegisterInput & { phone: string; androidAppHash?: string },
        ip?: string,
    ): Promise<{ phone: string; otp?: string }>;
    verifyOtp(input: {
        phone: string;
        otp: string;
        clientType: ClientType;
        device?: Device;
    }): Promise<{ user: PublicUser; tokens: AuthTokens }>;
    googleLogin(input: {
        idToken: string;
        clientType: ClientType;
        device?: Device;
    }): Promise<{ user: PublicUser; tokens: AuthTokens }>;
    adminLogin(input: {
        email: string;
        password: string;
        clientType: ClientType;
        device?: Device;
    }): Promise<{ user: PublicUser; tokens: AuthTokens }>;
    refresh(input: {
        refreshToken: string;
        clientType: ClientType;
        device?: Device;
    }): Promise<{ user: PublicUser; tokens: AuthTokens }>;
    logout(refreshToken: string): Promise<void>;
    me(userId: string): Promise<PublicUser>;
    linkPhone(actorId: string, phoneRaw: string, otp: string): Promise<PublicUser>;
    linkGoogle(actorId: string, idToken: string): Promise<PublicUser>;
}

function publicUser(user: User, vendor?: PublicVendorProfile): PublicUser {
    return {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        linkedGoogle: user.googleId != null,
        ...(vendor ? { vendor } : {}),
    };
}

function generateOtp(): string {
    return String(randomInt(100000, 1000000));
}

function isUniqueViolation(err: unknown): boolean {
    let current: unknown = err;
    for (let i = 0; i < 5 && current; i++) {
        if (typeof current === "object" && current !== null && "code" in current) {
            if ((current as { code?: string }).code === "23505") {
                return true;
            }
        }
        current =
            typeof current === "object" && current !== null && "cause" in current
                ? (current as { cause?: unknown }).cause
                : undefined;
    }
    return false;
}

export class AuthService implements IAuthService {
    constructor(
        private readonly users: IUserService,
        private readonly vendors: IVendorService,
        private readonly sessions: ISessionService,
        private readonly notifications: INotificationService,
    ) {}

    private async withVendor(user: User): Promise<PublicUser> {
        const vendor =
            user.role === "vendor"
                ? await this.vendors.findPublicProfileByUserId(user.id)
                : undefined;
        return publicUser(user, vendor);
    }

    private exposeOtp(): boolean {
        return _config.NODE_ENV === "development";
    }

    private async sendOtp(
        phone: string,
        purpose: OtpPurpose,
        ip?: string,
        androidAppHash?: string,
    ) {
        await this.notifications.assertCanSend("LOGIN_OTP");
        await assertOtpRateLimit(phone, ip);
        const otp = generateOtp();
        await saveOtp(phone, otp, purpose);
        await this.notifications.notify({
            event: "LOGIN_OTP",
            recipient: { phone },
            data: {
                otp,
                ...(androidAppHash ? { androidAppHash } : {}),
            },
            idempotencyKey: randomUUID(),
        });

        return {
            phone,
            ...(this.exposeOtp() ? { otp } : {}),
        };
    }

    async requestOtp(phoneRaw: string, ip?: string, androidAppHash?: string) {
        const phone = normalizePhone(phoneRaw);
        const pending = await peekVendorPending(phone);
        const purpose: OtpPurpose = pending ? "vendor_register" : "login";
        return this.sendOtp(phone, purpose, ip, androidAppHash);
    }

    async registerVendor(input: VendorRegisterInput & { phone: string; androidAppHash?: string }, ip?: string) {
        const phone = normalizePhone(input.phone);
        const existing = await this.users.findByPhone(phone);
        if (existing) {
            throw ApiError.conflict("phone already registered");
        }

        await saveVendorPending(phone, {
            name: input.name.trim(),
            email: input.email.trim().toLowerCase(),
            phone,
            altPhone: input.altPhone,
            cityId: input.cityId,
            shopAddress: input.shopAddress.trim(),
            pincode: input.pincode,
            shopImageUploadId: input.shopImageUploadId,
        });
        return this.sendOtp(phone, "vendor_register", ip, input.androidAppHash);
    }

    async verifyOtp(input: {
        phone: string;
        otp: string;
        clientType: ClientType;
        device?: Device;
    }): Promise<{ user: PublicUser; tokens: AuthTokens }> {
        const phone = normalizePhone(input.phone);
        const pending = await peekVendorPending(phone);
        const existingOtp = await peekOtp(phone);

        if (existingOtp?.purpose === "vendor_register" && !pending) {
            throw ApiError.badRequest("vendor registration expired, register again");
        }
        if (pending && existingOtp?.purpose === "login") {
            throw ApiError.conflict("finish vendor signup");
        }

        const purpose = await consumeOtp(phone, input.otp);
        const device = resolveDevice(input.clientType, input.device);

        let user = await this.users.findByPhone(phone);

        if (purpose === "vendor_register") {
            const pendingData = await takeVendorPending(phone);
            if (user) {
                throw ApiError.conflict("phone already registered");
            }
            user = await this.vendors.createWithUser({
                name: pendingData.name,
                email: pendingData.email,
                phone,
                altPhone: pendingData.altPhone,
                cityId: pendingData.cityId,
                shopAddress: pendingData.shopAddress,
                pincode: pendingData.pincode,
                shopImageUploadId: pendingData.shopImageUploadId,
            });
        } else if (!user) {
            user = await this.users.create({
                phone,
                name: "User",
                role: "user",
                phoneVerifiedAt: new Date(),
            });
        } else {
            if (!user.phoneVerifiedAt) {
                await this.users.markPhoneVerified(user.id);
                user = { ...user, phoneVerifiedAt: new Date() };
            }
        }

        const tokens = await this.sessions.issue(user, device);
        return { user: await this.withVendor(user), tokens };
    }

    async googleLogin(input: {
        idToken: string;
        clientType: ClientType;
        device?: Device;
    }): Promise<{ user: PublicUser; tokens: AuthTokens }> {
        if (!_config.GOOGLE_CLIENT_ID) {
            throw ApiError.internalServerError("GOOGLE_CLIENT_ID is not configured");
        }

        const client = new OAuth2Client(_config.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: input.idToken,
            audience: _config.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload?.sub) {
            throw ApiError.unauthorized("invalid google token");
        }

        let user = await this.users.findByGoogleId(payload.sub);

        if (!user && payload.email) {
            const byEmail = await this.users.findByEmail(payload.email);
            if (byEmail) {
                if (byEmail.googleId == null && byEmail.role === "user") {
                    user = await this.users.linkGoogleId(byEmail.id, payload.sub);
                } else {
                    throw ApiError.conflict("cannot link google to this account");
                }
            }
        }

        if (!user) {
            user = await this.users.create({
                googleId: payload.sub,
                email: payload.email ?? null,
                name: payload.name || "User",
                role: "user",
                avatar: payload.picture ?? null,
            });
        } else if (!user.avatar && payload.picture) {
            user = await this.users.setAvatar(user.id, payload.picture);
        }

        const tokens = await this.sessions.issue(user, resolveDevice(input.clientType, input.device));
        return { user: await this.withVendor(user), tokens };
    }

    async adminLogin(input: {
        email: string;
        password: string;
        clientType: ClientType;
        device?: Device;
    }): Promise<{ user: PublicUser; tokens: AuthTokens }> {
        const email = input.email.trim().toLowerCase();
        let user = await this.users.findByEmail(email);

        if (user) {
            await this.assertAdminPassword(user, input.password);
        } else {
            if (!_config.ADMIN_EMAIL || !_config.ADMIN_PASSWORD) {
                throw ApiError.unauthorized("invalid credentials");
            }
            if (email !== _config.ADMIN_EMAIL.toLowerCase() || input.password !== _config.ADMIN_PASSWORD) {
                throw ApiError.unauthorized("invalid credentials");
            }
            const passwordHash = await bcrypt.hash(_config.ADMIN_PASSWORD, 10);
            try {
                user = await this.users.create({
                    email: _config.ADMIN_EMAIL.toLowerCase(),
                    name: "Admin",
                    role: "admin",
                    passwordHash,
                });
            } catch (err) {
                if (!isUniqueViolation(err)) {
                    throw err;
                }
                user = await this.users.findByEmail(email);
                if (!user) {
                    throw ApiError.unauthorized("invalid credentials");
                }
                await this.assertAdminPassword(user, input.password);
            }
        }

        const tokens = await this.sessions.issue(user, resolveDevice(input.clientType, input.device));
        return { user: await this.withVendor(user), tokens };
    }

    private async assertAdminPassword(user: User, password: string): Promise<void> {
        if (user.role !== "admin" || !user.passwordHash) {
            throw ApiError.unauthorized("invalid credentials");
        }
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            throw ApiError.unauthorized("invalid credentials");
        }
    }

    async refresh(input: {
        refreshToken: string;
        clientType: ClientType;
        device?: Device;
    }): Promise<{ user: PublicUser; tokens: AuthTokens }> {
        const { user, tokens } = await this.sessions.rotate(
            input.refreshToken,
            resolveDevice(input.clientType, input.device),
        );
        return { user: await this.withVendor(user), tokens };
    }

    async logout(refreshToken: string): Promise<void> {
        await this.sessions.revoke(refreshToken);
    }

    private async assertCustomerActor(actorId: string): Promise<User> {
        const user = await this.users.findById(actorId);
        if (!user) {
            throw ApiError.unauthorized("user not found");
        }
        if (user.status === "blocked") {
            throw ApiError.forbidden("account blocked");
        }
        if (user.role !== "user") {
            throw ApiError.forbidden("insufficient role");
        }
        return user;
    }

    async linkPhone(actorId: string, phoneRaw: string, otp: string): Promise<PublicUser> {
        const actor = await this.assertCustomerActor(actorId);
        const phone = normalizePhone(phoneRaw);

        if (actor.phone) {
            if (actor.phone === phone) {
                return this.withVendor(actor);
            }
            throw ApiError.conflict("phone already linked");
        }

        const owner = await this.users.findByPhone(phone);
        if (owner && owner.id !== actor.id) {
            throw ApiError.conflict("phone already registered");
        }

        await consumeOtp(phone, otp);

        try {
            const user = await this.users.linkPhone(actor.id, phone);
            return this.withVendor(user);
        } catch (err) {
            if (isUniqueViolation(err)) {
                throw ApiError.conflict("phone already registered");
            }
            throw err;
        }
    }

    async linkGoogle(actorId: string, idToken: string): Promise<PublicUser> {
        const actor = await this.assertCustomerActor(actorId);

        if (actor.googleId) {
            throw ApiError.conflict("google already linked");
        }

        if (!_config.GOOGLE_CLIENT_ID) {
            throw ApiError.internalServerError("GOOGLE_CLIENT_ID is not configured");
        }

        const client = new OAuth2Client(_config.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken,
            audience: _config.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload?.sub) {
            throw ApiError.unauthorized("invalid google token");
        }

        const byGoogle = await this.users.findByGoogleId(payload.sub);
        if (byGoogle && byGoogle.id !== actor.id) {
            throw ApiError.conflict("google already registered");
        }

        if (payload.email) {
            const byEmail = await this.users.findByEmail(payload.email);
            if (byEmail && byEmail.id !== actor.id) {
                throw ApiError.conflict("email already registered");
            }
        }

        try {
            const user = await this.users.linkGoogleProfile(actor.id, {
                googleId: payload.sub,
                email: payload.email ?? null,
                avatar: payload.picture ?? null,
            });
            return this.withVendor(user);
        } catch (err) {
            if (isUniqueViolation(err)) {
                throw ApiError.conflict("google already registered");
            }
            throw err;
        }
    }

    async me(userId: string): Promise<PublicUser> {
        const user = await this.users.findById(userId);
        if (!user) {
            throw ApiError.unauthorized("user not found");
        }
        if (user.status === "blocked") {
            throw ApiError.forbidden("account blocked");
        }
        return this.withVendor(user);
    }
}
