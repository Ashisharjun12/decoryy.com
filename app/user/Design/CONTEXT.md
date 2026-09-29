# DeccorBuddys — user app context

Living brief for the customer mobile app (`app/user`). Update this file when each slice ships.

## Product

- **Brand:** DeccorBuddys (customer app).
- **Parity target:** [`app/web`](../../web) customer journeys — not [`app/vendor`](../../vendor) partner flows.
- **Stack:** Expo 54, Expo Router, NativeWind, `@/components/ui` (shadcn RN primitives), TanStack Query for catalog/home feeds.

## Non-negotiables

- Thin routes under `app/`; feature code under `module/*`; HTTP in `api/` (vendor-aligned).
- Tokens: [`lib/theme.ts`](../lib/theme.ts), Tailwind semantic colors — no random purple gradients or generic AI landing layouts.
- Home feed uses **real** CMS + catalog APIs when location is set; PDP uses **real** `GET /catalog/products/:id` when location is set.

## Current slice

| Field | Value |
|-------|--------|
| Name | Home feed web parity |
| Status | done |
| Home UI | Banner → CMS android `layoutBlocks` when configured; else catalog discovery (categories + section/product rails) like web; city sheet on search bar; no full-screen location gate |
| APIs | CMS home (when `status=ready`), sections/catalog discovery fallback, cart CRUD + coupon, orders/payments, addresses, geo |
| Location | Tab bootstrap: hydrate → `fetchCities` → default first city (`source: default`) → optional GPS upgrade; header / city sheet / select-location voluntary; no auto push to location on home |
| Parity | Normalization from web `home-catalog` / home CMS hero slides |
| Bottom nav | Home → Category → **Explore** → Instant → Profile; Instant tab orange (`INSTANT_TAB_HEX`); other tabs yellow primary |

## Module map

| Path | Owns |
|------|------|
| `module/onboarding/` | Welcome UI, phone + OTP, `otp.service`, SMS autofill hook |
| `module/home/` | `HomeTopBar` → `select-location` route; `HomeSearchBar` + city picker; CMS feed components |
| `module/location/` | `SelectLocationScreen`, `AddAddressScreen`, `ConfirmAddressMapScreen` (web-style form → Ola map + pin) |
| `module/geo/` | `OlaPinMapView`, `MapCenterPin`, `use-maps-sdk-config`, Ola auth (MapLibre) |
| `module/geo/` | `PlacesAddressAutocomplete` (maps API) |
| `module/booking/` | `CartScreen`, `CheckoutScreen`, cart/checkout components, `use-cart-query`, `place-order.ts`, `cart-types`, `proceed-to-checkout.ts`, `coupon-preview.ts` |
| `module/catalog/` | PLP + `ProductPdpScreen` (gallery chrome, breadcrumb, price, location, schedule/instant, coupon ticket rail, PDP details tabs, `ProductSimilarRail` + `ProductOtherCategoriesRail`, reviews API, WhatsApp + Book sticky CTA, customize sheet); hooks `use-product-detail-query`, `use-product-reviews-preview-query`, `use-similar-products-query`, `use-other-category-products-query`, `use-available-coupons` |
| `module/promotions/` | `CouponTicketCard` (rail/stack), `CouponOffersRail`, `CouponDetailSheet`, `CouponOffersFilterSheet`, `OffersScreen`; PDP horizontal coupons + `app/(app)/offers` (stacked tickets, filter, load more) |
| `module/account/` | Profile hub, `AddressFormSheet`, `use-addresses-query`, `AddressesScreen` (API) |
| `module/permissions/` | Post-login `enable-location` → `enable-notifications`; `use-permissions-setup-prompt` |
| `lib/notifications.ts`, `lib/location.ts`, `lib/camera.ts` | OS permission helpers (vendor-aligned) |
| `components/shell/SmoothScrollView.tsx` | Native smooth scroll defaults; web uses `lib/lenis-web` |
| `api/` | `client.ts`, `auth.api.ts`, `addresses.api.ts`, `maps.api.ts`, `cms.api.ts`, `products.api.ts`, `reviews.api.ts`, `promotions.api.ts`, `geo.api.ts`, `cart.api.ts`, `orders.api.ts`, `payments.api.ts` |
| `module/auth/` | `consumer-session`, `google-auth.service`, `link-google.service` |
| `module/onboarding/lib/otp-verify-errors.ts` | OTP_EXPIRED / INVALID / ATTEMPTS mapping |
| `lib/env.ts` | `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` |
| `lib/query-client.ts`, `lib/query-keys.ts` | Shared React Query client + home query keys |
| `lib/location-storage.ts`, `lib/location-label.ts`, `lib/detect-gps-location.ts` | Persist + format label; GPS city detect |
| `store/auth.store.ts` | Welcome flag, API session (access + refresh token storage), pending OTP |
| `store/location.store.ts` | Backend cities, pincode, hydrate + persist |
| `store/delivery-location.store.ts` | Selected delivery address + header subtitle; applies to location store |
| `store/cart.store.ts` | Cart item count from `GET /cart` when authenticated |
| `lib/mock/` | PDP products, legacy home mocks (unused on home path), addresses, support URLs |
| `lib/support-actions.ts` | Open WhatsApp / tel fallback |
| `components/shell/` | `Screen`, `ScreenBackButton`, `TabScreenTitle`, `AppTabBar`, `LoadingPlaceholder` |
| `components/ui/` | Shared primitives — change rarely |

