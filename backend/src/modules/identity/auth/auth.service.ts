import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { _config } from "@/config/config.js";
import type { ISmsService } from "@/modules/notifications/sms/sms.service.js";
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
import type { Vendor } from "@/modules/identity/vendors/vendor.schema.js";

export type PublicUser = {
    id: string;
    phone: string | null;
    email: string | null;
    name: string;
    avatar: string | null;
    role: User["role"];
    status: User["status"];
    vendor?: {
        id: string;
        city: string;
        onboardingStatus: string;
    };
};

export interface IAuthService {
    requestOtp(phoneRaw: string, ip?: string): Promise<{ phone: string; otp?: string }>;
    registerVendor(
        input: { name: string; phone: string; city: string },
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
}

function publicUser(user: User, vendor?: Vendor): PublicUser {
    return {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        ...(vendor
            ? {
                  vendor: {
                      id: vendor.id,
                      city: vendor.city,
                      onboardingStatus: vendor.onboardingStatus,
                  },
              }
            : {}),
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
        private readonly sms: ISmsService,
    ) {}

    private async withVendor(user: User): Promise<PublicUser> {
        const vendor = user.role === "vendor" ? await this.vendors.findByUserId(user.id) : undefined;
        return publicUser(user, vendor);
    }

    private exposeOtp(): boolean {
        return _config.NODE_ENV === "development";
    }

    private async sendOtp(phone: string, purpose: OtpPurpose, ip?: string) {
        await assertOtpRateLimit(phone, ip);
        const otp = generateOtp();
        await saveOtp(phone, otp, purpose);
        await this.sms.enqueue({
            to: phone,
            template: "login_otp",
            data: { otp },
        });

        return {
            phone,
            ...(this.exposeOtp() ? { otp } : {}),
        };
    }

    async requestOtp(phoneRaw: string, ip?: string) {
        const phone = normalizePhone(phoneRaw);
        const pending = await peekVendorPending(phone);
        const purpose: OtpPurpose = pending ? "vendor_register" : "login";
        return this.sendOtp(phone, purpose, ip);
    }

    async registerVendor(input: { name: string; phone: string; city: string }, ip?: string) {
        const phone = normalizePhone(input.phone);
        const existing = await this.users.findByPhone(phone);
        if (existing) {
            throw ApiError.conflict("phone already registered");
        }

        await saveVendorPending(phone, { name: input.name.trim(), city: input.city.trim() });
        return this.sendOtp(phone, "vendor_register", ip);
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
                phone,
                name: pendingData.name,
                city: pendingData.city,
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
