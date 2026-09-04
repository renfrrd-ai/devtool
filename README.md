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

59 static pages: 1 home, 9 categories, 49 tools. The home page deliberately does *not*
list the tools — that would be a wall nobody reads. Reasoning in
[docs/information-architecture.md](docs/information-architecture.md).

## Built here

| Tool | Domain | Category | Status |
| --- | --- | --- | --- |
| HQBase | [hqbase.io](https://hqbase.io) | Email & SMTP | Live |
| Clueline | [clueline.dev](https://clueline.dev) | Monitoring & Errors | Live |
| trueluk | [trueluk.com](https://trueluk.com) | — | Idea |

## Stack

Astro building to fully static output. No framework runtime, no server, no database, no
tracking. Each page ships HTML, one shared stylesheet, self-hosted font subsets, and two
small scripts for the theme toggle — 23 KB of HTML for the home page, 16 KB for a tool
page.

## Getting started

```bash
npm install
npm run dev      # local dev server at http://localhost:4321
npm run build    # astro check, then static output to dist/
npm run preview  # serve the built output
```

Two generators, run only when their inputs change:

```bash
npm run logos    # vendor each tool's favicon into public/logos/
npm run images   # social cards and app icons into public/
```

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
| [Decisions](docs/decisions.md) | Choices made and why, plus open questions |
| [Roadmap](docs/roadmap.md) | What's shipped and what's next |
| [PRD](docs/prd.md) | The original brief — historical, since superseded |

## License

Content and editorial judgements are © Renfred Alonge. Third-party names and logos belong
to their owners. Licensing for the site source is TBD —
[Q4](docs/decisions.md#q4--source-licensing).
