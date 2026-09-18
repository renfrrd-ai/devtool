# Security

## Reporting a vulnerability

Email <hello@devtool.fyi>. Please don't open a public issue for anything that looks
exploitable — the tracker is the wrong place for a disclosure timeline.

Useful things to include: what you did, what happened, and what you think an attacker
could get out of it. A URL and a `curl` line beats a paragraph. If you would like credit
in the fix commit, say so.

**What to expect.** This is a one-person project, not a security team: a first reply
within about a week, and a fix or a written reason it is not one. No bug bounty, no
payment — just an honest answer and credit if you want it. If you hear nothing in two
weeks, assume the mail went astray and chase it.

There is no formal embargo, but please give a fix a reasonable chance to ship before
publishing.

## What the attack surface actually is

Worth reading before you spend time on it, because most of this site is a pile of files.

**In scope:**

- **`/api/report`** — one Cloudflare Pages Function, and the only thing on the site that
  accepts a write. It takes a form post, validates the slug format, the reason and the
  length, rate-limits per day, and writes a KV record. Interesting bugs here look like:
  writing a record that isn't a report, getting anything back out of the namespace, an
  unvalidated field reaching the moderator's view, or defeating the rate limit at scale.
- **Reversing or correlating the dedupe hash.** A report keeps a salted SHA-256 of the
  reporter's address for a day — not the address. If the salt can be recovered, or two
  days' hashes can be linked to the same person, that is a real finding.
- **The build and release path** — a workflow in `.github/workflows/` that can be made to
  run attacker-controlled code, commit something it shouldn't, or leak a secret through a
  log. `scripts/fetch-*.mjs` parse untrusted input (issue bodies written by strangers)
  and run in CI with a token, so injection there counts.
- **Anything that puts attacker-controlled markup into a page** — a suggestion's name or
  tagline escaping into the HTML, a report detail reaching a rendered surface.
- **Header, CSP and cache policy in [`public/_headers`](public/_headers)** being wrong in
  a way that has consequences.

**Out of scope,** and reported often enough to be worth naming:

- **The tools listed in the directory.** A vulnerability in Stripe or Supabase is not
  ours to fix. If an entry's link has been hijacked or the tool has turned malicious,
  that is a *content* problem — use the Report link on the entry, which is exactly what
  it is for.
- **Missing headers with no exploit behind them**, rate-limit findings on static assets,
  or scanner output pasted without a working attack.
- **Clickjacking, CSRF or session fixation on pages with no session.** The site has no
  accounts, no cookies and no logged-in state to confuse. `/api/report` accepts anonymous
  posts by design — its ceiling is making one human look at one entry.
- **Denial of service** against Cloudflare's edge or the repository's CI minutes.
- **Social engineering**, physical access, and anything requiring a compromised
  maintainer machine.
- **Third-party services' own infrastructure** — Cloudflare, GitHub. Report those to them.

## What the site stores

Because the honest answer is short: static pages, cookieless analytics, no accounts, and
nothing personal. A report keeps a reason, an optional sentence, a timestamp, and a salted
hash of the reporter's address for a day so the same entry cannot be reported fifty times.
The address itself is never written down, and the hash cannot be read back or correlated
across days.

More detail in [docs/reports.md](docs/reports.md) and
[docs/analytics.md](docs/analytics.md).

## Supported versions

There is one version: whatever is deployed at devtool.fyi from `main`. Fixes ship there
and nowhere else — no branches are maintained.
