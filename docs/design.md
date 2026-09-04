# Design

## The one design decision

The PRD asks whether devtool.fyi should have its own identity or borrow from the tools it
lists. It should have its own — quiet, neutral, and deliberately less opinionated than any
tool on it.

The reason is structural: this page's job is to make three (and later ten) unrelated
brands sit next to each other without fighting. If the container has strong opinions about
color, every logo dropped into it either clashes or gets swallowed. A neutral shell lets
each tool's own mark be the colorful thing in its card, which is also what makes the grid
scannable — the eye moves logo to logo.

So: near-monochrome shell, one restrained accent, tool logos supply the color.

## Layout

A single column, centered, max width around 720px. Above it a short hero; below it the
tool list.

**Hero.** A wordmark, one sentence saying what this page is ("Developer tools built and
maintained by Renfred Alonge"), and nothing else. No hero image, no call to action — the
cards are the call to action, and anything above them is delay.

**The list.** On desktop, a two-column grid. On mobile, one column. Cards are equal
height within a row so the badges line up; that alignment is most of what makes a
directory feel maintained rather than assembled.

At three tools, a two-column grid leaves an awkward gap. Let it. The gap is honest and it
disappears at four. Don't special-case the layout for the current count.

**Card anatomy**, top to bottom: logo (or wordmark fallback), tool name, status badge on
the same line as the name and right-aligned, tagline, domain in muted small type. The
whole card is the click target.

## Type

One typeface for everything. A system font stack is the right call — it's free, instant,
and looks native on every platform:

```css
font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
             "Helvetica Neue", Arial, sans-serif;
```

Monospace only for the domain line, where it signals "this is a URL" without needing an
icon.

Three sizes carry the whole page: hero heading, card name, and body. Taglines and domains
are body size, differentiated by weight and color rather than a fourth size.

## Color

Define everything as tokens in `global.css` so dark mode is a token swap, not a rewrite:

```css
:root {
  --bg:        #fbfbfa;   /* off-white, not pure white */
  --surface:   #ffffff;   /* cards */
  --border:    #e6e4e0;
  --text:      #1a1a18;
  --text-muted:#6b6862;
  --accent:    #2563eb;   /* links, focus rings */
}
```

Status badge colors, each paired with a text label so the badge never depends on color
alone:

| Status | Treatment |
| --- | --- |
| Live | Green text on a pale green field |
| Beta | Amber text on a pale amber field |
| Coming Soon | Blue text on a pale blue field |
| Idea | Muted gray text on a gray field |

The gray for Idea is doing real work: it visually deprioritizes entries that aren't
clickable yet, without hiding them.

## Dark mode

Support it via `prefers-color-scheme`, redefining only the tokens. No toggle — a toggle is
UI to build, state to persist, and a decision to make on a page the visitor is on for
fifteen seconds.

Keep light-mode logos readable on dark backgrounds. Where a tool's mark is dark-on-
transparent, either use a light variant in `public/logos/` or give the logo a small light
plate inside the card.

## Motion

Effectively none. A subtle border or background shift on card hover, at 150ms, to confirm
the whole card is clickable. Nothing animates on load. Respect
`prefers-reduced-motion` by dropping even that.

## Outbound links

Open outbound tool links in the same tab. It's the default browser behavior, the back
button works, and forcing new tabs on a directory page means a visitor who clicks three
tools has four tabs they didn't ask for. Every outbound link still gets `rel="noopener"`.

If tracking later shows people bouncing away and never returning, revisit this — but
decide it on data, not on habit.

## Accessibility

- Body text meets WCAG AA (4.5:1) against its background; muted text is checked too, not
  assumed.
- Visible focus ring on every card link, using `--accent`. Don't remove the outline
  without replacing it with something at least as visible.
- Tap targets at least 44px tall on mobile — the whole card qualifies.
- The page is usable and legible with CSS disabled, which falls out of the semantic
  markup described in [architecture](architecture.md#accessibility-and-semantics).

## Favicon and social card

The favicon should be a wordmark-derived glyph that stays legible at 16px — most
literal-interpretation "tool" icons don't. The OG image should show the site name and the
tool names as text, since that's what makes a shared link legible in a feed.
