import { ApiError } from "@/shared/errors/apiError.js";
import type { ISettingRepository } from "@/modules/ops/settings/setting.repository.js";
import {
    NOTIFY_CHANNELS_KEY,
    mergeNotificationChannels,
    type NotificationChannel,
    type NotificationChannelFlags,
} from "@/modules/ops/settings/notification-channels.js";
import {
    PAY_METHODS_KEY,
    exclusiveOnlineProviders,
    mergePaymentMethods,
    toPublicPaymentMethods,
    type PaymentMethodFlags,
    type PublicPaymentMethods,
} from "@/modules/ops/settings/payment-methods.js";
import {
    DEFAULT_PAYOUT_POLICY,
    mergePayoutPolicy,
    PAYOUT_POLICY_KEY,
    type PayoutPolicy,
} from "@/modules/ops/settings/payout-policy.js";

const CHANNEL_CACHE_TTL_MS = 5_000;

export type PatchNotificationChannelsInput = Partial<NotificationChannelFlags>;
export type PatchPaymentMethodsInput = Partial<PaymentMethodFlags>;
export type PatchPayoutPolicyInput = Partial<PayoutPolicy>;

export interface ISettingService {
    getNotificationChannels(): Promise<NotificationChannelFlags>;
    patchNotificationChannels(
        input: PatchNotificationChannelsInput,
    ): Promise<NotificationChannelFlags>;
    isChannelEnabled(channel: NotificationChannel): Promise<boolean>;
    getPaymentMethods(): Promise<PublicPaymentMethods>;
    patchPaymentMethods(input: PatchPaymentMethodsInput): Promise<PublicPaymentMethods>;
    getPayoutPolicy(): Promise<PayoutPolicy>;
    patchPayoutPolicy(input: PatchPayoutPolicyInput): Promise<PayoutPolicy>;
}

export class SettingService implements ISettingService {
    private notifyCache: { flags: NotificationChannelFlags; at: number } | null = null;
    private payCache: { flags: PaymentMethodFlags; at: number } | null = null;
    private payoutCache: { policy: PayoutPolicy; at: number } | null = null;

    constructor(private readonly settings: ISettingRepository) {}

    async getNotificationChannels(): Promise<NotificationChannelFlags> {
        if (this.notifyCache && Date.now() - this.notifyCache.at < CHANNEL_CACHE_TTL_MS) {
            return this.notifyCache.flags;
        }

        const row = await this.settings.findByKey(NOTIFY_CHANNELS_KEY);
        const flags = mergeNotificationChannels(row?.value);
        if (!row) {
            await this.settings.upsert(NOTIFY_CHANNELS_KEY, flags);
        }
        this.notifyCache = { flags, at: Date.now() };
        return flags;
    }

    async patchNotificationChannels(
        input: PatchNotificationChannelsInput,
    ): Promise<NotificationChannelFlags> {
        const current = await this.getNotificationChannels();
        const flags: NotificationChannelFlags = {
            ...current,
            ...input,
        };
        await this.settings.upsert(NOTIFY_CHANNELS_KEY, flags);
        this.notifyCache = { flags, at: Date.now() };
        return flags;
    }

    async isChannelEnabled(channel: NotificationChannel): Promise<boolean> {
        const flags = await this.getNotificationChannels();
        return flags[channel];
    }

    async getPaymentMethods(): Promise<PublicPaymentMethods> {
        const flags = await this.loadPaymentFlags();
        return toPublicPaymentMethods(flags);
    }

    async patchPaymentMethods(input: PatchPaymentMethodsInput): Promise<PublicPaymentMethods> {
        const current = await this.loadPaymentFlags();
        const flags = exclusiveOnlineProviders(
            {
                ...current,
                ...input,
            },
            input,
        );
        if (!flags.cod && !flags.razorpay && !flags.cashfree) {
            throw ApiError.badRequest("enable at least one payment method");
        }
        await this.settings.upsert(PAY_METHODS_KEY, flags);
        this.payCache = { flags, at: Date.now() };
        return toPublicPaymentMethods(flags);
    }

    async getPayoutPolicy(): Promise<PayoutPolicy> {
        if (this.payoutCache && Date.now() - this.payoutCache.at < CHANNEL_CACHE_TTL_MS) {
            return this.payoutCache.policy;
        }
        const row = await this.settings.findByKey(PAYOUT_POLICY_KEY);
        const policy = mergePayoutPolicy(row?.value ?? DEFAULT_PAYOUT_POLICY);
        if (!row) {
            await this.settings.upsert(PAYOUT_POLICY_KEY, policy);
        }
        this.payoutCache = { policy, at: Date.now() };
        return policy;
    }

    async patchPayoutPolicy(input: PatchPayoutPolicyInput): Promise<PayoutPolicy> {
        const current = await this.getPayoutPolicy();
        const policy = mergePayoutPolicy({ ...current, ...input });
        await this.settings.upsert(PAYOUT_POLICY_KEY, policy);
        this.payoutCache = { policy, at: Date.now() };
        return policy;
    }

    private async loadPaymentFlags(): Promise<PaymentMethodFlags> {
        if (this.payCache && Date.now() - this.payCache.at < CHANNEL_CACHE_TTL_MS) {
            return this.payCache.flags;
        }
        const row = await this.settings.findByKey(PAY_METHODS_KEY);
        const merged = mergePaymentMethods(row?.value);
        const flags = exclusiveOnlineProviders(merged);
        if (
            !row ||
            merged.razorpay !== flags.razorpay ||
            merged.cashfree !== flags.cashfree
        ) {
            await this.settings.upsert(PAY_METHODS_KEY, flags);
        }
        this.payCache = { flags, at: Date.now() };
        return flags;
    }
}
