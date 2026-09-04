# Decisions

Choices made while turning the [PRD](prd.md) into a buildable plan, and the questions the
PRD left open. Each decision records what was chosen and why, so a future revisit starts
from the reasoning rather than from scratch.

## Decisions

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
