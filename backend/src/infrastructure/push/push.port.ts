export type PushMessage = {
    to: string;
    title: string;
    body: string;
    data?: Record<string, string>;
};

export interface PushPort {
    send(message: PushMessage): Promise<void>;
}
