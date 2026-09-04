# Content model

Two data files, and everything else derives from them:

- **`src/data/tools.ts`** — every entry in the directory. The one file you edit to add a
  tool.
- **`src/data/categories.ts`** — the shelves. Changed rarely and deliberately.

Derived views (grouping, counts, sorting, alternatives) live in `src/lib/directory.ts`, so
no page template ever contains a hard-coded tool name.

## The tool schema

```ts
export type Pricing = 'free' | 'freemium' | 'paid';
export type ToolStatus = 'live' | 'beta' | 'coming-soon' | 'idea';

export interface Tool {
  /** URL slug: /tools/<id>. Lowercase, no spaces. Also the logo filename. */
  id: string;
  name: string;
  url: string;
  /** Shown on the row, without protocol. */
  domain: string;

  /** One line, under ~95 characters, no trailing period. */
  tagline: string;
  /** Two or three sentences for the tool page. */
  description: string;

  /** Primary category first — it decides the breadcrumb and the tool page header. */
  categories: string[];

  pricing: Pricing;
  openSource?: boolean;
  /** SPDX-ish identifier. Only when `openSource`. */
  licence?: string;
  /** What it runs on or is built with. Three or four at most. */
  stack?: string[];

  /** Other entries worth comparing against. Tool ids. */
  alternatives?: string[];

  /** Built and maintained by Renfred — surfaces it in the Built here section. */
  madeHere?: boolean;
  /** Only set for `madeHere` tools. */
  status?: ToolStatus;

  /** Path under public/. Usually omitted; `npm run logos` fills this in. */
  logo?: string;
  addedAt: string;
}
```

## Writing the copy

The two text fields do different jobs, and an entry where they say the same thing twice is
worse than one with only a tagline.

**`tagline`** — what it does and who it is for, in one line. It has to survive being read
against five others on the same page, so keep them within about twenty characters of each
other in length. No marketing intensifiers: every tool in the directory is "powerful" and
"modern," so the words carry no information.

> `Merchant of record for software — it owns the global tax problem`

**`description`** — two or three sentences saying something the tagline cannot: the
trade-off, the catch, who it is genuinely not for. This is the whole reason a tool page
exists. If it just restates the tagline at greater length, cut it and write a real one.

> `Paddle is the seller of record, which means it registers for and remits sales tax and
> VAT worldwide instead of you. You pay a higher percentage than a raw processor and
> accept less control over checkout; for a small team selling internationally that is
> usually the right trade.`

**`stack`** — what the tool runs on or is built with, not its feature list. `Cloudflare
Workers, R2, Self-hosted` is a stack; `Shared inboxes, Team access` is a feature list and
belongs in the description.

## Pricing and licence are separate fields

`pricing` describes what you pay; `openSource` describes the licence. They are orthogonal
and conflating them gets tools wrong in both directions — Plausible is open source *and*
paid to use hosted; Better Auth is open source and free; Sentry is source-available under
BSL and mostly paid.

| `pricing` | Means |
| --- | --- |
| `free` | No cost for normal use |
| `freemium` | Usable free tier, paid tiers beyond it |
| `paid` | You pay to use it in any real capacity |

## Status is only for tools built here

Third-party entries are all shipping, so a status badge on them would be noise. `status`
exists to say where *our own* tools stand, and only `madeHere` entries set it. It renders
as a badge only when it is not `live` — a "Live" badge on every one of our tools tells the
reader nothing.

| Status | Means |
| --- | --- |
| `live` | Publicly usable today |
| `beta` | Usable but rough or invite-gated |
| `coming-soon` | Being actively built; something exists at the domain |
| `idea` | A domain and a direction, nothing built |

## Categories

```ts
export interface Category {
  id: string;          // URL slug: /categories/<id>
  name: string;
  tagline: string;     // one line for the card on the home page
  description: string; // a short paragraph for the category page header
}
```

The set is fixed and curated, not a free-form tag cloud. Adding a category is a deliberate
act: it creates a page that has to earn its place, and a shelf with two tools on it looks
broken. **Six entries is roughly the floor.**

A category's `description` should name the trade-off that actually distinguishes the tools
on that shelf — for payments, whether the provider is a merchant of record; for databases,
the operational shape around Postgres. A description that restates the category name is
wasted space at the top of every one of those pages.

A tool can belong to several categories; the first is primary and decides its breadcrumb.
Categories with no tools never render — see
[information architecture](information-architecture.md#empty-shelves-never-render).

## Icons

`npm run logos` reads the tool list, fetches each site's favicon, and writes it to
`public/logos/<id>.svg` (or `.png` for rasters, normalized to 128px). Rows and tool pages
look for that file at build time and fall back to a monogram tile when there isn't one.

Preference order is SVG, then apple-touch-icon, then any raster icon link, then a rendered
PNG from Google's favicon service — that last one exists because plenty of sites still
publish only a `favicon.ico`, which sharp cannot decode. All of it happens at build time
and the result is committed, so the deployed page still makes no third-party requests.

Currently 48 of 49 entries resolve an icon; trueluk has no site to fetch one from.

The `logo` field overrides all of this, for when a tool's favicon makes a poor 44px tile.

## Adding a tool

Under 15 minutes, and it touches one file:

1. **Add the entry** to the `tools` array in `src/data/tools.ts`. TypeScript catches a
   missing field or a mistyped status.
2. **Write the tagline and the description.** The only part that takes real thought.
3. **Set `categories`,** primary first. If nothing fits, that is a signal you may need a
   new shelf — see the floor rule above.
4. **Run `npm run logos`.** It fetches only what is missing.
5. **Check it** with `npm run dev`: the row on a narrow viewport, the tool page, and both
   themes.
6. **Ship it.** Open a PR; the deploy preview renders it.

The category counts, sample names, hero statistics, footer lists, the tool's own page, the
sitemap and the structured data all follow from step 1. None of them need touching.
