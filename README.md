# bradkidder.com

Brad Kidder's one-page front page: pastor, realtor, improv comedian.
Next.js on Vercel (project `brad-kidder-links`, team `river-city-church`).

## Local development

```bash
npm install
npm run dev
```

## Editing content

Links, labels, intro, contact email, social links and the optional announcement
card all live in:

```text
app/data/site-config.js
```

To show an announcement at the top of the page, set `featuredLink` to an object:

```js
featuredLink: {
  eyebrow: 'This Friday',
  title: 'Come see me at The Comedy Project',
  description: 'Short description.',
  href: 'https://example.com/tickets',
  cta: 'Get tickets'
},
```

Set it back to `null` once the event has passed.

## Page structure

- `app/page.js`: the homepage markup
- `app/home.css`: homepage styles (everything scoped under `.bk`)
- `app/components/HomeMotion.js`: animation (role/photo cycling, scroll reveals,
  spotlight, portrait tilt, hover photos); the page works fully without it
- `app/fonts/`: self-hosted Jost and DM Mono (SIL Open Font License)

## Photos

One portrait per role, in `public/`:

- `role-pastor.webp`
- `role-realtor.webp`
- `role-comedy.webp`

They are 960×1248 WebP crops. The photo-to-role mapping is `roleLooks` in `app/page.js`.

## Contact form

Set a Formspree endpoint in Vercel or local `.env.local` to show a form instead of
just the email button:

```bash
NEXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/your-id
```

## Archive

`archive/universal/` holds the retired Universal family guide that used to live at
`/universal`. It is not built or served; see its README to restore it.
