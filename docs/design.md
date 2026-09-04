# Design

## Reference

The visual system is modelled on [useplunk.com](https://www.useplunk.com) — a neutral,
typography-led layout with a faint grid ruling the hero, pill-shaped buttons, mono
micro-labels, and section breaks made from hairline rules rather than boxes. That look
was chosen deliberately, not borrowed wholesale: it happens to solve this page's actual
problem, which is making several unrelated brands sit together without fighting.

What we took: the masked grid background, the neutral-only palette, the display/sans/mono
type split, pill buttons, the mono micro-pill badges, the `divide-y` list of large names
with a mono domain and an outbound arrow, and the numbered three-column section on a
tinted ground.

What we didn't: Plunk's product screenshots, its dark feature panels, and its marketing
page length. This page is one screen of intro and then a list.

## The one design decision

The PRD asks whether devtool.fyi should have its own identity or borrow from the tools it
lists. It has its own — quiet, near-monochrome, and deliberately less opinionated than any
tool on it.

The reason is structural: if the container has strong opinions about color, every logo
dropped into it either clashes or gets swallowed. A neutral shell lets each tool's own
mark be the colorful thing in its row, which is also what makes the list scannable.

## Type

Three faces, self-hosted from `@fontsource` (latin subsets only):

| Role | Face | Used for |
| --- | --- | --- |
| Display | **Funnel Display** (600, 800) | Hero, section headings, tool names, stat figures |
| Body | **Funnel Sans** (400, 500, 600) | Prose, taglines, nav, buttons |
| Mono | **JetBrains Mono** (400, 500) | Domains, eyebrows, status badges |

Funnel Display does the work here. It's a geometric grotesque with tight apertures that
holds up at 800 weight and −0.04em tracking, which is what makes the hero read as a
statement rather than a big paragraph.

The scale, as CSS custom properties in `src/styles/global.css`:

```css
--text-display: clamp(2.5rem, 6vw, 5.25rem);  /* line-height 0.94 */
--text-h2:      clamp(2rem, 4vw, 3.25rem);    /* line-height 1.05 */
--text-h3:      1.625rem;
--text-lead:    1.25rem;
--text-ui:      0.875rem;
--text-label:   0.75rem;
```

Display sizes get negative tracking (−0.02em to −0.04em, tighter as they get larger).
Eyebrows go the other way: uppercase mono at 0.1em.

## Color

A single neutral ramp — the Tailwind neutral scale, which is a genuinely well-balanced
set of greys — mapped onto semantic roles so dark mode is a token swap:

```css
--bg / --bg-subtle / --surface     /* grounds */
--border / --border-strong         /* hairlines */
--text / --text-muted / --text-faint
--grid-line                        /* the hero ruling */
```

There is no accent hue. Emphasis comes from weight and from inverting fill and text
(`--text` background with `--bg` text), which is how the primary button and the Live badge
are built. This is the deliberate constraint: color on this page belongs to the tools.

## The grid background

The hero's only ornament, and the detail that most defines the look:

```css
background-image:
  linear-gradient(to right,  var(--grid-line) 1px, transparent 1px),
  linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
background-size: 6rem 6rem;
mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 40%, transparent 95%);
```

The radial mask is the part that matters. Without it the grid tiles edge to edge and the
page looks like graph paper; with it the ruling is densest behind the headline and
dissolves before it reaches any content, so it reads as texture rather than structure.

It appears once, in the hero. Repeating it in other sections would spend the effect.

## Layout

- Shell: `max-width: 88rem`, gutters 1.5rem rising to 2.5rem at 640px.
- Reading sections (the list, the approach grid) narrow to `64rem`. The full 88rem is for
  the hero and the footer only.
- Sections are `padding-block: 5rem`, 7rem from 640px up, separated by hairline rules and
  a tinted ground rather than by cards.

**Hero** — centered: eyebrow, display headline, lead, two pills, then a four-up stat row
above a hairline. The stats are computed from the data file, so they can't drift from the
list below them.

**Category grid** (home) — cards on `auto-fill, minmax(20rem, 1fr)`, so the column count
follows the viewport rather than a breakpoint guess. Each card: name, count, one line, and
a hairline rule above four real tool names. Naming actual tools is what makes a card worth
clicking; a category card that only says "Payments" says nothing the heading did not.

Cards are the one place on the site that get a border, a radius and a fill — they are
genuinely separate objects you pick between. Rows are not, and do not.

**The tool list** — not a card grid. A `divide-y` list of full-width rows, each a single
link to that tool's page: a 2.75rem logo or monogram tile, the name at 1.375rem, any
badges, the tagline, then a quiet mono caption of pricing, licence and stack, with the
domain and a chevron at the end. On hover the row tints, the domain darkens, the chevron
nudges right.

The list beats a grid for a reason worth keeping: a directory's job is comparison, and rows
put every tagline on the same left edge where they can be read against each other.

**The caption is a caption, not chips.** Pricing, licence and stack sit on one mono line at
0.6875rem, separated by middots. Rendered as tags they would be visually louder than the
tool name, and six rows of chips is a wall of pills — the exact bloat this layout exists to
avoid. Stack is capped at three entries with a `+N` overflow; the rest is on the tool page.

Below 720px the row collapses to two columns — the mark stays left, and the domain and
chevron drop under the tagline as their own baseline.

**Comparison table** (category pages) — the one real table on the site, so it gets the
treatment tables need: mono uppercase column heads on `--bg-subtle`, hairline row rules,
the tool name as a `<th scope="row">` in the display face because it anchors the row, and
the first data column at full `--text` strength since it usually carries the deciding fact.

It sits in its own `overflow-x: auto` container with a `min-width: 44rem` table inside.
Below that width the columns wrap into unreadable slivers, so it scrolls within its box —
the page body never scrolls sideways.

**Tool page** — a two-column body at 860px and up: prose on the left at a 65ch measure, an
at-a-glance facts panel on the right. The panel is the one boxed element on the page, which
is what makes it read as a reference rather than more prose. Facts that would be blank are
dropped rather than rendered as an em dash; a table of empty cells reads as a broken page.

**Approach** — three numbered columns on `--bg-subtle`. The numbering is honest here:
these are three points read in order, not a ranked list.

## Components

**Buttons** are pills. Primary is `--text` filled with `--bg` text; secondary is a
`--border-strong` outline on `--surface` that darkens to `--text` on hover. Both carry an
arrow that nudges 2px on hover.

**Tags** are mono micro-pills at 0.6875rem. One component, `Tag.astro`, with variants that
differ by weight and fill rather than hue:

| Variant | Treatment | Used for |
| --- | --- | --- |
| `solid` | `--text` fill, `--bg` text | "Built here" — the one thing worth shouting |
| `outline` | Border, full-strength text | Licence, and a live status with a dot |
| `default` | `--chip-bg` fill, muted text | Pricing |
| `dashed` | Dashed border, faint text | Beta, Coming Soon, Idea |

Every tag carries a text label, so none of this depends on color — the a11y requirement
falls out of the monochrome constraint for free.

**Badges are rationed.** Rows show a status badge only for our own tools, and only when
the status is *not* live: a "Live" tag on every entry tells the reader nothing and turns
the list into noise. The full set — pricing, licence, status — appears on the tool page,
where there is one tool to describe and room to describe it.

## Dark mode

Supported, with a toggle in the header. `--grid-line` drops to `#1c1c1c` so the hero
ruling stays a texture instead of becoming a light box; everything else is a token swap.

Plunk itself is light-only. We diverge because a directory of developer tools is read by
people who mostly run their machines dark.

**Three states, not two.** The toggle means the theme can no longer be decided by
`prefers-color-scheme` alone, and all three states have to be written out:

```css
:root                      { /* light — the complete palette */ }

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) { /* dark — follows the OS... */ }
}

:root[data-theme='dark']   { /* ...but an explicit choice wins either way */ }
```

The `:not([data-theme='light'])` guard is the part that's easy to miss: without it,
choosing light on a dark-set OS does nothing, because the media query keeps winning.

**Every color is a token.** No component defines a color inside a media query or a
`[data-theme]` block — the two spots that used to (`--fill-hover` for inverted button
hovers, `--chip-bg` for the Coming Soon badge) became tokens instead. A color whose only
definition sits behind `[data-theme]` never applies in the un-stamped default state,
which renders one theme's text on the other theme's ground.

**No flash.** A blocking inline script in `<head>` applies a stored choice before first
paint. It has to be inline and it has to block; deferring it shows the wrong theme for a
frame.

**Nothing is stored until someone chooses.** An untouched browser keeps following the OS,
including when the OS setting changes mid-visit. `localStorage` writes are wrapped in
try/catch, so a browser blocking site data loses the persistence and nothing else.

The toggle shows the icon for the theme you'd switch *to*, carries an `aria-label` saying
which, and reflects state through `aria-pressed`.

## Tool marks

Each row leads with the tool's own favicon, vendored into `public/logos/` by
`npm run logos` rather than hotlinked — the page makes no third-party requests, and a
tool site going down doesn't take its row's icon with it. SVGs are kept as SVGs; rasters
are normalized to a 128px PNG.

`ToolCard` resolves the file at build time and falls back to a monogram tile when a tool
has no usable icon (trueluk, currently). The two cases are styled differently on purpose:
a real mark arrives with its own ground and its own corner radius, so it fills the 3rem
tile with no border, while the monogram keeps the bordered `--surface` tile that gives it
a shape to sit in. A bordered tile drawn around a mark that is already a tile reads as a
mistake.

## Motion

Almost none, and all of it on hover: row tint, 3px name slide, arrow nudge, button fill.
Nothing animates on load — the page's first frame is its finished state.
`prefers-reduced-motion: reduce` collapses every transition to 0.01ms globally.

## Favicon and social cards

The mark is a geometric "d" — a stroked ring and a stem in a `--neutral-950` rounded
square — which stays legible at 16px where a literal tool icon wouldn't.

Everything raster is generated by `npm run images` from inline SVG in
[`scripts/build-images.mjs`](../scripts/build-images.mjs), so the mark is defined once and
drawn at every size:

| File | Size | For |
| --- | --- | --- |
| `og-image.png` | 1200×630 | Open Graph, Twitter `summary_large_image` |
| `og-square.png` | 1200×1200 | Platforms that crop square (WhatsApp, some Telegram) |
| `apple-touch-icon.png` | 180×180 | iOS home screen — full-bleed, iOS rounds it itself |
| `icon-192.png`, `icon-512.png` | — | Web app manifest |

The social cards reuse the hero: same masked grid, same headline, the tool domains in
mono along the bottom.

They render through sharp, which uses system fonts — Funnel Display ships from npm as
woff2 only, which fontconfig can't read, so the exports currently fall back to a system
grotesque. Install Funnel Display locally and re-run for a fully on-brand version.
