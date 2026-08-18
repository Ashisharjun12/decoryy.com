export type SmsMessage = {
    to: string;
    template: string;
    data: Record<string, string>;
};

export interface SmsPort {
    send(message: SmsMessage): Promise<void>;
}