## Screen inventory

### Done

- [x] Onboarding: welcome → login hub (Google / phone) → sign-in → verify OTP
- [x] Login hub Google — native sign-in, backend session; mock Google removed
- [x] Phone OTP — real API, SMS autofill, dev OTP hint when API returns `otp`
- [x] Account linking — add phone + link Google on profile/account (no duplicate-account merge)
- [x] Consumer identity — shop owners/staff can sign into customer app with same phone (admin excluded)
- [x] `app/(app)/index` — Home header Deliver to {name} + delivery bottom sheet (India, places search, saved addresses, Confirm); search bar quick city picker
- [x] `app/(app)/profile/addresses` — list/add/edit via `GET/POST/PATCH /user/addresses`
- [x] `app/(app)/category` — All = top-level grid only; parent drill-down = horizontal subcategory rail + 2-col product grid (sort + custom price, load more); `parentSlug` / `childSlug`
- [x] `app/(app)/search` — popular setups + debounced product/category search (location required)
- [x] `app/(app)/instant` — instant-only catalog (`GET /catalog/products?instant=1`), sort/price toolbar, infinite scroll + pull-to-refresh
- [x] `app/(app)/explore` — web `/explore` parity: category rail + city-wide or filtered product grid (sort/price, load more)
- [x] `whatsapp` (FAB action)
- [x] `app/(app)/profile` tab — settings-style grouped cards, OS notification toggle, log out pill; stack routes account, orders, addresses, returns, notifications, settings, help
- [x] Home header notifications bell → `profile/notifications`; bag → `app/(app)/cart`
- [x] `app/(app)/account` (redirect → profile/account), `search`, `product/[id]` (hidden from tab bar)
- [x] Product PDP — web mobile parity: `ProductPdpScreen`, reviews + coupons APIs, dual sticky CTA, add-to-bag → cart
- [x] `app/(app)/offers` — stacked ticket cards, product filter sheet, client load more; ticket rail on PDP above What's included
- [x] `app/(app)/cart` — bag list, promo, totals, proceed to checkout
- [x] `app/(app)/checkout` — customer, delivery, payment, summary, place order (COD + Razorpay), success sheet

### Planned (later)
- [ ] Search pagination / full PLP from search
- [ ] Bookings list + live map tracking
- [ ] Notifications API + push
- [ ] Access-token refresh interceptor (refresh token stored only)

