# Deployment

## Hosting: Cloudflare Pages

**Yes, Cloudflare Pages supports Astro, and this site needs nothing special.** Astro is
one of Pages' preset frameworks. Because we build to fully static output there's no
adapter involved — `@astrojs/cloudflare` exists for server-rendered Astro, and we don't
need it. Pages just runs the build and serves `dist/` off its CDN.

### Setting it up

1. **Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git**, and pick
   `renfrrd-ai/devtool`.
2. Framework preset: **Astro**. That fills in the build settings below; confirm they
   match.
3. Deploy. The first build gives you a `*.pages.dev` URL.
4. **Custom domains → Set up a domain → `devtool.fyi`.** If the domain's DNS is already
   on this Cloudflare account, the record is created for you.

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |
| Root directory | `/` |
| Node version | 20 or newer — set `NODE_VERSION` in the environment variables if the default is older |

The build runs `astro check` before `astro build`, so a type error fails the deploy
rather than shipping.

### What's already in the repo for it

- [`public/_headers`](../public/_headers) — security headers, CSP, and cache policy.
  Pages reads this file automatically; nothing to configure in the dashboard.
- `public/robots.txt` and the generated `sitemap-index.xml`.

### Why Pages over the alternatives

Netlify and Vercel would both work identically. Pages wins on one thing: the domain is
already Cloudflare's problem, and keeping DNS and hosting with one provider removes a
moving part. If HQBase's Cloudflare-native architecture means that account is where the
attention already is, that's a second reason.

## Environments

- **Production** — `main` deploys to devtool.fyi.
- **Preview** — every PR gets a preview URL. Check new tool cards there before merging;
  it's faster than running the site locally and it catches logo paths that only break
  after a build.

There is no staging environment. For a static page with no backend, a preview URL is
staging.

## DNS

- `devtool.fyi` → the host's apex record (ALIAS/ANAME, or Cloudflare's flattened CNAME).
- `www.devtool.fyi` → 301 to the apex. Pick one canonical host and redirect the other;
  serving both splits SEO signal and looks sloppy in shares.
- HTTPS enforced, HSTS on once the domain has been serving reliably for a while.

## Headers

All of this lives in [`public/_headers`](../public/_headers), which Cloudflare Pages
applies automatically. The page loads nothing from a third party — fonts, logos and
images are all self-hosted — so the CSP can be near-total:

```
default-src 'none'; img-src 'self'; style-src 'self'; font-src 'self';
manifest-src 'self'; script-src 'self' 'unsafe-inline';
base-uri 'none'; form-action 'none'; frame-ancestors 'none'
```

**On `'unsafe-inline'` in `script-src`.** The theme bootstrap has to be inline and
blocking in `<head>` or the page flashes the wrong theme, and Astro inlines the toggle's
own handler. Neither can be moved without either a flash or an extra blocking request.
The exposure is small and worth naming precisely: the page has no user input, no
third-party script, no `connect-src`, and no `form-action`, so there is no injection path
for an attacker to reach that directive through. Tightening it means either sha256 hashes
for both scripts (which then have to be regenerated whenever Astro's output changes) or a
nonce, which needs a server Pages isn't running here.

If an analytics script is added later, the CSP needs explicit `script-src` and
`connect-src` entries — a useful bit of friction, because it makes adding a third-party
script a decision rather than an accident.

Also set: `X-Content-Type-Options: nosniff`, `Referrer-Policy:
strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, and a `Permissions-Policy`
denying geolocation, mic, and camera.

**Caching.** `/_astro/*` is content-hashed and gets a year with `immutable`. Logos and
social images get a day — long enough to help, short enough that a rebranded logo appears
without a purge. `index.html` must revalidate, or a newly added tool stays invisible
after deploy.

## Analytics

Basic page-view counting only, per the PRD. Cloudflare Web Analytics or the host's
built-in stats — server-side or a single lightweight beacon, no tag manager, no cookies,
no consent banner needed.

What's worth knowing: total visits, referrers (which tool site sends the most traffic),
and outbound clicks per tool. That last one is the actual measure of whether the
cross-promotion goal in the PRD is working, so if the chosen host can't report outbound
clicks, that's a reason to pick a different one.

## Cross-linking

The PRD's second success criterion is that each tool's site links back to devtool.fyi.
That work happens in other repos and is easy to lose track of, so it's tracked here:

| Site | Links to devtool.fyi | Notes |
| --- | --- | --- |
| clueline.dev | ☐ | Footer link |
| hqbase.io | ☐ | Footer link |
| trueluk.com | ☐ | Whole page can point here while it's an Idea |

A footer line — "Part of devtool.fyi" — is enough. Consistent placement and wording
across the tools is what makes the connection read as intentional.

## Launch checklist

Done in the repo:

- [x] `robots.txt`, `sitemap-index.xml`, canonical URL, and full OG/Twitter/JSON-LD
- [x] Social images and app icons generated (`npm run images`)
- [x] Security headers and cache policy in `public/_headers`
- [x] Real taglines for Clueline and HQBase — see [decisions](decisions.md#open-questions)

Still to do, on the host:

- [ ] Pages project connected, first deploy green
- [ ] Custom domain resolves, HTTPS valid, `www` redirects to apex
- [ ] All three tool links resolve and go where the row says they go
- [ ] Lighthouse ≥ 95 performance and 100 accessibility on mobile
- [ ] OG image renders correctly — test with a real share preview, not just the tags
      (Twitter's card validator, and a message to yourself in Slack and WhatsApp, which
      pick the landscape and square crops respectively)
- [ ] Site submitted to Search Console
- [ ] Analytics recording page views
- [ ] Backlinks live on each tool's site
- [ ] trueluk's entry says something real, or comes off the page — see
      [Q2](decisions.md#q2--what-should-truelukcom-become)
