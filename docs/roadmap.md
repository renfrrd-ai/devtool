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

**Next**
- [ ] Deploy — the Cloudflare Pages project is still not connected
- [ ] A second pass on descriptions: they are accurate, but a few are drier than they need to be
- [ ] Decide trueluk's fate — [Q2](decisions.md#q2--what-should-truelukcom-become)
- [ ] Backlinks from clueline.dev and hqbase.io

**Deliberately not doing** — search, pricing filters, a `/tools` index page. Reasoning in
[information architecture](information-architecture.md#where-it-stops).

## v1 — the portfolio *(shipped, superseded)*

Ship a single static page listing the three known tools, live at devtool.fyi, with
backlinks in place.

**Milestone 1 — Scaffold** ✅
- [x] Astro project initialized, building to `dist/`
- [x] `Base` layout, `global.css` with the design tokens from [design.md](design.md#color)
- [ ] Deploy pipeline wired up, previews working on PRs

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
- [ ] Cloudflare Pages project connected and domain pointed —
      [setup steps](deployment.md#hosting-cloudflare-pages)
- [ ] Analytics on
- [ ] Backlinks added to clueline.dev, hqbase.io, trueluk.com
- [ ] Run the [launch checklist](deployment.md#launch-checklist)

The code is done. What's left is a deploy, three backlinks in three other repos, and one
sentence about trueluk — and that last one is a decision, not a task.

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
