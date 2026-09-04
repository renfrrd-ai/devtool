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

## Most viewed

Built, and **invisible until there is real traffic**. `src/data/popular.json` ships with an
empty `entries` array and `PopularTools.astro` renders nothing at all in that state, so the
section appears on its own the first time the cron finds data. No chart of zeros, and no
switch to remember to flip.

### How the data gets there

```
GitHub Action, daily cron at 04:15 UTC
  → scripts/fetch-popular.mjs queries the Cloudflare GraphQL Analytics API
  → writes src/data/popular.json
  → commits only if the ranking changed → push → Pages rebuilds
```

The important property: **the build never calls the network.** The ranking lives in git as
a committed snapshot, so a deploy can't fail because an analytics API was down, and
yesterday's ranking simply stands until the next successful run.

The commit check ignores the timestamp, so an unchanged ranking doesn't produce a commit
every single day.

### Secrets it needs

Set these as **repository secrets** (Settings → Secrets and variables → Actions):

| Secret | Where it comes from |
| --- | --- |
| `CF_API_TOKEN` | My Profile → API Tokens → Create Token, with **Account Analytics: Read** |
| `CF_ACCOUNT_ID` | Cloudflare dashboard sidebar, or the URL of any account page |
| `CF_SITE_TAG` | Web Analytics → your site → the site tag. **Not** the beacon token |

Trigger the first run by hand from the Actions tab — the workflow has
`workflow_dispatch` for exactly that.

> **Verify the GraphQL query on the first run.** It targets
> `rumPageloadEventsAdaptiveGroups` filtered by `siteTag`, which is the right dataset for
> Web Analytics, but Cloudflare has renamed RUM fields before and this has not been run
> against a live account. If the first manual run fails, the error body will name the bad
> field.

### What is stored, and why so little

Only each tool's **share relative to the most-viewed one**, rounded to two decimals:

```json
{ "id": "stripe", "share": 1 },
{ "id": "supabase", "share": 0.87 }
```

No absolute counts, ever. This repository is public, so committing raw view numbers would
publish the site's traffic figures — which is precisely what "rank only, no raw numbers"
was chosen to avoid. Putting them in a JSON file instead of on the page would have been
the same disclosure with an extra step. Share is all the bar chart needs.

### The chart

Magnitude across ranked identities, so horizontal bars: one row per tool, ordered, the
name as the row label. A **single series**, so there is no categorical palette, no legend,
and nothing for a palette validator to check — the bars take `--text`, like everything else
on a site that has no accent hue by design.

- **Rank and name are plain text.** The ranking never depends on reading a bar length; the
  bar is redundant encoding. That is what makes it safe to ship with no numeric labels.
- **No tooltips.** A tooltip exists to reveal a value the mark only implies, and there is
  deliberately no value to reveal. The row is a link to the tool page instead, which is a
  stronger interaction than a tooltip would have been.
- **Show more** is `<details>`/`<summary>` — no JavaScript.
- Bars floor at 3% width so a very small share stays visible rather than collapsing to a
  sliver.
- The caption states that bar length is share relative to the top entry, so the encoding
  is legible without published figures.

### Switching to clicks

`node scripts/fetch-popular.mjs --basis=clicks` ranks on `/go/` hits instead of `/tools/`
views, and the section's caption follows automatically. Worth considering once there is
data: clicks measure tools people went to *use*, views measure ones they glanced at. Both
datasets sit in the same report, so it is a one-word change in the workflow.

### Rejected: live counters

Workers plus D1 or KV, a public write endpoint anyone can curl in a loop to inflate their
favourite tool, and bot filtering to go with it — all to buy freshness nobody refreshes a
directory to watch. Daily is indistinguishable from live here.

## Reading the numbers

A caution for when the data arrives: `/` will dominate the top-pages report, and category
pages will beat tool pages, simply because of where the links are. That is a fact about
the site's structure, not about which tools are interesting. Compare tool pages against
each other, not against the home page.
