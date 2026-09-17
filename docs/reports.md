# Reports

How a reader says an entry has gone wrong, and what happens when enough of them do.

Suggestions let the directory grow without the owner. Reports let it *stay correct* without
the owner, which is the harder half: tools shut down, get acquired, change their pricing and
quietly stop being what the entry says they are, and nobody here finds out automatically.

## The pipeline

```
Reader clicks "Something wrong with this entry?"
        ↓
/report/<id>/     static page, plain <form method="POST">, no JavaScript
        ↓
POST /api/report  Cloudflare Pages Function
        ↓
Workers KV        one key per report: reason, optional note, timestamp
        ↓
Daily Action, 05:40 UTC
        ↓  scripts/fetch-reports.mjs
        ↓  reports ÷ views of the page carrying the report link
        ↓  Wilson lower bound, against a hard floor of 3 reports
        ↓
   over the threshold → a review issue, and an entry in src/data/flags.json
```

## What a report can do

**It can cause a human to look at an entry. That is the entire ceiling.**

Reports never hide a curated entry, never reorder anything, never change a score and are
never displayed to anybody. That ceiling is what makes it safe to accept them from
anonymous strangers with no account: the best outcome available to somebody gaming this is
that a moderator glances at a page.

The one exception is a reported **suggestion**, which is withheld from its shelf until the
review happens. That is not a flag being displayed — the entry simply is not shown. A
suggestion was never vouched for by anyone here, so declining to keep showing one that
readers have objected to costs nothing. A curated entry had a human read it, so it stays
exactly as it is and the report goes to a person instead.

## Why there is an endpoint at all

This is the feature that broke [D17](decisions.md#d17--no-database-and-no-live-view-counters),
knowingly. Suggestions work through GitHub because a considered contribution justifies an
account. A report is a two-second reflex, and gating it behind a login takes the report rate
to approximately zero — which makes the ratio meaningless and the whole mechanism
decorative.

So there is exactly one dynamic endpoint, and the site around it is unchanged: still static
files, still no client-side JavaScript. `/report/<id>/` is a prerendered page with a plain
HTML form, the same trick `/go/<id>/` already uses to count outbound clicks without a
tracking script. The endpoint's whole response is a 303 to a static page.

## Why the threshold is not a plain ratio

"Reports as a percentage of views" gets small samples exactly backwards. An entry with three
views and one report is at 33% and would flag instantly; one with ten thousand views and
fifty reports is at 0.5% and never would. The first is noise and the second might be real.

So two things have to be true before anything is flagged:

| Guard | Value | What it stops |
| --- | --- | --- |
| Report floor | 3 | A grudge. No ratio flags an entry two people complained about |
| Report rate, **lower bound** | 1% | Noise from tiny samples reading as a crisis |

The rate is a [Wilson score](https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval#Wilson_score_interval)
lower bound rather than the raw proportion — the low end of the plausible range for the true
rate, given how little data there is. One report in three views scores 6%, not 33%. The bound
climbs towards the true rate as the sample grows, so a genuinely bad entry with real traffic
still trips it.

```
  3 reports /   100 views → 1.03%  flags
  3 reports /   300 views → 0.34%  does not
 10 reports /   500 views → 1.09%  flags
 50 reports / 10000 views → 0.38%  does not
```

**The denominator is views of the page carrying the report link**, which is the population
that could actually have filed one. For a tool that is its own page. A suggestion has no
page — it sits at the foot of a category shelf — so the shelf is its denominator.

A report count higher than the recorded view count means the analytics missed views, not a
rate above 100%: you cannot report an entry without having looked at it. The script takes
the larger of the two, so a gap in the analytics cannot flag everything at once.

## What is stored, and what is not

A report keeps a reason, an optional sentence, and a timestamp. Ninety-day TTL.

**The reporter's IP address is never written down.** To stop one person reporting the same
entry fifty times, the endpoint hashes the address with a secret salt and the date, keeps
that hash for a day, and throws the address away. The hash cannot be reversed without the
salt, cannot be correlated across days because the date is in it, and expires on its own.
This is what the footer's "nothing personal stored" depends on, and it was re-checked when
reporting was added.

`src/data/flags.json` holds **verdicts only** — `{ id, kind, reasons }`, no counts. The
repository is public, and a committed file saying "stripe: 14 reports against 9,000 views"
would publish both the site's traffic figures, which [D19](decisions.md#d19--the-snapshot-stores-share-never-counts)
exists to keep out, and an unreviewed accusation about a named company. The numbers go in
the review issue, where a moderator needs them.

## Abuse, honestly

Anonymous reporting is gameable, and the ratio is attackable from both ends — somebody can
file reports, and somebody can generate views to dilute them. The defences are proportionate
rather than airtight, because the prize is so small:

- **A honeypot field**, hidden from sight, from screen readers and from the tab order. Only
  an automated submitter fills it in. Catches undirected form spam, needs no JavaScript, and
  answers with the normal thank-you page so a bot learns nothing.
- **One report per person, per entry, per day.**
- **Ten reports per person per day** across all entries. Read-modify-write on KV is not
  atomic, so a concurrent burst can undercount — accepted deliberately, since being off by a
  few costs a moderator a moment.
- **Slug validation** on the endpoint, and ids matching no real entry are discarded when the
  flags are computed, the same way `fetch-popular.mjs` drops analytics paths with no tool.

What is deliberately absent is a CAPTCHA. Turnstile would need client-side JavaScript on a
site that ships none, to defend a mechanism whose worst case is an unnecessary code review.

## Setting it up

The endpoint needs two bindings on the Pages project, and the Action needs one more secret.

**Pages → Settings → Functions:**

| Binding | Type | Value |
| --- | --- | --- |
| `REPORTS` | KV namespace | Create one, e.g. `devtool-reports` |
| `REPORT_SALT` | Secret | Any long random string. `openssl rand -hex 32` |

Without `REPORTS` the endpoint returns 503 rather than accepting reports into nowhere —
a feature that looks fine and measures nothing is the worst available outcome.

**Repository secret**, on the `Devtool Analytics` environment beside the `CF_*` ones:

| Secret | Where it comes from |
| --- | --- |
| `CF_KV_NAMESPACE_ID` | Workers & Pages → KV → the namespace's ID |

`CF_API_TOKEN` needs **Workers KV Storage: Read** adding to the Account Analytics: Read it
already has.

There is deliberately no `wrangler.toml`. The Pages project is configured from the
dashboard, and adding one would take that over — a config file is the better long-term
answer, but not one worth switching to underneath a live deployment without a reason.

## Running it locally

```bash
npm run build
npx wrangler pages dev dist --kv REPORTS --binding REPORT_SALT=testsalt
```

`--kv` creates a local namespace in `.wrangler/`, which is gitignored. The form at
`http://localhost:8788/report/<id>/` then works end to end.

```bash
CF_API_TOKEN=… CF_ACCOUNT_ID=… CF_SITE_TAG=… CF_KV_NAMESPACE_ID=… \
GITHUB_TOKEN=$(gh auth token) GITHUB_REPOSITORY=renfrrd-ai/devtool \
npm run reports
```

## Clearing a flag

Flags are recomputed from scratch every day, so a flag persists while the reports that
caused it are still in KV — closing the review issue does not clear it. Reports age out
after ninety days on their own. To clear one sooner, delete the entry's `report:` keys from
the namespace; the next run drops the flag and, for a suggestion, restores it to its shelf.

That asymmetry is intentional. A flag should outlive somebody's annoyance at an issue
notification.
