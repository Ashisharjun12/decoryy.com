# Notifications module

Templates, preferences, notify + outbox, BullMQ workers. Kafka is not used.

## Public API (`@/modules/notifications`)

- `notificationService.assertCanSend(event)`
- `notificationService.notify({ event, userId?, recipient?, data, idempotencyKey, scheduledAt? })`
- Admin template router, user preference router

Identity OTP:

```text
assertCanSend(LOGIN_OTP) → saveOtp → notify(LOGIN_OTP, phone, otp)
```

Booking transactional SMS (requires `recipient.phone`; normalized to E.164 `+91` at dispatch):

All SMS `to` addresses are passed through `normalizePhoneForSms()` in `notification.service` (10-digit checkout numbers and existing `+91` account phones both work).

| Event | Recipient | Channels |
|-------|-----------|----------|
| `BOOKING_CONFIRMED` | Customer phone | email + sms |
| `BOOKING_ASSIGNED` | Customer phone | email + sms |
| `VENDOR_NEW_JOB` | Vendor phone | push + in_app + sms |
| `PAYOUT_PAID` | Vendor phone + email | email + sms + push + in_app |
| `PAYOUT_FAILED` | Vendor phone + email | email + sms + push + in_app |

Track links in SMS use `WEB_APP_ORIGIN` + `/account/bookings/{orderId}`.

**India production:** register matching DLT templates with Twilio/MSG91 before live SMS. Dev uses `SMS_PROVIDER=dev` (worker logs only, no send).

## Tables

| Table | Role |
|---|---|
| `notification_templates` | key, type, channel, locale, editable, isActive |
| `notification_template_versions` | immutable versions; one active |
| `user_notification_preferences` | per-user channel + promo flags |
| `notifications` | send intent + status |
| `notification_deliveries` | provider attempts |
| `notifications_outbox` | TX-safe handoff to BullMQ |
| `notification_inbox` | in-app rows |

Seed: `login_otp` (sms), `booking_confirmed` (email + sms), `booking_assigned` (email + sms), `vendor_new_job` (push + in_app + sms), `chat_message` (push + in_app), `payout_paid` / `payout_failed` (email + sms + push + in_app).

Deploy: `pnpm db:migrate` then `pnpm db:seed:templates` (idempotent). Source of truth: `src/db/seeds/notification-templates.seed.ts`. Generate SQL: `pnpm db:seed:templates:sql`.

## Policy

[`policy/events.ts`](../src/modules/notifications/policy/events.ts): channel routing per event. `LOGIN_OTP` → sms, required. Booking events → sms optional (skipped if phone missing).

## Queues

| Queue | Worker |
|---|---|
| `notify.relay` | claim outbox, enqueue channel job; sweep every 5s |
| `sms` | Twilio/dev |
| `notify.email` | SMTP (`SMTP_USER` is From) |
| `notify.push` | Expo |
| `notify.in_app` | insert inbox |

## Layout

```text
modules/notifications/
  schema.ts
  container.ts
  notification.service.ts
  notification.repository.ts
  policy/events.ts
  lib/render.ts
  templates/template.service.ts
  preferences/preference.service.ts
  jobs/relay.job.ts, deliver.job.ts
```

Infrastructure: `sms/`, `email/` (smtp only), `push/`, `whatsapp/` (noop).

## Env

- `SMS_PROVIDER=dev|twilio`
- `WEB_APP_ORIGIN` — customer booking track URLs in SMS/email (e.g. `http://localhost:5174` dev)

## Manual test

1. Run API + `pnpm worker:dev` with `SMS_PROVIDER=dev`.
2. Place a booking → worker logs `DevSmsProvider` with booking confirmed SMS.
3. Admin assigns vendor → vendor SMS logged.
4. Vendor accepts → customer assigned SMS logged.
