# Content model

Every tool on devtool.fyi is one entry in `src/data/tools.ts`. That file is the source of
truth: the cards, their order, and their badges are all derived from it. Nothing about a
tool is written directly into markup.

## The schema

```ts
export type ToolStatus = 'live' | 'beta' | 'coming-soon' | 'idea';

export interface Tool {
  /** Stable identifier. Lowercase, no spaces. Used as a React-style key and anchor. */
  id: string;

  /** Display name, cased the way the tool brands itself. */
  name: string;

  /** Canonical URL, including protocol. */
  url: string;

  /** Domain as shown on the card, without protocol — e.g. "clueline.dev". */
  domain: string;

  /**
   * One line: what it does and who it's for. Aim for under 100 characters so it
   * fits on two lines on mobile. No trailing period.
   */
  tagline: string;

  /** Drives the badge and the display ordering. */
  status: ToolStatus;

  /** Path under public/, e.g. "/logos/clueline.svg". Omit to fall back to a wordmark. */
  logo?: string;

  /** ISO date the entry was added. Used to break ties in ordering. */
  addedAt: string;
}
```

## Statuses

The four statuses come straight from the PRD. They are a promise to the visitor about
what they'll find if they click, so keep the meanings tight:

| Status | Badge | Means |
| --- | --- | --- |
| `live` | **Live** | Publicly usable today. Someone can sign up or start using it now. |
| `beta` | **Beta** | Usable but rough or invite-gated. Expect sharp edges. |
| `coming-soon` | **Coming Soon** | Being actively built. There's something at the domain — at minimum a landing page. |
| `idea` | **Idea** | A domain and a direction, nothing built. The link may go nowhere useful. |

Don't invent a fifth status without a reason that survives a week. Every added status is
another color, another label, and another thing a visitor has to interpret.

## Ordering

Cards render in status order — `live`, then `beta`, then `coming-soon`, then `idea` — and
within a status, most recently added first. The rule is deliberate: the visitor's
attention should land on things they can actually use, and the newest work is the most
interesting of what's left.

Ordering lives in `index.astro`, not in the data file, so nobody has to hand-maintain a
`sortOrder` field.

## Example entries

```ts
export const tools: Tool[] = [
  {
    id: 'clueline',
    name: 'Clueline',
    url: 'https://clueline.dev',
    domain: 'clueline.dev',
    tagline: 'AI-powered error management that translates stack traces into plain English',
    status: 'live',
    logo: '/logos/clueline.svg',
    addedAt: '2026-09-04',
  },
  {
    id: 'hqbase',
    name: 'hqbase',
    url: 'https://hqbase.io',
    domain: 'hqbase.io',
    tagline: 'TBD — see docs/decisions.md',
    status: 'coming-soon',
    addedAt: '2026-09-04',
  },
  {
    id: 'trueluk',
    name: 'trueluk',
    url: 'https://trueluk.com',
    domain: 'trueluk.com',
    tagline: 'TBD — see docs/decisions.md',
    status: 'idea',
    addedAt: '2026-09-04',
  },
];
```

Two of these three taglines are placeholders because the PRD leaves them open. They are
tracked in [decisions.md](decisions.md#open-questions) and should not ship as "TBD" —
see the [roadmap](roadmap.md) for when they need to be resolved.

## Adding a tool

The PRD's success criterion is that this takes under 15 minutes. Here's the whole
procedure:

1. **Add the logo.** Drop an SVG (preferred) or an optimized PNG at least 128px square
   into `public/logos/`. Name it after the tool's `id`.
2. **Add the entry.** Append an object to the `tools` array in `src/data/tools.ts`. TypeScript
   will tell you if you've missed a field or mistyped a status.
3. **Write the tagline.** One line, what it does and who it's for, under 100 characters.
   This is the only part that takes real thought — the rest is mechanical.
4. **Check it locally.** `npm run dev`, look at the card on a narrow viewport as well as a
   wide one.
5. **Add the backlink.** The new tool's own site should link to devtool.fyi. This is part
   of the PRD's success criteria and is easy to forget because it lives in a different
   repo.
6. **Ship it.** Open a PR; the deploy preview renders the new card. Merge.

## Writing taglines

The tagline is the entire pitch. Some guidance that keeps the grid readable:

- Lead with what it does, not what it is. "Translates stack traces into plain English"
  beats "A developer productivity platform."
- Name the audience when it isn't obvious from the verb.
- Skip the marketing intensifiers. Every tool on the page is "powerful" and "modern," so
  the words carry no information.
- Keep them within about 20 characters of one another in length. Wildly uneven taglines
  make the grid look broken even when the CSS is fine.
