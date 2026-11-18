# Kidder’s Universal Day

Built for the Kidder family's September 10, 2026 visit. Production route: `/universal`.

## Design
Independent cinematic park companion: midnight blue, electric cyan, amber calls to action, original castle/coaster artwork. One prominent next move with oversized live wait and walking estimate, two compact alternatives, persistent return strip, active queue timer and a real map. No public link from the existing home page.

## Data and decisions
- Primary posted waits / operational status: Queue-Times, park IDs 64 / 65. Required attribution is visible. Source data refreshes about every five minutes; app requests once a minute while visible.
- Secondary live readings, showtimes, attraction coordinates, September 10 hours: ThemeParks.wiki.
- Manual catalog: 31 selected rides, shows, meal and exploration stops. Family preference weights; indoor, motion and water notes; experience time allowances include loading / exit and are explicitly estimates.
- OpenStreetMap walking graph: September 9 snapshot, 2,687 nodes / 2,998 edges. Dijkstra shortest paths at family pace of 60 metres/minute plus two minutes for arrival. Up to 180 m endpoint snapping; marked distance fallback when no usable connected path exists. These are mapped pedestrian paths, not verified accessible queue entrances. Apple Maps link is also provided.
- Recommendations account for park, selected place or device GPS, completion, 90-minute skips, favorites, posted waits, indoor queues, Potter priorities, daylight water preferences and park closing.
- A regular-line timer stops new recommendations. A return excludes new return suggestions and park hopping; detours must fit walk + queue/show delay + experience + return walk + 12-minute buffer.
- Early-entry candidates are restricted to the usual Islands eligible lineup and must have live operating data; Universal's current app / attendants remain authoritative.
- Family GPS is not uploaded. Manual selected place and selected park are shared.

## Backend and access
Next.js App Router with `/universal/api/[action]`. PIN is a server environment variable, exchanged for a signed HttpOnly, Secure, SameSite=Strict cookie. Persistent per-IP login throttling, same-origin write checks, server validation and no-store private responses. Family names and ages are supplied only after login.

Private Vercel Blob stores the small shared state, subscriptions, rate-limit records and notification delivery receipts. Conditional ETag writes with conflict retries protect simultaneous updates; return and queue changes additionally use tokens to reject stale actions. Reads poll every 20 seconds while visible.

## Notifications
Standard Web Push with VAPID keys held only on the server. iPhone requires a Home Screen web app (iOS 16.4+) and user-granted permission. Service worker scope includes `/universal` without a trailing slash. Setup sends a test notification. Only Apple / Google / Mozilla push endpoint hosts are accepted.

Vercel Pro cron invokes the protected notification endpoint every minute during the trip window, including the final evening UTC rollover. The handler enforces the exact 2026-09-10 Orlando date. Notifications target 15 minutes before and at the entered return; persisted claims prevent overlapping dispatch. No other external messaging is sent. Actual receipt on the user's iPhone remains a device-side verification step.

## Validation
`node --experimental-default-type=module --test tests/universal-planner.test.mjs`

Browser integration coverage: unauthenticated access, origin checks, two-device shared state, simultaneous favorite writes, stale return conflicts, wait timer conflicts, rejected push endpoints, protected cron, responsive layout, ride details, map paths, service-worker readiness, live feed integration. Build and dependency audit are also checked.

## Sources
- https://queue-times.com/pages/api
- https://api.themeparks.wiki/docs/v1/
- https://www.openstreetmap.org/copyright (ODbL; source graph retained as paths.json)
- https://www.universalorlando.com/web/en/gb/early-park-admission
- https://www.universalorlando.com/webdata/k2/en/us/files/Documents/riders-guide-app.pdf
- https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
- Hotel reservation and AAP instructions verified from the user's emails on September 9. No reservation numbers, ticket barcodes or case numbers stored in the app.

## Generated artwork
Built-in image generation, saved as `public/universal/adventure-hero.webp` (original retained in Codex generated_images). Prompt: original cinematic mobile park companion background, illuminated gothic wizard castle and turquoise roller coaster around a lagoon, midnight indigo with electric turquoise and amber light, negative space at top/left, no text, logos, people or watermark. Imaginative decorative artwork, not an accurate park map.

## Public demo and directed planning (September 9 update)

`/universal-demo` is a separate static, view-only showcase with Parkside branding, generic group labels and a sanitized catalog. It uses simulated 11 AM data and three switchable example scenes. It makes no calls to the private API, requests no GPS or notification permissions, registers no service worker, and saves no changes. Park selection and map starting points are temporary viewing controls only. No actual names, ages, hotel booking or pass information are included. The existing private API still requires its signed login cookie.

The real app now includes an explicit “Here’s the plan” section. It selects worthwhile long-line return candidates in the current park, checks closure and Studios-transition constraints, asks the user to request a return in Universal’s app, and suggests an illustrative nearby activity. The hypothetical return is never saved; only the user's actual offered time drives the confirmed schedule. Existing returns prompt either a feasible filler or a return walk. Physical queue waits suppress new assignments. A late Islands return is avoided when it would consume the intended Studios visiting window.

Validation: 14 planner tests plus `node tests/universal-demo-browser.cjs` (set `KIDDER_DEMO_TEST_URL` for a target). Demo tests verify no PIN, no personal names, no private API traffic, no edits saved, no device permission prompts, all three scenarios, mobile widths and preservation of private API authorization.
