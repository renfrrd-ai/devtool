# Roadmap

> **Scope note.** v1 below was written against the original PRD — a three-tool portfolio.
> The site has since become a curated directory ([D0](decisions.md#d0--the-site-is-a-curated-directory-not-a-portfolio-supersedes-the-prds-premise)).
> v1's milestones all shipped; v2 is the directory, and is where the current work is.

## v2 — the directory

**Shipped**
- [x] Nine categories, 49 tools, with taglines and descriptions that say where the catch is
- [x] Three page types — home, category, tool — with `getStaticPaths` for both dynamic routes
- [x] Richer rows: stack, pricing, licence, open-source status, "Built here" tag
- [x] Own tools listed both in Built here and on their category shelves
- [x] Alternatives block on every tool page, falling back to same-shelf tools
- [x] Icons for 48 of 49 entries, vendored at build time
- [x] Breadcrumbs, per-page structured data (`CollectionPage`, `ItemList`, `SoftwareApplication`, `BreadcrumbList`)
- [x] A head-to-head comparison table on every category page, on category-specific axes

- [x] Cookieless analytics wired, inert until a token is set
- [x] Outbound click counting via `/go/` redirect pages
- [x] Most-viewed section: ranked bar chart, show-more, daily cron snapshot —
      renders nothing until there is real traffic
- [x] **Deployed.** Live at devtool.fyi on Cloudflare Pages
- [x] Beacon token committed, analytics live
- [x] `CF_*` secrets set; the refresh workflow has been running daily since 13 September
      and the GraphQL query is confirmed against the live account
- [x] Six more entries, so every shelf clears the six-entry floor the content model sets —
      55 tools
- [x] Reader suggestions: issue form, votes by reaction, daily snapshot, `accepted` label
      opens a promotion PR — [docs](suggestions.md)
- [x] `npm run check:entries` as an editorial build gate: TODO descriptions, dangling
      alternatives, comparison rows keyed to nothing, form/shelf drift
- [x] Reporting: a no-JavaScript form per entry, one Pages Function, and a review
      threshold on the lower bound of the report rate — [docs](reports.md)

**Next** — the site is finished; the problem now is that nobody is on it

1. [ ] **Backlinks.** Still the only distribution work that is scoped, still not started —
       [the table](deployment.md#cross-linking) is fully unchecked. With zero inbound
       links, nothing else on this list is measurable.
2. [ ] **Switch the two ungated features on.** Both are built and both are inert until
       something outside this repo happens:
       - Make the repository public, or nobody can suggest or vote
       - Bind `REPORTS` (KV) and `REPORT_SALT` on the Pages project, and add
         `CF_KV_NAMESPACE_ID` to the environment secrets — until then `/api/report`
         answers 503 — [setup](reports.md#setting-it-up)
3. [ ] Announce it somewhere once. The suggestion flow is worthless without people, and
       the shelves are now deep enough to be worth someone's time.
4. [ ] Collect traffic. The most-viewed section appears by itself once the cron finds
       data; nothing to build or switch on.

> **Where the traffic actually stands.** The 30-day snapshot has held one entry — `hqbase`,
> plausibly the owner's own visits — since 5 September. The machinery is all working. It is
> measuring an empty room, and no amount of further building changes that.

**Also next**
- [ ] A second pass on descriptions: they are accurate, but a few are drier than they need to be
- [ ] Decide trueluk's fate — [Q2](decisions.md#q2--what-should-truelukcom-become)
- [ ] Consider a tenth shelf once six entries exist for it — CI/CD and background jobs are
      the two that submissions will most likely ask for

**Deliberately not doing** — search, pricing filters, a `/tools` index page. Reasoning in
[information architecture](information-architecture.md#where-it-stops).

## v1 — the portfolio *(shipped, superseded)*

Ship a single static page listing the three known tools, live at devtool.fyi, with
backlinks in place.

**Milestone 1 — Scaffold** ✅
- [x] Astro project initialized, building to `dist/`
- [x] `Base` layout, `global.css` with the design tokens from [design.md](design.md#color)
- [x] Deploy pipeline wired up, previews working on PRs

**Milestone 2 — The list** ✅
- [x] `Tool` type and `tools.ts` per the [content model](content-model.md)
- [x] `ToolCard` and `StatusBadge` components
- [x] `index.astro` renders the sorted list; hero copy written
- [x] Responsive down to 320px, dark mode via tokens, theme toggle

**Milestone 3 — Content** ✅ (one caveat)
- [x] Real taglines for Clueline and HQBase, taken from their own homepages
- [ ] trueluk still carries placeholder copy —
      [Q2](decisions.md#q2--what-should-truelukcom-become)
- [x] Tool icons vendored into `public/logos/`, favicon, social images, app icons

**Milestone 4 — Launch**
- [x] Meta tags, JSON-LD, `robots.txt`, `sitemap-index.xml`
- [x] Security headers and cache policy in `public/_headers`
- [x] Cloudflare Pages project connected and domain pointed —
      [setup steps](deployment.md#hosting-cloudflare-pages)
- [x] Analytics on
- [ ] Backlinks added to clueline.dev, hqbase.io, trueluk.com
- [ ] Run the [launch checklist](deployment.md#launch-checklist)

What's left is three backlinks in three other repos and one sentence about trueluk — and
that last one is a decision, not a task.

## Deliberately not in v1

From the PRD's out-of-scope list, plus a few things that will be tempting:

- Search or filtering — pointless under about 15 tools
- Per-tool detail pages — the tool's own domain is the detail page
- A blog or changelog section
- User accounts, newsletter signup, contact forms
- Any client-side JavaScript beyond the theme toggle

## Later, if the portfolio earns it

Not commitments — these are the things worth reconsidering as the list grows, in the
order they'd likely matter:

- **Tags or categories**, once there are enough tools that a visitor can't scan the whole
  list at a glance. Filtering follows from tags, not the other way around.
- **A "what I'm working on now" line** in the hero — cheap, and it does more for the
  "actively maintained" signal than any badge.
- **Per-tool outbound click tracking** surfaced somewhere, if the cross-promotion goal
  turns out to need tuning rather than just measuring.
- **RSS or a changelog feed** for people who want to know when a new tool lands. Only
  worth it once new tools appear at a predictable rate.

## Success criteria, restated as checks

From the PRD, with how each is verified:

| Criterion | Verified by |
| --- | --- |
| Live and listing at least 3 domains | The page loads and shows three cards |
| Tools link back to devtool.fyi | The [cross-linking table](deployment.md#cross-linking) is fully checked |
| Adding a tool takes under 15 minutes | Time the fourth tool. If it runs long, the content model is wrong |
