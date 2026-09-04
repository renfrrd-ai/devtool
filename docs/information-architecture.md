# Information architecture

## The problem this solves

A directory with fifty entries has one failure mode above all others: it becomes a wall.
Everything is on one page, the page is enormous, and nobody reads past the first shelf.

The fix is to give each page one job, and to let the depth live behind a click rather than
below the fold.

## Three page types

```
/                          the map      — what exists, and where
  └─ /categories/<slug>    the shelf    — every tool in one category
       └─ /tools/<slug>    the entry    — one tool, in depth
```

**`/` — the map.** Hero, a grid of nine category cards, the Built here section, and three
principles. It does *not* list the tools. Each category card carries its name, its count,
a one-line description, and four actual tool names — enough to tell you whether the shelf
is worth opening, which is the only decision the home page has to support.

Around 23 KB of HTML. A fifty-row list here would roughly triple that and bury the
categories under it.

**`/categories/<slug>` — the shelf.** The full list for one category, as rows. A header
with the category's description — the trade-off that actually distinguishes the tools on
this shelf, not a restatement of the name — then the rows, then a head-to-head comparison
table, then links to the other shelves. Typically five or six entries, so the page stays
scannable.

The table earns its place by comparing on *category-specific* axes rather than repeating
the rows above it. Payments compares on merchant-of-record, global tax and checkout
control; databases on engine, scale-to-zero and branching; hosting on what actually runs
and where. A table restating pricing and stack — already on every row — would be filler,
and filler is exactly what this structure exists to avoid.

The columns therefore live on the category, not the tool: "Merchant of record" is
meaningless outside payments. See
[content-model.md](content-model.md#the-comparison-table).

**`/tools/<slug>` — the entry.** One tool: what it is, an at-a-glance facts panel, the
categories it belongs to, and three alternatives to compare against. This is where the
stack tags, licence and pricing detail live in full, so the rows above them can stay
light.

## Why depth goes on its own page

Every field we added — stack, pricing, licence, a real description — makes a row heavier.
Fifty heavy rows is the wall again, and this time with more words.

So the rows carry only what helps you choose *between* tools at a glance: name, one line,
and a quiet caption of pricing, licence and stack. Everything that helps you evaluate
*one* tool moves to its page. The row's job is triage; the page's job is the decision.

This also means the same `ToolRow` component works everywhere — on a category page, in
Built here, and in the alternatives block — with a `compact` flag that drops the caption
where the surrounding context already carries it.

## What derives from what

Nothing about the structure is maintained by hand. `src/data/tools.ts` is the only file
that changes when the directory grows:

```
src/data/tools.ts ─┬─► category counts and sample names on the home page
                   ├─► the rows on every category page
                   ├─► one generated page per tool  (getStaticPaths)
                   ├─► one generated page per category, skipping empty ones
                   ├─► hero statistics
                   ├─► the footer's category and Built here lists
                   ├─► the sitemap
                   └─► JSON-LD: ItemList, SoftwareApplication, BreadcrumbList
```

`src/data/categories.ts` defines the shelves. `src/lib/directory.ts` holds every derived
view — grouping, counts, sorting, alternatives — so `tools.ts` stays a plain list of facts
and no page template contains a hard-coded tool name.

Adding a tool is still one entry in one file. That was the PRD's success criterion and it
survived the redesign intact.

## Ordering

**Tools within a category: alphabetical.** Any other order implies a ranking, and this
directory has not earned one. Alphabetical is visibly arbitrary, which is the honest
signal.

**Built here: status, then recency.** Live things first. This is the one place ordering
carries meaning, because it is answering "what can I use right now."

**Categories: a hand-set order** in `categories.ts`, roughly the order you meet these
problems when building something.

## Empty shelves never render

`getStaticPaths` skips categories with no tools, and `populatedCategories()` filters them
out of the home grid and the footer. A category can be defined before it is filled without
producing a page that says "0 tools" — which is the directory equivalent of a broken link.

## Where it stops

Deliberately absent, and the reason each stays absent:

- **Search.** Nine shelves is browsable. Search earns its place somewhere north of twenty
  categories, and it costs client-side JavaScript this site does not otherwise ship.
- **Filtering by pricing or licence.** Same argument, and the facts are already on the row.
- **A `/tools` index page.** It would be the fifty-row wall this structure exists to avoid.
- **Per-tool pages for things not in a category** — trueluk has a page, but no shelf lists
  it. That is correct: it is real, it just is not a recommendation yet.
