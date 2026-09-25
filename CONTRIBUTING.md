# Contributing

devtool.fyi is a curated directory. Curation has one obvious failure mode — it only grows
when one person has an afternoon free — and everything below exists to route around that
without giving up the thing that makes the site worth reading: every entry says where the
tool's catch is, in one voice.

So there are four ways in, and they cost different amounts.

| You want to | Go here | Costs you |
| --- | --- | --- |
| Put a tool on the list, no setup | [Suggestion form](https://github.com/renfrrd-ai/devtool/issues/new?template=suggest-tool.yml) | Two minutes, a GitHub account |
| Put a tool on the list, today | [A pull request](#adding-a-tool-yourself) | Fifteen minutes, one file |
| Say an entry is wrong | [Correction form](https://github.com/renfrrd-ai/devtool/issues/new?template=correct-entry.yml), or the Report link on the entry | One minute, no account for Report |
| Change the site itself | [A pull request](#changing-the-site-itself) | Depends — read this first |

## Suggesting a tool

Fill in [the form](https://github.com/renfrrd-ai/devtool/issues/new?template=suggest-tool.yml).
It opens an issue, and from there:

- **👍 reactions are the votes.** Three of them and the suggestion appears at the foot of
  its category shelf, marked unreviewed. Below three it is real and visible, but only in
  the issue tracker.
- **Unreviewed entries are deliberately subordinate.** No write-up, no icon, a dashed
  outline, and a `nofollow ugc` link — so a suggestion cannot cash in on the directory's
  credibility, or its ranking, before a human has checked it.
- **You do not write the published description.** The form's "where is the catch?" box is
  the one the review actually reads, and it feeds the paragraph — but the paragraph gets
  written here, because a directory in fifty voices is just a list of landing pages.
- **No shelf fits? Name a new one.** Pick "Something else" and type the category. It
  waits in the tracker until a shelf by that name exists — other suggestions asking for
  the same category are what get it opened — and then lands on it by itself.
- **Say if it's yours.** The form asks. A disclosed commercial interest is surfaced next
  to the entry ("Submitted by its maker"), not filtered out. You know the tool best; the
  honest move is to let the reader weigh that themselves.

Accepting one means labelling the issue `accepted`, which opens a PR with your facts
filled in and the description left as a `TODO` that fails the build until somebody writes
it. The whole pipeline is in [docs/suggestions.md](docs/suggestions.md).

## Adding a tool yourself

Faster than the form if you are comfortable opening a PR, and it skips the vote threshold
entirely — a reviewed entry is a reviewed entry however it arrived.

It touches one file:

1. **Add an entry** to the `tools` array in [`src/data/tools.ts`](src/data/tools.ts).
   TypeScript catches a missing field or a mistyped status.
2. **Write the tagline and the description.** The only part that takes real thought —
   see [below](#writing-the-copy).
3. **Set `categories`,** primary first. It decides the breadcrumb and the tool page
   header. If nothing fits, see [adding a category](#adding-a-category).
4. **Run `npm run logos`** to vendor the tool's favicon into `public/logos/`. It fetches
   only what is missing, and the result is committed so the deployed page still makes no
   third-party requests.
5. **Add a comparison row** if the shelf has a table — `comparison.rows` in
   [`src/data/categories.ts`](src/data/categories.ts), keyed by tool id. This is the one
   place adding a tool touches a second file, and it is optional: a tool with no row is
   left out of the table and still appears in the list above it.
6. **Look at it** — `npm run dev`, then the row on a narrow viewport, the tool page, and
   both themes.
7. **Open a PR.** Every PR gets a Cloudflare preview URL.

The category counts, the sample names on the home page, the hero statistics, the footer
lists, the tool's own page, the sitemap and the structured data all follow from step 1.
None of them need touching — if you find yourself editing a page template to make a tool
appear, something has gone wrong and the PR should say so.

Full schema, field by field, in [docs/content-model.md](docs/content-model.md).

## Writing the copy

Two text fields doing different jobs. An entry where they say the same thing twice is
worse than one with only a tagline.

**`tagline`** — what it does and who it is for, in one line, under 95 characters, no
trailing full stop. It has to survive being read against five others on the same page, so
keep it within about twenty characters of its neighbours. No marketing intensifiers:
every tool in the directory is powerful and modern, so the words carry no information.

> Merchant of record for software — it owns the global tax problem

**`description`** — two or three sentences saying something the tagline cannot: the
trade-off, the catch, who it is genuinely not for. This is the entire reason a tool page
exists. If it restates the tagline at greater length, it is not a description yet.

> Paddle is the seller of record, which means it registers for and remits sales tax and
> VAT worldwide instead of you. You pay a higher percentage than a raw processor and
> accept less control over checkout; for a small team selling internationally that is
> usually the right trade.

**`stack`** — what it runs on or is built with, three or four at most. `Cloudflare
Workers, R2, Self-hosted` is a stack; `Shared inboxes, Team access` is a feature list and
belongs in the description.

**`pricing` and `openSource` are separate fields,** because conflating them gets tools
wrong in both directions — Plausible is open source *and* paid to use hosted.

Write it as though the reader is about to spend a week on this tool and you would rather
they did not waste it. That is the whole editorial standard.

## Adding a category

A deliberate act, not a tag. A new shelf creates a page that has to earn its place, and a
shelf with one tool on it looks broken.

**Three entries is the floor.** If your tool has no shelf, the useful contribution
is usually to suggest it with "Something else" and the category named, and let it wait
for company — a category arrives with a handful of tools or not at all. Suggestions
waiting on a shelf are the evidence for opening it, and they move onto it on the next
daily refresh once it exists.

If you are adding one anyway: an entry in `categories.ts` with a `description` that names
the trade-off distinguishing the tools on that shelf (not a restatement of the name), a
comparison table on axes that decide something, and — because the two are coupled — the
matching option in the [suggestion form's](.github/ISSUE_TEMPLATE/suggest-tool.yml)
category dropdown. `npm run check:entries` fails the build if those two drift, which is
not hypothetical: five of the nine options were wrong the first time the form was written.

## Correcting an entry

Tools change, shut down and get acquired, and nobody here notices automatically. Two ways
to say so, and both are welcome — corrections get fixed ahead of new entries.

- **The Report link** at the foot of every entry. No account, no cookie, one form.
  Reports never publish anything and never hide an entry on their own; enough of them
  relative to the entry's page views puts it in front of a human. [How that
  threshold works](docs/reports.md).
- **The [correction form](https://github.com/renfrrd-ai/devtool/issues/new?template=correct-entry.yml)**,
  if you know what it should say instead. More useful than a report, because it arrives
  with the fix in it.
- **A PR**, if the fix is a field. Fastest of the three.

## Changing the site itself

Bug fixes, accessibility fixes, build fixes and performance work are all welcome. Before
you build a feature, though, the site has a shape it is defending, and several obvious
improvements have already been considered and turned down:

- **No search, no filtering.** Nine shelves is browsable, the facts you would filter on
  are already on every row, and both cost client-side JavaScript the site does not
  otherwise ship. Search earns its place somewhere north of twenty categories.
- **No `/tools` index page.** It would be the fifty-row wall the three-page structure
  exists to avoid.
- **No client-side JavaScript beyond the theme toggle.** The reporting form posts plain
  HTML to one Pages Function; the `/go/` click counters are redirect stubs. If a feature
  needs a framework runtime on the page, the answer is usually that the feature is wrong
  for this site rather than that the constraint is.
- **No database.** GitHub issues hold the suggestions, reactions hold the votes, labels
  hold the moderation state, and daily jobs commit snapshots into git. The build never
  calls the network.
- **No ranking.** Tools within a shelf are alphabetical, which is visibly arbitrary, and
  that is the honest signal — this directory has not earned a ranking.

None of those are permanent, but reversing one is a decision with a paragraph behind it.
The paragraphs live in [docs/decisions.md](docs/decisions.md); the best way to change one
is to open an issue arguing with it before writing the code.

## Local setup

Node 20 or newer.

```bash
git clone https://github.com/renfrrd-ai/devtool.git
cd devtool
npm install
npm run dev        # http://localhost:4321
```

```bash
npm run build      # check:entries, then astro check, then the static build
npm run preview    # serve what the build produced
```

Generators, run only when their inputs change — not part of the build:

```bash
npm run logos        # vendor each tool's favicon into public/logos/
npm run images       # social cards and app icons into public/
npm run popular      # refresh the most-viewed snapshot (needs CF_* env vars)
npm run suggestions  # rebuild the reader-suggestion snapshot from open issues
npm run reports      # pull the open reports and flag anything over the threshold
```

`popular`, `suggestions` and `reports` normally run themselves on daily GitHub Actions.

Reporting also has an operational pair, which only the maintainer can usefully run:
`npm run reports:probe` asks the live endpoint what state it is in, and
`npm run reports:setup` diagnoses and configures the Cloudflare side —
[docs/reports.md](docs/reports.md#setting-it-up).

## What the checks actually check

`npm run build` runs [`scripts/check-entries.mjs`](scripts/check-entries.mjs) first. It
catches the mistakes the type system cannot see:

- a `description` still set to `TODO`, or too short to be saying anything
- a tagline over 95 characters, or ending in a full stop
- an `alternatives` id, or a comparison row, keyed to a tool that does not exist
- a `licence` without `openSource`, or a `status` on a third-party entry
- the suggestion form's category dropdown drifting from `categories.ts`

Then `astro check` typechecks every page and component. Between them: `astro check` proves
the entries typecheck, `check-entries` proves somebody wrote them.

Both run again in CI on every pull request, so a red check is a real problem, not a flaky
one.

## Pull requests

- **One change per PR.** A tool, a fix, a feature. A PR doing three things takes three
  times as long to review and gets reverted as one lump when one of them is wrong.
- **Commit messages say what the change does,** in a sentence, imperative, no prefix —
  `Let readers report an entry, and weigh the reports against views`. If the sentence
  needs an "and" plus a semicolon, it is probably two commits.
- **Match the surrounding code.** Comments here explain *why*, not what; components are
  plain `.astro` with scoped styles; colours come from the tokens in
  [`src/styles/global.css`](src/styles/global.css), never hard-coded, because both themes
  read from them.
- **Check both themes and a 320px viewport** for anything visual.
- **Say what you could not check.** An honest "I did not test the dark theme" is worth
  more than a confident PR description that turns out to be wrong.

There is no CLA and no template you have to obey — the
[PR template](.github/PULL_REQUEST_TEMPLATE.md) is a checklist to help, and deleting the
parts that do not apply is expected.

## What gets turned down

Not personal, and usually predictable:

- **Marketing copy.** Rewritten, not rejected — but it slows the review down, so the
  submission is better off without it.
- **Tools with no shelf,** until the shelf has three entries in sight.
- **Link-farm submissions.** The `nofollow ugc` on unreviewed entries means there is
  nothing in this for SEO, which is the point.
- **Features the site is deliberately not building** — see above.
- **Volume.** Ten suggestions in one sitting from one account reads as a campaign, and
  gets treated as one.

## Code of conduct and security

By taking part you agree to the [Code of Conduct](CODE_OF_CONDUCT.md). Security issues go
to <hello@devtool.fyi>, privately and not through the tracker — see
[SECURITY.md](SECURITY.md).

## Licensing

Two halves, and which one you are contributing to depends on what you touch —
[the full text is in LICENSE](LICENSE), and the reasoning is
[Q4](docs/decisions.md#q4--source-licensing--answered).

**Code is [MIT](LICENSE).** Components, layouts, styles, the Pages Function, the scripts,
the workflows. Contribute to those and your contribution is MIT, same as the rest.

**The directory content is reserved.** The entries in `src/data/tools.ts`, the shelves in
`src/data/categories.ts`, the prose in `docs/`, and the site's name and identity are
© Renfred Alonge, all rights reserved. A PR adding or editing an entry is a contribution
to that reserved content, offered on the understanding that it becomes part of it — which
is worth knowing before you write three paragraphs, not after.

There is no CLA to sign; opening the PR is the whole of it. Third-party names and logos
belong to their owners.

## Anything else

Open an issue. A question that turns out to be a gap in these docs is a contribution too.
