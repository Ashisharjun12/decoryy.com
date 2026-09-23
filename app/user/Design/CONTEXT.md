# DeccorBuddys — user app context

Living brief for the customer mobile app (`app/user`). Update this file when each slice ships.

## Product

- **Brand:** DeccorBuddys (customer app).
- **Parity target:** [`app/web`](../../web) customer journeys — not [`app/vendor`](../../vendor) partner flows.
- **Stack:** Expo 54, Expo Router, NativeWind, `@/components/ui` (shadcn RN primitives).

## Non-negotiables

- UI-first per slice; no API until the slice explicitly allows it.
- Thin routes under `app/`; feature code under `module/*`.
- Mock data / mock services where the slice says so.
- Tokens: [`lib/theme.ts`](../lib/theme.ts), Tailwind semantic colors — no random purple gradients or generic AI landing layouts.

## Current slice

| Field | Value |
|-------|--------|
| Name | Onboarding (mock) |
| Status | done |
| API | None — `mock-otp.service.ts` only |
| Mock OTP | `123456` (see `module/onboarding/lib/onboarding-copy.ts`) |
| Screens | Welcome → Sign-in → Verify OTP → placeholder Home |

## Module map

| Path | Owns |
|------|------|
| `module/onboarding/` | Welcome UI, phone + OTP components, copy, mock OTP service |
| `module/auth/` | `getAuthRedirectPath` |
| `store/auth.store.ts` | Welcome flag, mock session, pending OTP |
| `lib/secure-storage.ts` | `hasSeenWelcome`, mock access token |
| `lib/phone.ts` | India phone formatting |
| `components/shell/` | `Screen`, `LoadingPlaceholder` |
| `components/ui/` | Shared primitives — change rarely |

## Screen inventory

### Done (this slice)

- [x] `app/index.tsx` — auth redirect
- [x] `app/(onboarding)/welcome.tsx`
- [x] `app/(onboarding)/sign-in.tsx`
- [x] `app/(onboarding)/verify-otp.tsx`
- [x] `app/(app)/index.tsx` — placeholder home

### Planned (later)

- [ ] Tab shell (web `MobileBottomNav` parity)
- [ ] Home catalog / CMS rails
- [ ] Explore, product, bag, checkout
- [ ] Bookings, notifications, account
- [ ] Real OTP API (`backend/docs/identity.md`, customer flow)

## Design references

- Theme: [`lib/theme.ts`](../lib/theme.ts)
- Web mobile: `HomeMobileHero`, `MobileBottomNav`, `BookingCard`
- Vendor reference (onboarding UX only): `app/(onboarding)/welcome.tsx`, onboarding components

## Out of scope (current slice)

- `axios`, React Query, sockets
- Tabs, catalog, payments
- SMS autofill wiring

## History (newest first)

```text
2026-03-23 — Onboarding slice (mock) — Welcome + sign-in + OTP + placeholder home; CONTEXT/AGENTS; auth.store mock session — app/(onboarding), app/(app), module/onboarding, module/auth, store/, lib/, components/shell/
```
