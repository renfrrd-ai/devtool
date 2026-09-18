# devtool.fyi

A curated directory of developer tools — auth, payments, email, UI, databases, hosting,
monitoring, analytics and AI. Every entry says what the tool is actually for and where the
catch is, rather than repeating its marketing copy.

It is also the front door for the tools built and maintained by Renfred Alonge, which get
their own section and sit on their category shelves alongside everything else.

## Structure

```
/                          the map    — categories, and what's built here
  └─ /categories/<slug>    the shelf  — every tool in one category, plus a
                                        head-to-head comparison table
       └─ /tools/<slug>    the entry  — one tool, in depth
```

65 static pages: 1 home, 9 categories, 55 tools. The home page deliberately does *not*
list the tools — that would be a wall nobody reads. Reasoning in
[docs/information-architecture.md](docs/information-architecture.md).

Readers can suggest tools without waiting for anyone: a [suggestion
form](.github/ISSUE_TEMPLATE/suggest-tool.yml) feeds a GitHub issue, 👍 reactions are the
votes, and entries clearing the threshold appear at the foot of their shelf flagged as
unreviewed. [How that works, and what stops it diluting the curation](docs/suggestions.md).

They can also report one that has gone wrong. Enough reports relative to the entry's page
views puts it in front of a moderator — it never hides anything on its own.
[Reports](docs/reports.md).

## Built here

| Tool | Domain | Category | Status |
| --- | --- | --- | --- |
| HQBase | [hqbase.io](https://hqbase.io) | Email & SMTP | Live |
| Clueline | [clueline.dev](https://clueline.dev) | Monitoring & Errors | Live |
| trueluk | [trueluk.com](https://trueluk.com) | — | Idea |

## Stack

Astro building to fully static output, plus one Cloudflare Pages Function — `/api/report`,
the only thing on the site that accepts a write ([why](docs/decisions.md#d23--reporting-gets-one-dynamic-endpoint-and-d17-gives-way-for-it)).
No framework runtime, no server, no database, no tracking. Each page ships HTML, one shared stylesheet, self-hosted font subsets, and two
small scripts for the theme toggle — 23 KB of HTML for the home page, 16 KB for a tool
page.

## Getting started

```bash
npm install
npm run dev      # local dev server at http://localhost:4321
npm run build    # astro check, then static output to dist/
npm run preview  # serve the built output
```

Generators, run only when their inputs change:

```bash
npm run logos    # vendor each tool's favicon into public/logos/
npm run images   # social cards and app icons into public/
npm run popular  # refresh the most-viewed snapshot (needs CF_* env vars)
npm run suggestions  # rebuild the reader-suggestion snapshot from open issues
```

`popular` and `suggestions` normally run themselves on daily GitHub Actions, not by hand —
see [docs/analytics.md](docs/analytics.md) and [docs/suggestions.md](docs/suggestions.md).

`npm run build` runs `check:entries` first, which fails on a TODO description, a dangling
`alternatives` id, a comparison row keyed to a tool that does not exist, or a suggestion
form that has drifted from the category names. `astro check` proves the entries typecheck;
that proves somebody wrote them.

## Adding a tool

Under 15 minutes, and it touches one file. Full walkthrough in
[docs/content-model.md](docs/content-model.md):

1. Add an entry to [`src/data/tools.ts`](src/data/tools.ts) — including a real
   `description` saying where the catch is.
2. Run `npm run logos` to pull in its icon.
3. Open a PR.

Its row, its own page, the category counts, the hero statistics, the footer, the sitemap
and the structured data all follow from step 1.

## Docs

| Doc | What's in it |
| --- | --- |
| [Information architecture](docs/information-architecture.md) | The three page types and what derives from what |
| [Content model](docs/content-model.md) | The tool and category schemas, and how to add one |
| [Architecture](docs/architecture.md) | Stack rationale, project layout, SEO and social metadata |
| [Design](docs/design.md) | Visual system, type, color, dark mode, components |
| [Deployment](docs/deployment.md) | Cloudflare Pages setup, DNS, headers, launch checklist |
| [Analytics](docs/analytics.md) | What's measured, the /go/ redirects, and the most-viewed plan |
| [Suggestions](docs/suggestions.md) | How readers add tools, and the three guards on unreviewed entries |
| [Reports](docs/reports.md) | The report endpoint, the review threshold, and why it is a Wilson bound |
| [Decisions](docs/decisions.md) | Choices made and why, plus open questions |
| [Roadmap](docs/roadmap.md) | What's shipped and what's next |
| [PRD](docs/prd.md) | The original brief — historical, since superseded |

## License

[MIT](LICENSE) for the source — the components, the scripts, the Function, the workflows.
Take it and build your own directory with it.

The directory content is reserved: the entries and shelves in `src/data/`, the prose in
`docs/`, and the devtool.fyi name and identity are © Renfred Alonge, all rights reserved.
That is the part somebody sat down and wrote. Third-party names and logos belong to their
owners and appear here as identification — removal requests go to hello@devtool.fyi and
are honoured. [Why the split](docs/decisions.md#q4--source-licensing--answered).
