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

### D6 — Outbound links open in the same tab

Standard browser behavior, working back button, no surprise tab pileup on a page whose
entire purpose is clicking through. Reconsider only if analytics shows people leaving and
not coming back.

### D7 — Analytics stays minimal

Page views, referrers, and outbound clicks per tool. That last metric is the one that
actually measures the PRD's cross-promotion goal. No tag manager, no cookies, no consent
banner — which also lets the CSP stay strict.

## Open questions

These come from the PRD and are still unanswered. The first two block launch, because
placeholder copy on a credibility page defeats the point.

### Q1 — What is hqbase.io? *(blocks launch)*

Needed: a one-line description of what it does and who it's for, plus a real status. The
card currently carries a `TBD` tagline, which is worse than not listing the tool at all —
a visitor reading "TBD" learns that the portfolio isn't maintained.

If hqbase genuinely has no definition yet, the honest move is to list it as `idea` with a
one-liner describing the direction, not the product.

### Q2 — What should trueluk.com become? *(blocks launch)*

The PRD asks whether the domain name itself hints at the product. Same requirement as Q1:
either a real one-liner, or an honest `idea` framing. "Placeholder" is not a tagline.

An `idea` entry with a sentence like "Exploring X for Y" reads as an active mind. An
entry with no content reads as an abandoned domain — the exact impression the site exists
to counter.

### Q3 — Is there a fourth tool coming?

Not from the PRD, but it changes one thing: at three tools the two-column grid has a
visible gap, and at four it doesn't. Worth knowing before anyone is tempted to
special-case the layout. The current call is to leave the gap alone regardless.

### Q4 — Source licensing

The README says TBD. The site source could reasonably be MIT, or stay unlicensed while
the content and branding remain reserved. No urgency unless the repo goes public.
