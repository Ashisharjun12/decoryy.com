export type SmsMessage = {
    to: string;
    template: string;
    data: Record<string, string>;
};

export interface ISmsProvider {
    send(message: SmsMessage): Promise<void>;
}
