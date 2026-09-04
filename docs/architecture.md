# Architecture

## Shape of the thing

devtool.fyi is one static HTML page plus a stylesheet, built from a typed list of tools.
There is no server, no database, no client-side routing, and no runtime data fetching. A
build step reads `src/data/tools.ts` and emits `dist/index.html` with every card already
in it.

This is the smallest architecture that satisfies the PRD's two structural requirements:
the site must load fast, and adding a tool must take under 15 minutes.

## Stack

**Astro**, building to fully static output, with zero client-side JavaScript shipped by
default.

Why Astro over the alternatives:

- **vs. hand-written HTML** — hand-writing works for three tools and rots at ten. Every
  new tool means copy-pasting a card and hoping the markup stays in sync. Astro gives us
  a single `ToolCard` component and a data file, which is what makes the 15-minute
  success criterion hold as the list grows.
- **vs. Next.js / Nuxt** — those bring a server runtime and a hydration story we have no
  use for. The PRD explicitly calls for "no heavy framework."
- **vs. a static site generator like Eleventy** — a close call and a perfectly good
  choice. Astro wins on typed frontmatter and component ergonomics; the difference is
  small enough that it isn't worth relitigating.

Astro ships no JS to the browser unless a component opts in. Nothing here opts in, so the
delivered page is HTML and CSS.

## Project layout

```
devtool/
├── docs/                    # this documentation
├── public/
│   ├── logos/               # one image per tool, referenced by tools.ts
│   ├── favicon.svg
│   └── og-image.png         # social card
├── src/
│   ├── components/
│   │   ├── ToolCard.astro   # a single tool entry
│   │   ├── StatusBadge.astro
│   │   └── Hero.astro
│   ├── data/
│   │   └── tools.ts         # SOURCE OF TRUTH — see content-model.md
│   ├── layouts/
│   │   └── Base.astro       # <head>, meta tags, global style import
│   ├── pages/
│   │   └── index.astro      # the only route
│   └── styles/
│       └── global.css       # design tokens + base styles
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Data flow

```
src/data/tools.ts  ──►  index.astro  ──►  ToolCard × N  ──►  dist/index.html
     (typed)            (sorts,           (renders name,        (static,
                         filters)          badge, link)          no JS)
```

`index.astro` imports the array, sorts it for display order (see
[content model](content-model.md#ordering)), and maps over it. `ToolCard` owns the markup
for one entry. `StatusBadge` maps a status string to its label and color. That's the whole
render path.

## Constraints worth keeping

- **No client-side JavaScript.** If a feature needs JS on the page, that's a signal the
  feature belongs in a later version, not that we should start hydrating.
- **One route.** The PRD's v1 is a single page. Adding `/about` or per-tool detail pages
  is a v2 conversation, not a drive-by.
- **Data stays in one file.** Resist splitting tools into per-tool markdown or a CMS until
  the entry count makes a single file genuinely unpleasant — call it 20+ tools. Until
  then, one file is the fastest thing to edit.
- **No analytics vendor with a heavy script.** Basic page-view tracking is in scope; a
  tag manager is not. Prefer the host's built-in analytics (see
  [deployment](deployment.md#analytics)).

## Performance targets

These follow from the architecture rather than requiring special effort, but they're
worth stating so a regression is visible:

- Page weight under 100 KB on first load, logos included.
- Lighthouse performance ≥ 95 on mobile.
- No render-blocking resources beyond the single stylesheet.
- Logos served as SVG where the tool has one; otherwise optimized PNG/WebP with explicit
  `width`/`height` so nothing shifts during load.

## Accessibility and semantics

- The tool list is a `<ul>` of `<li>` cards, not a pile of `<div>`s.
- Each card's link wraps the tool name and carries an accessible name that includes the
  tool, not just "Learn more."
- Outbound links use `rel="noopener"`. `target="_blank"` is optional — see
  [design](design.md#outbound-links) for the call.
- Status badges are not color-only; each badge has a text label.

## SEO

The site's job is partly credibility, so metadata matters more than the page count
suggests:

- A descriptive `<title>` and meta description naming the tools.
- Open Graph and Twitter card tags with `og-image.png`, so a shared link renders well.
- JSON-LD `Person` with a `knowsAbout`/`owns` relationship to each tool, and each tool as
  a `SoftwareApplication` with its own URL. This is what lets a search engine connect the
  domains to one another.
- Each tool site linking back to devtool.fyi — the reciprocal link is part of the PRD's
  success criteria and does more for the "same person made these" signal than any on-page
  markup.
