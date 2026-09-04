# Deployment

## Hosting

Static output to a CDN host with Git-triggered builds and deploy previews. Cloudflare
Pages, Netlify, and Vercel are all fine; **Cloudflare Pages** is the default pick — the
site is pure static assets, and putting DNS and hosting under one provider removes a
moving part.

Build settings:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 20 or newer |

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

The page loads no third-party scripts, so the CSP can be strict:

```
Content-Security-Policy: default-src 'none'; img-src 'self'; style-src 'self';
                         font-src 'self'; base-uri 'none'; form-action 'none'
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
```

If an analytics script is added later, that CSP needs one explicit `script-src` and
`connect-src` entry — which is a useful bit of friction, because it makes adding a
third-party script a decision rather than an accident.

Caching: hashed assets get a long `max-age` with `immutable`; `index.html` gets a short
TTL or `no-cache` so a new tool appears immediately after deploy.

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

- [ ] Custom domain resolves, HTTPS valid, `www` redirects to apex
- [ ] All three tool links resolve and go where the card says they go
- [ ] Lighthouse ≥ 95 performance and 100 accessibility on mobile
- [ ] OG image renders correctly (test with a real share preview, not just the tags)
- [ ] `robots.txt` and `sitemap.xml` present; site submitted to Search Console
- [ ] Analytics recording page views
- [ ] Backlinks live on each tool's site
- [ ] No placeholder taglines remain — see [decisions](decisions.md#open-questions)
