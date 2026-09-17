# Partner owner vs worker — manual QA

## Staff login & shell

- [ ] Login as staff → tabs: Today, My jobs, Messages, Profile (no Wallet).
- [ ] Notifications inbox loads; no `VENDOR_NEW_JOB` / payout items in field shell.
- [ ] Owner login → Home, Bookings, Wallet, Profile; no Messages tab.

## Assign & notify

- [ ] Owner accepts job → assign **one** worker (API rejects 2+).
- [ ] Pending invite worker → assign shows error.
- [ ] Worker receives push/in-app `VENDOR_JOB_ASSIGNED` → opens job detail.
- [ ] Reassign → previous worker loses chat send; new worker receives assign notify.

## Chat

- [ ] Before assign: customer web chat title = shop; owner gets `CHAT_MESSAGE`.
- [ ] After assign: web title = worker name; worker gets customer messages; owner does not get chat push.
- [ ] Worker Messages tab lists booking conversations; thread opens.
- [ ] Staff can send/receive on `/vendor/chat` routes.

## Field status → owner

- [ ] Worker marks EN_ROUTE / ON_SITE / COMPLETE → owner booking list/detail updates (socket `vendor:job_updated` or refresh).

## Duty

- [ ] Shop offline → worker Today shows offline note; field trip actions return 409.
