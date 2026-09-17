# Decisions

Choices made while turning the [PRD](prd.md) into a buildable plan, and the questions the
PRD left open. Each decision records what was chosen and why, so a future revisit starts
from the reasoning rather than from scratch.

## Decisions

### D0 — The site is a curated directory, not a portfolio *(supersedes the PRD's premise)*

The [PRD](prd.md) scopes devtool.fyi to "developer tools built and maintained by Renfred
Alonge" — three entries, one page. It is now a curated directory of developer tools
generally, organised into nine categories, with Renfred's own tools in a Built here
section and also listed on their category shelves.

Renfred's call, made after the first build shipped. The reasoning behind it is sound:
three entries is not a destination, and nobody returns to a page listing three things they
have already seen. A directory people actually use is a far better vehicle for the PRD's
real goal — credibility and discovery for the tools built here — than a portfolio page
is, because it gives someone a reason to arrive in the first place.

What survives from the PRD intact: the tools built here still get a shared home and a
credibility signal, adding a tool still takes one entry in one file, and the site is still
static, small and untracked.

What changed: the scope, the page count (1 → 59), and the emphasis. The PRD is kept as the
historical document rather than rewritten.

### D0a — Own tools appear on their category shelves, not only in Built here

When asked, the choice was "curated third-party tools, with your own in a highlighted
section." We do that *and* list HQBase under Email, Clueline under Monitoring, next to
their competitors and carrying a "Built here" tag.

Segregating them entirely would have been worse in both directions: someone browsing email
tools would not find HQBase, and a section of tools that appear nowhere else reads as an
advert rather than a recommendation. Standing them next to Resend and Postmark is a
stronger claim than a roped-off section is.

Flagging it because it is a small liberty taken with the answer given.

### D1 — Astro, static output, no client JS

The PRD calls for a static site with no heavy framework. Astro is the smallest thing that
still gives a component and a typed data file, which is what keeps "add a tool" cheap as
the list grows. Hand-written HTML is simpler today and worse at ten tools; Next.js brings
a runtime we'd never use.