## Design references

- Theme: [`lib/theme.ts`](../lib/theme.ts)
- Web: `HomeMobileHero`, `MobileBottomNav`, `HomeProductRail`, `use-home-discovery`, `cms.api`
- Vendor: tab icon spring only (`app/(app)/_layout.tsx` partner app)

## Out of scope (current slice)

- In-home category drill-down (web inline explorer on home); Category tab has full PLP
- Search results API
- iOS Google client / URL scheme
- Token refresh on 401, sockets, Ola map

## History (newest first)

```text
2026-09-28 — PDP other-categories rail — “Explore other categories” horizontal rail (city catalog minus current category); app `useOtherCategoryProductsQuery` + web `ProductOtherCategoriesRail`
2026-09-28 — PDP similar rail — “You may also like” header + amber ‹ ›; ~38% width cards (`HomeProductCard` compact); web `ProductRelatedRail` + `PRODUCT_RAIL_PDP_SIMILAR_ITEM_CLASS`
2026-09-28 — Cart + checkout — `/(app)/cart`, checkout screen, promo/qty, COD + Razorpay place-order, success sheet
2026-09-28 — PDP addon sheet — `HomeBottomSheetModal`, horizontal ~2-card rail; reset selection on open
2026-09-28 — `ScreenBackButton` + `goBackOneScreen`; PDP offers on product stack; back no longer forces home on PDP/offers
2026-09-28 — Offers screen — vertical ticket cards, filter sheet (setup/other), client load more; removed copy blurb
2026-09-28 — Screen `gutter` + `SCREEN_HORIZONTAL_GUTTER` (20px); offers + checkout stack pages
2026-09-28 — Coupons location — retry cityId when pincode not serviceable (promotions API parity with catalog)
2026-09-28 — PDP coupons fix — city-scope fetch + product-first filter; offers card below delivery; loading state
2026-09-28 — PDP coupon tickets — horizontal rail, detail bottom sheet, View all → offers screen
2026-09-28 — PDP Later schedule — date-only modal; chosen date on card + time slots on PDP (not in modal)
2026-09-28 — PDP details tabs — What's included / FAQs / Delivery / Care as Schedule-style underline tabs with horizontal card rails (accordion removed)
2026-09-28 — PDP reviews accordion — web-style summary (avg + 5-star row + distribution bars), review cards, tap to expand
2026-09-28 — PDP web parity — ProductPdpScreen replaces FNP layout; reviews/promotions APIs; WhatsApp + Book Now; proceed-to-checkout + checkout stub
2026-09-28 — Product cards — square image, fixed title/reviews/price slots (same card size without row stretch); Instant infinite scroll; Explore/Category Load more
2026-09-28 — Explore tab — bottom nav after Category; ExploreScreen mirrors web /explore (category chips + catalog listing, optional categoryId param)
2026-09-26 — Catalog location helper — PDP/search/similar use cityId+pincode with city-only retry (`getProductForCatalogLocation`, `listProductsForCatalogLocation`); cart add sends both like web
2026-09-26 — Product PDP API — real catalog detail + similar rail; delivery date chips; addons inline + customize sheet; cart addItem; module/catalog/components/product-detail/*
2026-09-26 — Select location stack — header opens full-screen saved addresses + add flow; web-like address form → Ola MapLibre pin confirm; ImageKit pin asset
2026-09-26 — GPS auto-location — device GPS → reverse geocode + pincode resolve; local `device` source for catalog/CMS; header “Near {city}”; no address POST
2026-09-26 — Home delivery location — FNP-style header, delivery sheet + addresses/maps API, delivery-location store, profile addresses wired
2026-09-26 — Home city picker — search bar MapPin → bottom sheet with city search + radio list; persists via location store
2026-09-26 — Profile hub UI — grouped card sections, notification permission toggle, TabScreenTitle + logout pill (light theme)
2026-09-26 — Instant tab — API instant filter, FlatList infinite scroll, orange tab chrome; backend public `instant=1`
2026-09-28 — Home web parity — default service city, CMS fetch without `isLocationChosen` gate, discovery fallback when no android layout blocks, removed auto select-location on home load
2026-09-26 — Category PLP — subcategory horizontal rail, listProducts with web sort/price filters, 2-col grid + load more
2026-09-26 — Category + search layout polish — safe-area horizontal insets, spacing, removed category helper copy; hide placeholder category* names in browse/search
2026-09-26 — Catalog search screen — home bar → search route; popular + debounced q; category suggestions; SearchProductRow list (web parity)
2026-09-26 — Android home feed CMS-only — no web/mobile layout blocks or catalog fallback; strict `android` platform on home-layout API; admin AppHomeLayoutPanel + horizontal categories + Category tab
2026-09-25 — Home web mobile parity — `HomeDiscoveryFeed`, 4-col categories, `HomeLayoutWithPromos`, RQ cache like web; no home filter chips / marketing blocks
2026-09-25 — Post-login permissions — vendor full-screen `enable-location` → `enable-notifications` (native OS dialogs); `use-permissions-setup-prompt` in app layout
2026-09-25 — Permissions + scroll — SmoothScrollView + Lenis (web); app.json location/notifications/camera manifests
2026-09-25 — Home feed UX — full-bleed CMS banners + 6s autoplay; HomeFeedSkeleton; pull-to-refresh on home
2026-09-25 — Home polish — product stack route fix; tab/card press scale + light haptics; expo-keep-awake + WAKE_LOCK for dev keep-awake errors
2026-09-25 — Home UI + API feed — TopBar/search layout; CMS mobile hero + sections/products; geo location; cart badge; React Query — api/cms+geo+cart, module/home/hooks, store/location+cart
2026-09-25 — Dev Metro — fixed ports (user 8081, vendor 8080), `scripts/expo-dev.js`, metro blockList for native build dirs
2026-09-25 — Unified consumer identity — consumer-session (vendor/staff OK); backend eligibility, self-dealing, shop-block staff; web parity
2026-09-25 — OTP hardening + account linking — verify debounce, otp-verify-errors, resend cooldown; `user.api` + Account link phone/Google
2026-09-25 — Phone OTP (API) — `auth.api` request/verify, `otp.service`, customer-session guard, Android SMS autofill; mock OTP removed
2026-09-25 — Vendor-style layout — `app/`, `api/`, `module/`, `lib/`, `store/` at project root (no `src/`); axios `api/client` + `auth.api`
2026-09-25 — Google auth (Android) — env + `.env.example`, GIS plugin, `GoogleSignin.configure`, `POST /auth/google`, secure refresh token + profile hydrate; mock Google removed — lib/env, api, module/auth/services, LoginHubScreen
2026-09-24 — Login hub — Google + phone chooser after welcome; mock Google session — login.tsx, LoginHubScreen
2026-09-24 — Product PDP (mock) — Home card → product/[id]; ProductPdp-style UI, schedule/instant, accordions — module/catalog, lib/mock/products.ts
2026-09-24 — Profile hub + home bell — Profile stack, menu (Account, My orders, Addresses, …), mock addresses; home notifications icon — module/account, profile/, HomeStickyHeader
2026-03-24 — Native 4-tab bar — Home/Category/Instant/Profile, neutral icons; Profile tab + WhatsApp in profile — AppTabBar, profile.tsx, ProfileTabScreen
2026-03-24 — Home + bottom nav (mock) — Home feed with mock rails; account/search — app/(app), module/home, lib/mock, store/location+cart
2026-03-23 — Onboarding slice (mock) — Welcome + sign-in + OTP + placeholder home; CONTEXT/AGENTS; auth.store mock session — app/(onboarding), module/onboarding, module/auth, store/, lib/, components/shell/
```
