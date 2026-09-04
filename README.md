# devtool.fyi

The front door for the developer tools built and maintained by Renfred Alonge.

Each tool lives on its own domain. devtool.fyi is the one page that says they all come
from the same place — a fast, static directory of every tool with a one-liner, a status
badge, and a link out.

## The tools

| Tool | Domain | Status |
| --- | --- | --- |
| Clueline | [clueline.dev](https://clueline.dev) | Live |
| hqbase | [hqbase.io](https://hqbase.io) | TBD |
| trueluk | [trueluk.com](https://trueluk.com) | Idea |

The table above is a snapshot for readers. The site's source of truth is
[`src/data/tools.ts`](docs/content-model.md) — one entry per tool, rendered into cards.

## Status

Pre-build. The PRD and supporting docs are written; the site itself is not yet
implemented. See the [roadmap](docs/roadmap.md) for what ships in v1.

## Docs

| Doc | What's in it |
| --- | --- |
| [PRD](docs/prd.md) | Problem, solution, scope, success criteria |
| [Architecture](docs/architecture.md) | Stack choice, project layout, build pipeline |
| [Content model](docs/content-model.md) | The tool entry schema and how to add a tool |
| [Design](docs/design.md) | Visual identity, layout, type, color, a11y |
| [Deployment](docs/deployment.md) | Hosting, DNS, environments, cross-linking |
| [Roadmap](docs/roadmap.md) | v1 milestones and what comes after |
| [Decisions](docs/decisions.md) | Decisions made, and the open questions behind them |

## Getting started

Once the site is scaffolded (see [architecture](docs/architecture.md)):

```bash
npm install
npm run dev      # local dev server at http://localhost:4321
npm run build    # static output to dist/
npm run preview  # serve the built output
```

## Adding a tool

Adding a tool should take under 15 minutes and touch one file. The full walkthrough is in
[docs/content-model.md](docs/content-model.md); the short version:

1. Add an entry to `src/data/tools.ts`.
2. Drop a logo into `public/logos/`.
3. Open a PR. The card renders itself.

## License

Content and branding are © Renfred Alonge. Licensing for the site source is TBD.
