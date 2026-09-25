# Suggestions

How a tool gets into the directory without the owner noticing it exists first.

The directory is curated, and curation has an obvious failure mode: it only grows when one
person has an afternoon free. This is the path around that — readers propose tools, other
readers vote, and the ones people actually want surface on the shelf they belong to,
flagged as unreviewed until somebody has written down where their catch is.

## The pipeline

```
Reader opens the issue form  →  GitHub issue, labelled `tool-suggestion`
                                        ↓  👍 reactions are the votes
Daily Action, 05:20 UTC       →  scripts/fetch-suggestions.mjs
                                        ↓
                                 src/data/suggestions.json  (committed)
                                        ↓
                                 Pages rebuilds → renders at the foot of the shelf,
                                 but only above the vote threshold

Owner labels an issue `accepted`
                              →  scripts/promote-suggestion.mjs
                                        ↓
                                 a branch and a PR adding it to tools.ts,
                                 with the description left as a TODO
                                        ↓
                                 the build fails until that TODO is written
```

**GitHub is the database.** Issues hold the submissions, reactions hold the votes, labels
hold the moderation state. That is the whole reason this needs no backend, no database, no
public write endpoint and no client-side JavaScript — [D17](decisions.md#d17--no-database-and-no-live-view-counters)
survives intact, and the site is still a pile of static files.

It is also the same pipeline shape as the most-viewed snapshot: a scheduled job writes a
JSON file into git, and the build reads it without ever calling the network. A GitHub
outage cannot fail a deploy; yesterday's snapshot simply stands.

## What it costs

A submitter needs a GitHub account. For a directory of developer tools that is close to
free, and it buys real abuse resistance: votes are one per account, accounts have history,
and a brand-new account voting for one tool is visible.

## The three guards

Unreviewed entries on a curated site are a genuine risk — the entire value of the
directory is that somebody read each entry and wrote down its trade-off. Three things keep
a suggestion from cashing in on that credibility before it has earned any.

**1. It is structurally subordinate.** Suggestions render in their own block below the
comparison table, never as extra rows in the list. They carry no description, because the
"where's the catch" paragraph is the editorial voice. They get no logo, so they never look
as finished as the rows above. They are dashed rather than solid, so they read as
provisional before any label is read.

More importantly they are not `Tool`s at all. They live in `src/lib/suggestions.ts`, not
`src/lib/directory.ts`, so they cannot reach the category counts, the hero statistics, the
comparison tables, the sitemap, the structured data or `getStaticPaths` — not because each
of those remembers to exclude them, but because they never enter the type those all read
from. A suggested tool has no `/tools/<id>` page and appears in no `ItemList`.

**2. The outbound link is `nofollow ugc`.** This is the one that matters for abuse. Most
of the reason anyone spams a directory is the ranking signal a link passes, and an
unreviewed listing passes none. The link still works for readers; it just does not pay
until a human has reviewed the entry and moved it into `tools.ts`, where the link is
ordinary.

**3. A vote threshold.** Three, in `scripts/fetch-suggestions.mjs`. Below it the suggestion
is real and visible in the issue tracker, and invisible on the site. Submitting your own
product and clicking 👍 once does not buy a place on a shelf; it has to persuade somebody
other than its author first.

On top of those, the form asks submitters to disclose a commercial interest, and that
disclosure is **surfaced, not filtered** — a suggestion from a tool's own maker is shown
with "Submitted by its maker" next to it. They know the tool best, and the honest move is
to say so and let the reader weigh it rather than quietly dropping it and implying the
shelf is neutral.

## Accepting one

Label the issue `accepted`. A workflow opens a pull request adding the entry to
`tools.ts` with the submitter's facts filled in — name, url, category, pricing, licence,
stack — and the description set to `TODO`, with their notes preserved as a comment above
it.

**The description does not automate, on purpose.** It is the only reason a tool page
exists on this site, it is written in one voice, and a submitted one is almost always
marketing copy. So `scripts/check-entries.mjs` fails the build on a TODO description, and
writing that paragraph is how the PR gets merged.

The failure lands on a branch rather than on `main`, which is why promotion opens a PR
instead of pushing. An entry arriving incomplete is a checklist on a pull request, not a
blocked deploy.

Rejecting one is just closing the issue. The next cron run drops it from the snapshot.

## The form and the shelf names are coupled

`.github/ISSUE_TEMPLATE/suggest-tool.yml` offers a category dropdown whose options are a
hand-written copy of the `name` fields in `src/data/categories.ts`, and the scripts map a
submission onto a shelf by matching that string exactly.

Drift between the two is silent and nasty: the form keeps accepting submissions and every
one of them is discarded on the next cron run, with an explanation in a log nobody reads.
`scripts/check-entries.mjs` compares the two and fails the build if they diverge. This is
not hypothetical — five of the nine options were wrong when the form was first written,
which is what prompted the check.

The one option that is not a shelf is the last, `NEW_CATEGORY_OPTION` in
`categories.ts`, for a tool none of them fit. The submitter names the category in the
free-text **New category** field, and `shelfForSuggestion()` resolves it loosely against
the shelf names and ids — so the suggestion is skipped (logged as waiting for that shelf)
until one exists, and lands on it on the first refresh after. Promoting one before its
shelf exists fails with the same explanation. The check requires this option to be there,
because without it a tool with no shelf cannot be suggested at all.

The same script also catches dangling `alternatives`, comparison rows keyed to a tool that
does not exist, a `licence` without `openSource`, an over-long tagline, and a `status` on a
third-party entry. `astro check` proves the entries typecheck; this proves somebody wrote
them.

## Secrets it needs

None. Both workflows run on the built-in `GITHUB_TOKEN`, which already has the read access
they need. The refresh job takes `contents: write` to commit the snapshot, and the
promotion job takes `pull-requests: write` to open the PR.

## Running it by hand

```bash
GITHUB_TOKEN=$(gh auth token) GITHUB_REPOSITORY=renfrrd-ai/devtool npm run suggestions
```

Both workflows also carry `workflow_dispatch`, so the Actions tab works too.

## Rejected: a form and a database

The obvious shape is a form on the site posting to a Cloudflare Worker, with suggestions
and votes in D1 and a moderation route behind Access. It was rejected for the same reason
as live view counters in [D17](decisions.md#d17--no-database-and-no-live-view-counters):
it buys a public write endpoint that anyone can curl in a loop, and with it rate limiting,
bot filtering, dedupe, an abuse story for votes with no identity behind them, and client
JavaScript on a site that ships none.

What it would buy is submissions from people without GitHub accounts. On a directory of
developer tools that is a small population, and the cost is the site's entire architecture.

Worth revisiting only if submissions are visibly bottlenecked on the account requirement —
which is measurable: it looks like traffic to the issue form with very few issues opened.
