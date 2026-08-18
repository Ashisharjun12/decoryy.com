import type { PushMessage, PushPort } from "@/infrastructure/push/push.port.js";

export class ExpoPushProvider implements PushPort {
    async send(_message: PushMessage): Promise<void> {
        throw new Error("ExpoPushProvider.send is not implemented yet");
    }
}
