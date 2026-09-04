# Roadmap

## v1 — the directory

Ship a single static page listing the three known tools, live at devtool.fyi, with
backlinks in place.

**Milestone 1 — Scaffold**
- Astro project initialized, building to `dist/`
- `Base` layout, `global.css` with the design tokens from [design.md](design.md#color)
- Deploy pipeline wired up, previews working on PRs

**Milestone 2 — The cards**
- `Tool` type and `tools.ts` per the [content model](content-model.md)
- `ToolCard` and `StatusBadge` components
- `index.astro` renders the sorted list; hero copy written
- Responsive down to 320px, dark mode via tokens

**Milestone 3 — Content**
- Real taglines for all three tools — this is the blocker, not the code
  (see [open questions](decisions.md#open-questions))
- Logos in `public/logos/`, favicon, OG image

**Milestone 4 — Launch**
- Meta tags, JSON-LD, `robots.txt`, `sitemap.xml`
- Analytics on
- Backlinks added to clueline.dev, hqbase.io, trueluk.com
- Run the [launch checklist](deployment.md#launch-checklist)

The content milestone is the one that will actually hold this up. The code is a day; the
hqbase and trueluk one-liners are a decision.

## Deliberately not in v1

From the PRD's out-of-scope list, plus a few things that will be tempting:

- Search or filtering — pointless under about 15 tools
- Per-tool detail pages — the tool's own domain is the detail page
- A blog or changelog section
- User accounts, newsletter signup, contact forms
- Any client-side JavaScript

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
