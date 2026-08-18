import type { SmsMessage, SmsPort } from "@/infrastructure/sms/sms.port.js";

export class Msg91Provider implements SmsPort {
    async send(_message: SmsMessage): Promise<void> {
        throw new Error("Msg91Provider.send is not implemented yet");
    }
}