Full reasoning in [architecture.md](architecture.md#stack).

Relaxed by [D9](#d9--there-is-a-theme-toggle-reverses-an-earlier-call): the page now
ships two small scripts for the theme toggle. Still no framework runtime, still no
hydration.

### D2 — One data file is the source of truth

All tool content lives in `src/data/tools.ts`. No CMS, no per-tool markdown, no
frontmatter collection. A single typed array is the fastest possible edit, and TypeScript
catches the mistakes that a directory of files would let through. Revisit around 20 tools.

### D3 — devtool.fyi gets its own neutral identity

Answering the PRD's open question on visual identity: the site gets a quiet, near-
monochrome shell rather than borrowing visual language from any one tool. A neutral
container lets several unrelated brands sit side by side without clashing, and makes the
tool logos the color on the page.

Full reasoning in [design.md](design.md#the-one-design-decision).

### D4 — Four statuses, fixed

`live`, `beta`, `coming-soon`, `idea`, exactly as the PRD lists them. Each additional
status is another thing a visitor has to interpret, so the bar for adding a fifth is high.

### D5 — Cards sort by status, then recency

Live tools first, newest first within a status. Puts usable things in front of the
visitor and the most interesting unfinished work next. Ordering is computed at render
time, so no entry carries a hand-maintained sort field.

### D6 — The visual system is modelled on Plunk

[useplunk.com](https://www.useplunk.com) is the reference for the look: masked grid hero,
neutral-only palette, Funnel Display / Funnel Sans / JetBrains Mono, pill buttons, mono
micro-badges, hairline section breaks. Chosen by Renfred; it also happens to suit the
problem, since a neutral typographic shell is what lets several unrelated brands sit
together.

Details and the list of what we took versus left in [design.md](design.md#reference).

### D6a — A list, not a card grid

The PRD says "grid or list of tool cards"; we build rows. A directory's job is
comparison, and rows put every tagline on the same left edge. A three-item grid also
leaves an awkward hole, where a three-item list looks finished — and still does at
twelve. `ToolCard` keeps its name from the PRD.

### D7 — Outbound links open in the same tab

Standard browser behavior, working back button, no surprise tab pileup on a page whose
entire purpose is clicking through. Reconsider only if analytics shows people leaving and
not coming back.

### D8 — Analytics stays minimal

Page views, referrers, and outbound clicks per tool. That last metric is the one that
actually measures the PRD's cross-promotion goal. No tag manager, no cookies, no consent
banner — which also lets the CSP stay strict.

### D9 — There is a theme toggle *(reverses an earlier call)*

The first pass of [design.md](design.md#dark-mode) argued against one: UI to build and
state to persist on a page a visitor is on for fifteen seconds. Renfred asked for it, so
it's in.

The cost was not the button. It was that the theme can no longer be decided by
`prefers-color-scheme` alone, which forced two structural changes worth keeping either
way: every color now resolves through a token (no component defines a color inside a
media query), and the dark palette is written three times — OS default, explicit dark,
explicit light — so a choice wins in both directions. The pattern is spelled out in
[design.md](design.md#dark-mode).

It also means the page ships JavaScript for the first time, which relaxes
[D1](#d1--astro-static-output-no-client-js) from "no client JS" to "two small scripts and
no framework runtime," and costs `'unsafe-inline'` in the CSP's `script-src` — reasoning
in [deployment.md](deployment.md#headers).

### D10 — Tool icons are vendored, not hotlinked

Each row leads with the tool's own favicon, fetched by `npm run logos` and committed to
`public/logos/`. Hotlinking would have been less code and worse: it would put a
third-party request on every page load, which breaks both the strict CSP and the "no
trackers" claim in the footer, and it would blank the icon whenever a tool site is down.

Tools with no usable icon keep the monogram tile. `ToolCard` resolves this at build time,
so dropping a file into `public/logos/<id>.svg` is all it takes.

### D12 — Three page types: map, shelf, entry

The home page lists categories, not tools. Shelves list tools. Tool pages hold the depth.

The alternative — everything on one page — is the failure mode this whole structure
exists to avoid: fifty rows is a wall, and adding the stack, pricing and licence fields
would have made each of those rows heavier. Splitting by page type let the rows get richer
*and* the pages get shorter at the same time.

Full reasoning in [information-architecture.md](information-architecture.md).

### D12a — Comparison tables compare on category-specific axes

Each category page ends with a head-to-head table. Its columns are defined per category —
merchant-of-record for payments, scale-to-zero for databases, what actually runs for
hosting — rather than being a fixed set across the site.

The alternative was a uniform table of pricing, licence and stack. That was rejected
because every one of those facts is already on the row above it: the table would have been
a second rendering of the same data, which is bloat wearing a table's clothes.

The cost is that the columns live in `categories.ts` rather than on the tool, so adding a
tool to a shelf that has a table means an optional second edit. Accepted because
"Merchant of record" is not a property of Stripe in general — it is a property of Stripe
*as a payments choice*, and it means nothing on any other shelf. Tools without a row are
omitted from the table and still appear in the list.

### D16 — Outbound clicks are counted with redirect pages, not a tracking script

Cloudflare Web Analytics has no custom-event API, so a direct outbound link is invisible
to it. The "Visit" button therefore points at `/go/<tool-id>`, a static page that fires the
beacon and forwards after 250ms, turning each click into an ordinary pageview.

Rejected alternatives: an event-tracking script (means a heavier vendor, and undermines
the privacy claim), and a `sendBeacon` endpoint on a Worker (means a backend, for a number
we can get for free). The redirect approach is vendor-agnostic and survives changing
analytics providers.

Cost: a quarter-second hop, and 49 extra pages in the build. The pages are `noindex`,
disallowed in `robots.txt`, and excluded from the sitemap, so crawlers cannot inflate the
counts.

### D17 — No database, and no live view counters

A most-viewed section will be built from a committed JSON snapshot refreshed by a daily
cron, not from a runtime counter. The build never calls the network, so an analytics
outage cannot fail a deploy.

Live counters would mean Workers plus D1 or KV, a public write endpoint anyone can curl in
a loop to inflate their favourite tool, and bot filtering to go with it — all to buy
freshness nobody refreshes a directory to watch. Daily is indistinguishable from live
here.

Full design in [analytics.md](analytics.md#most-viewed).

### D18 — The most-viewed section hides itself until there is data

I argued for not building it yet, on the grounds that a top-10 on a site with no traffic
renders a chart of zeros. Renfred asked for it built anyway, which resolved better than
either position: it is built in full, and renders *nothing* while the snapshot is empty.
The section appears on its own the first time the cron finds data — no chart of zeros, and
no switch anyone has to remember to flip.

Worth keeping as a pattern. A feature that depends on data it does not have yet should
render nothing, not a shell full of placeholder values.

### D19 — The snapshot stores share, never counts

`popular.json` holds each tool's share of the top entry, not its view count. The repository
is public, so committing raw numbers would publish the site's traffic figures — the exact
thing "rank only, no raw numbers" was chosen to avoid. Putting them in a JSON file rather
than on the page would have been the same disclosure with an extra step.

Share is also all the bar chart needs, so nothing was given up.

### D20 — Readers can suggest tools, and GitHub is the database

The directory only grows when one person has an afternoon free, which is a bad property for
a directory. Submissions fix it, and they arrive through a GitHub issue form: issues hold
the submissions, 👍 reactions hold the votes, labels hold the moderation state. A daily
Action turns open issues into `src/data/suggestions.json`.

The alternative was a form on the site posting to a Worker with D1 behind it. That buys a
public write endpoint anyone can curl in a loop, and with it rate limiting, bot filtering,
vote dedupe with no identity to dedupe against, and client JavaScript on a site that ships
none — the same argument that settled [D17](#d17--no-database-and-no-live-view-counters),
reached again from a different direction. What it would have bought is submissions from
people without GitHub accounts, which on a developer-tool directory is a small population.

It also reuses the pipeline shape the analytics snapshot already proved: a scheduled job
commits a JSON file, and the build reads it without ever calling the network.

### D21 — Unreviewed entries are subordinate, and their links are `nofollow`

The directory's whole value is that somebody read each entry and wrote down its trade-off.
Suggestions have had none of that done to them, so they render below the comparison table
in their own dashed block, with no description, no logo, no tool page, and no presence in
the counts, the sitemap or the structured data. They are not `Tool`s — they live in a
separate module, so they *cannot* reach any of that, rather than relying on each place to
remember to exclude them.

The outbound link is `nofollow ugc`, and that is the load-bearing part. Most of the reason
anyone spams a directory is the ranking signal the link passes; an unreviewed listing
passes none. A vote threshold of three sits on top of it, so submitting your own product
and clicking 👍 once does not buy a shelf placement.

Affiliation is disclosed on the form and **surfaced rather than filtered** — a tool's own
maker is a good source, and the honest move is to label it and let the reader weigh it.

### D22 — Accepting a suggestion opens a PR; the description never automates

Labelling an issue `accepted` writes the submitter's facts into `tools.ts` — name, url,
category, pricing, licence, stack — and leaves `description` as a TODO that
`scripts/check-entries.mjs` fails the build on.

The description is the only reason a tool page exists here, it is written in one voice, and
a submitted one is almost always marketing copy. Automating it would make the site into the
thing it was built not to be, at exactly the moment it started scaling.

Promotion opens a branch and a pull request rather than pushing to `main`, so the
deliberate build failure lands where it is a checklist instead of where it would block
every deploy.

### D23 — Reporting gets one dynamic endpoint, and D17 gives way for it

Suggestions work through GitHub because a considered contribution justifies an account. A
report is a two-second reflex, and gating it behind a login takes the report rate to
approximately zero — which makes a reports-to-views ratio meaningless and the whole
mechanism decorative. There is no version of this feature that works without accepting
anonymous writes.

So [D17](#d17--no-database-and-no-live-view-counters) gives way, in the smallest possible
way: one Pages Function, one KV namespace. The site around it does not change — `/report/<id>/`
is a prerendered page with a plain `<form method="POST">` and no JavaScript, the same trick
`/go/<id>/` already uses to count outbound clicks without a tracking script, and the
endpoint's entire response is a 303 to a static page.

What made this acceptable where a live view counter was not: a write that inflates a counter
changes what readers see, and a write that files a report does not. The ceiling is D24.

### D24 — A report can cause a review and nothing else

Reports never hide a curated entry, never reorder anything, never change a score, and are
never displayed. Crossing the threshold opens an issue and writes a verdict to
`flags.json`; the page is unchanged.

That ceiling is the actual security model. Anonymous reporting is gameable and the ratio is
attackable from both ends — somebody can file reports, and somebody can generate views to
dilute them. It does not matter much, because the prize for winning is that a moderator
looks at a page. Defences are sized to that: a honeypot, one report per person per entry
per day, a daily cap. No CAPTCHA, which would cost client-side JavaScript to protect against
an unnecessary code review.

The one exception is a reported suggestion, which is withheld from its shelf until reviewed.
That is not a flag being shown — the entry is simply absent. A suggestion was never vouched
for, so declining to keep showing one readers object to costs nothing; a curated entry had a
human read it, so it stands.

### D25 — The threshold is a Wilson lower bound over a report floor

"Reports as a percentage of views" gets small samples exactly backwards. Three views and one
report is 33% and would flag instantly; ten thousand views and fifty reports is 0.5% and
never would. The first is noise; the second might be real.

Two guards instead: a hard floor of three reports, so no ratio flags an entry two people
complained about, and a 1% threshold applied to the *lower bound* of the report rate rather
than the raw proportion. One report in three views scores 6% on that measure, not 33%, and
the bound climbs towards the true rate as the sample grows.

The denominator is views of the page carrying the report link — the population that could
actually have filed one. And since you cannot report an entry without looking at it, a
report count above the recorded view count means the analytics missed views, not a rate
above 100%; the larger of the two is used, so a gap in the analytics cannot flag everything.

`flags.json` stores the verdict only, never the counts, for the reason in
[D19](#d19--the-snapshot-stores-share-never-counts) plus one more: a public file saying
"stripe: 14 reports" is an unreviewed accusation about a named company.

### D13 — Tools within a category are ordered alphabetically

Any other order implies a ranking this directory has not earned. Alphabetical is visibly
arbitrary, which is the honest signal to a reader. Built here is the one exception, sorted
by status, because there it is answering "what can I use right now."

### D14 — No search, no filtering

Nine shelves is browsable, and the facts you would filter on are already on the row.
Search earns its place somewhere north of twenty categories; until then it costs
client-side JavaScript the site does not otherwise ship, for a problem nobody has.

### D15 — `pricing` and `openSource` are separate fields

Conflating them gets tools wrong in both directions: Plausible is open source and paid to
use hosted, Sentry is source-available and mostly paid, Better Auth is open source and
free. One enum could not have said any of that correctly.

### D11 — Self-hosted fonts, latin subsets only

Three faces via `@fontsource`, imported as `latin-*` rather than the full packages, which
otherwise drag in Cyrillic, Greek and Vietnamese faces nothing requests. Self-hosting
keeps `font-src 'self'` and avoids a Google Fonts round trip.

The tradeoff shows up in one place: those packages ship woff2 only, which fontconfig
can't read, so the social-image script renders its text in a system fallback rather than
Funnel Display.

## Open questions

### Q1 — What is hqbase.io? — **answered**

HQBase turned out to be live and self-describing: *"Your team's email. On your Cloudflare
infrastructure."* Free, open source (AGPL-3.0), self-hosted, unlimited seats, v1 shipped
August 2026. Read off the site itself, so the entry is written from the product's own
words rather than guessed at, and its status is `live` rather than the `coming-soon`
the PRD assumed.

Clueline likewise: *"The error tool that talks to your users."*

### Q2 — What should trueluk.com become? *(still open — see the note below)*

Nothing resolves at the domain. The entry ships as `idea` with the tagline *"An early
idea, still taking shape. Nothing to use yet"* — honest, and better than "TBD," but it is
placeholder copy and it reads as one.

The choice is still Renfred's, and it's a real one:

- **Give it a direction.** Even one sentence — "Exploring X for Y" — turns the row from
  an idle domain into evidence of an active mind, which is the whole point of the page.
- **Take it off until there's something to say.** Two live tools and a confident list
  beats three entries where one is visibly empty.

Leaving it exactly as it is now is the weakest of the three.

### Q3 — Is there a fourth tool coming?

Less pressing than it was: the list layout ([D6a](#d6a--a-list-not-a-card-grid)) looks
finished at three entries, where the two-column grid would have left a hole. Still worth
knowing, but it no longer constrains the layout.

### Q4 — Source licensing

The README says TBD. The site source could reasonably be MIT, or stay unlicensed while
the content and branding remain reserved. No urgency unless the repo goes public — worth
settling before it does, since HQBase is already AGPL and a consistent posture reads
better than an accidental one.
