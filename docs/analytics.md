# Analytics

## What's measured, and how

Cloudflare Web Analytics. Cookieless, per-visit rather than per-person, and the only
third-party script on the site. It renders only when a token is present, so local builds
and preview deploys stay completely clean.

| Question | Where the answer comes from |
| --- | --- |
| How many visits | Pageviews |
| Which categories get read | Top pages, `/categories/*` |
| Which tools get read | Top pages, `/tools/*` |
| **Which tools people actually click through to** | Top pages, `/go/*` |
| Where visitors arrive from | Referrers |

## Setting it up

1. **Cloudflare dashboard → Analytics & Logs → Web Analytics → Add a site**, and enter
   `devtool.fyi`.
2. Copy the token out of the snippet it shows you. You want the token only, not the
   `<script>` tag — the tag is already in
   [`src/components/Analytics.astro`](../src/components/Analytics.astro).
3. **Pages project → Settings → Environment variables**, add
   `PUBLIC_CF_BEACON_TOKEN` with that value. Set it on **Production** only if you would
   rather preview deploys stayed unmeasured — otherwise your own PR previews pollute the
   numbers.
4. Redeploy. Confirm the beacon is live: `curl -s https://devtool.fyi | grep beacon`.

Locally, `PUBLIC_CF_BEACON_TOKEN=... npm run build` renders the beacon if you ever need to
check it. Without the variable nothing is emitted at all.

## Why outbound clicks go through /go/

Cloudflare Web Analytics counts pageviews and has **no custom-event API**. A direct link
out of the site is therefore invisible to it — which would be a problem, because outbound
clicks are the only real measure of whether this directory sends anyone anywhere.

So the "Visit" button on a tool page points at `/go/<tool-id>`: a real, static page that
loads the beacon, then forwards to the tool after 250ms. Each click becomes a pageview
named `/go/stripe`, sitting in the same top-pages report as everything else.

What this buys:

- Works with any analytics vendor, and keeps working if the vendor changes.
- No event-tracking script, no `sendBeacon` endpoint, no backend.
- Counts are clean: `/go/` is `noindex`, `Disallow`ed in `robots.txt`, and excluded from
  the sitemap, so crawlers don't inflate the numbers the pages exist to measure.

What it costs: about a quarter-second hop on the click, and 49 extra pages in the build.
`location.replace` is used rather than `location.href`, so the back button from a tool's
site returns to its devtool.fyi page instead of bouncing through the redirect.

Without JavaScript, a `<meta http-equiv="refresh">` in the head takes over after one
second, and there's a visible manual link either way.

## The privacy claim

The footer says **"Static pages. Cookieless analytics, nothing personal stored."** That
was "No trackers, no cookies" before analytics existed, and it was changed rather than
quietly left to become false.

The claim is accurate for Cloudflare Web Analytics: no cookies, no localStorage, no
cross-site identifier, no per-person profile. **If the vendor ever changes, this line has
to be re-checked.** PostHog with session replay, for example, would make it a lie.

## Most viewed: the path, when there's traffic

Not built yet, deliberately — a top-10 on a site with no traffic renders a chart of
zeros, which looks worse than having no section at all. Give it a few weeks of real
visits first.

When it's time, the design that keeps the site static:

```
GitHub Action, daily cron
  → query the Cloudflare GraphQL Analytics API for top /tools/ pages
  → write src/data/popular.json
  → commit if changed → push → Pages rebuilds
```

The important property is that **the build never calls the network**. The numbers live in
git as a committed snapshot, so a build can't fail because an analytics API was down, and
yesterday's ranking simply stands until the next run.

Then a `PopularTools` component reads that JSON, renders the top 10 with a
build-time inline SVG bar chart, and a "Show more" that reveals the rest —
`<details>`/`<summary>`, no JavaScript.

Two decisions already taken, so they don't need relitigating:

- **Rank only, no raw numbers.** "#1 most viewed" is true whether that's 40 visits or
  40,000; "12 views" just advertises how quiet the site is. The bar chart shows relative
  share, which conveys the shape without publishing the absolute figures.
- **No live counters.** That would mean Workers plus D1 or KV, a public write endpoint
  anyone can curl in a loop to inflate their favourite tool, and bot filtering to go with
  it — all to buy freshness nobody refreshes a directory to see.

Ranking by `/go/` clicks rather than `/tools/` views is worth considering at that point:
it measures tools people went to *use*, not ones they glanced at. Both datasets will be
sitting in the same report.

## Reading the numbers

A caution for when the data arrives: `/` will dominate the top-pages report, and category
pages will beat tool pages, simply because of where the links are. That is a fact about
the site's structure, not about which tools are interesting. Compare tool pages against
each other, not against the home page.
