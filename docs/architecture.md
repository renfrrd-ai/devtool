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
│   ├── og-image.png         # generated — see scripts/
│   └── robots.txt
├── scripts/
│   ├── build-images.mjs     # social cards + app icons via sharp; npm run images
│   └── fetch-favicons.mjs   # vendors each tool's own icon; npm run logos
├── src/
│   ├── components/
│   │   ├── SiteHeader.astro # sticky bar, wordmark + anchors + toggle
│   │   ├── ThemeToggle.astro
│   │   ├── Hero.astro       # masked grid, headline, stat row
│   │   ├── ToolCard.astro   # one row in the tool list
│   │   ├── StatusBadge.astro
│   │   └── SiteFooter.astro
│   ├── data/
│   │   ├── tools.ts         # SOURCE OF TRUTH — see content-model.md
│   │   └── site.ts          # name, URL, author, social image alt text
│   ├── layouts/
│   │   └── Base.astro       # <head>, fonts, meta tags, JSON-LD
│   ├── pages/
│   │   └── index.astro      # the only route
│   └── styles/
│       └── global.css       # design tokens + base styles
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

`ToolCard` keeps its name from the PRD's "tool cards," but it renders a full-width list
row rather than a card in a grid — see [design.md](design.md#layout) for why.

Component styles live in each `.astro` file's scoped `<style>` block; `global.css` holds
only tokens, base element styles, and the handful of shared utilities (`.container`,
`.section`, `.eyebrow`, `.btn`).

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

- **Almost no client-side JavaScript.** The page ships two small scripts and no
  framework runtime: a blocking inline snippet in `<head>` that applies a stored theme
  before first paint, and the theme toggle's own handler. Nothing else. If a feature
  needs more than that, it belongs in a later version rather than being a reason to
  start hydrating components.
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

## SEO and social

The site's job is partly credibility, so metadata matters more than the page count
suggests. All of it is generated in `Base.astro` from `src/data/site.ts` and the tool
list, so nothing has to be kept in sync by hand.

**Crawl basics** — descriptive `<title>` and description, `<link rel="canonical">`
resolved against `site`, `robots` set to `index, follow, max-image-preview:large`,
`robots.txt`, and a sitemap generated by `@astrojs/sitemap` at `/sitemap-index.xml`
with `lastmod` and `changefreq`.

**Structured data** — one JSON-LD `@graph` with three nodes, each doing a distinct job:

| Node | Job |
| --- | --- |
| `WebSite` | Names the site so a sitelinks box has something to attach to |
| `Person` | The credibility claim the PRD is about: one maintainer, these tools. Each tool is a `SoftwareApplication` under `owns` |
| `ItemList` | The directory as ordered data, so a crawler reads the page as a list of products rather than prose |

**Social cards** — `og-image.png` at 1200×630 for the platforms that want a landscape
crop, `og-square.png` at 1200×1200 for the ones that crop square (WhatsApp, some
Telegram clients). Twitter gets its own `twitter:` namespace rather than relying on the
`og:` fallback, since it ignores `og:` once any `twitter:` image is present. Both images
carry alt text. Both are generated by `npm run images`.

**Icons** — `favicon.svg`, `apple-touch-icon.png` at 180×180 (full-bleed, since iOS
applies its own corner mask), and 192/512 PNGs referenced from `site.webmanifest`.
`theme-color` is set per color scheme so the browser chrome matches the page.

**The backlinks still matter most.** Each tool site linking back to devtool.fyi is part
of the PRD's success criteria and does more for the "same person made these" signal than
any on-page markup — see the [cross-linking table](deployment.md#cross-linking).
