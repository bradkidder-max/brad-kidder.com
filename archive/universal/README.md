# Archived: Universal family guide

Archived November 18, 2026. These files used to serve `/universal` (a private,
PIN-protected family trip guide) and `/universal-demo` on bradkidder.com. They are
kept here unchanged but are no longer built or served.

## What's here

- `app/universal/`, `app/universal-demo/`: the pages, components and API route
- `public/universal/`, `public/universal-demo/`: images, icons, manifest and the
  original service worker (`sw.js`)
- `tests/`, `docs/`: browser tests, planner tests and the architecture notes
- `vercel.json.orig`: the original Vercel config, including the September
  notification crons for `/universal/api/notify` and the `/universal` headers
- `next.config.js.orig`: the original Next config (sets headers for `/universal/sw.js`)

## What was left alone

- Vercel environment variables the guide used (`BLOB_READ_WRITE_TOKEN`,
  `UNIVERSAL_PIN`, `UNIVERSAL_SESSION_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
  `CRON_SECRET`) and any Vercel Blob data were not changed or deleted.
- `package.json` still lists `@vercel/blob`, `leaflet` and `web-push`, which only the
  guide used, so restoring it needs no dependency changes.
- `public/universal/sw.js` (outside this folder) is a small stub that unregisters the
  old service worker on devices that installed the guide.

## To restore

1. Move `app/universal` and `app/universal-demo` back under `app/`.
2. Move `public/universal` and `public/universal-demo` back under `public/`
   (replacing the stub `public/universal/sw.js` with the archived one).
3. Restore `vercel.json` from `vercel.json.orig`.
4. Redeploy.
