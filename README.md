# devtool.fyi

The front door for the developer tools built and maintained by Renfred Alonge.

Each tool lives on its own domain. devtool.fyi is the one page that says they all come
from the same place — a fast, static directory of every tool with a one-liner, a status
badge, and a link out.

## The tools

| Tool | Domain | Status |
| --- | --- | --- |
| Clueline | [clueline.dev](https://clueline.dev) | Live |
| HQBase | [hqbase.io](https://hqbase.io) | Live |
| trueluk | [trueluk.com](https://trueluk.com) | Idea |

That table is a snapshot for readers. The site's source of truth is
[`src/data/tools.ts`](src/data/tools.ts) — one entry per tool, rendered into rows.

## Status

Built and building clean; not yet deployed. Connect the Cloudflare Pages project and point
the domain to go live — see [deployment](docs/deployment.md#hosting-cloudflare-pages) for
the steps and the [roadmap](docs/roadmap.md) for what's left.

## Stack

Astro building to fully static output. No framework runtime, no server, no database. The
page ships HTML, one stylesheet, self-hosted fonts, and two small scripts for the theme
toggle.

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
[docs/content-model.md](docs/content-model.md); the short version:

1. Add an entry to [`src/data/tools.ts`](src/data/tools.ts).
2. Run `npm run logos` to pull in its icon.
3. Open a PR. The row, the hero stats, the footer, the sitemap and the structured data all
   update themselves.

## Docs

| Doc | What's in it |
| --- | --- |
| [PRD](docs/prd.md) | Problem, solution, scope, success criteria |
| [Architecture](docs/architecture.md) | Stack rationale, project layout, SEO and social metadata |
| [Content model](docs/content-model.md) | The tool entry schema, icons, and how to add a tool |
| [Design](docs/design.md) | Visual system, type, color, dark mode, components |
| [Deployment](docs/deployment.md) | Cloudflare Pages setup, DNS, headers, launch checklist |
| [Roadmap](docs/roadmap.md) | v1 milestones and what comes after |
| [Decisions](docs/decisions.md) | Choices made and why, plus the open questions |

## License

Content and branding are © Renfred Alonge. Licensing for the site source is TBD —
[Q4](docs/decisions.md#q4--source-licensing).
