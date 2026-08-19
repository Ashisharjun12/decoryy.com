/**
 * Public API: SmsService.enqueue({ template, to, data }). Never call Twilio from other modules.
 */
export { SmsService, type ISmsService } from "@/modules/notifications/sms/sms.service.js";
