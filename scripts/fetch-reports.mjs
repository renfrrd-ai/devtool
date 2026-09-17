/**
 * Turns reader reports into review flags.
 *
 * Run by .github/workflows/refresh-reports.yml on a daily cron. Reads the KV
 * namespace that functions/api/report.js writes to, pairs each entry's report
 * count against its page views from the Cloudflare analytics API, and commits
 * the verdict — never the numbers.
 *
 * WHY THE NUMBERS STAY HERE: this repository is public. A committed file saying
 * "stripe: 14 reports against 9,000 views" would publish both the site's
 * traffic figures, which D19 exists to keep out, and an unreviewed accusation
 * about a named company. The ratio is computed in this script, where the raw
 * data already is, and src/data/flags.json gets `{ id, kind, reasons }`. The
 * counts go in the review issue, where a moderator needs them.
 *
 * Environment:
 *   CF_API_TOKEN        Account Analytics: Read, plus Workers KV Storage: Read
 *   CF_ACCOUNT_ID       the account holding both
 *   CF_SITE_TAG         the Web Analytics site tag
 *   CF_KV_NAMESPACE_ID  the namespace bound as REPORTS on the Pages project
 *   GITHUB_TOKEN        to open review issues
 *   GITHUB_REPOSITORY   owner/name
 */

import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { tools } from '../src/data/tools.ts';
import { categories } from '../src/data/categories.ts';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'flags.json');

const {
  CF_API_TOKEN,
  CF_ACCOUNT_ID,
  CF_SITE_TAG,
  CF_KV_NAMESPACE_ID,
  GITHUB_TOKEN,
  GITHUB_REPOSITORY,
} = process.env;

const WINDOW_DAYS = 30;

/*
 * Two thresholds, and both have to be met.
 *
 * MIN_REPORTS is a hard floor. No ratio, however alarming, flags an entry that
 * two people complained about — at those numbers the ratio is noise and the
 * flag would mostly catch grudges.
 *
 * RATE applies to the *lower bound* of the report rate, not the raw ratio. One
 * report out of three views is a raw rate of 33%, which would flag instantly
 * and mean nothing; its Wilson lower bound is about 6%, which is the honest
 * reading of three data points. The bound rises towards the true rate as the
 * sample grows, so a genuinely bad entry with real traffic still trips it.
 */
const MIN_REPORTS = 3;
const RATE = 0.01;

const missing = Object.entries({
  CF_API_TOKEN,
  CF_ACCOUNT_ID,
  CF_SITE_TAG,
  CF_KV_NAMESPACE_ID,
  GITHUB_TOKEN,
  GITHUB_REPOSITORY,
})
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missing.length > 0) {
  console.error(`Missing ${missing.join(', ')} — see docs/reports.md`);
  process.exit(1);
}

const cf = (path, init) =>
  fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${CF_API_TOKEN}`, ...(init?.headers ?? {}) },
  });

/* ------------------------------------------------------- the reports, from KV */

const base = `/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}`;

/** Only `report:` keys. The `seen:` and `rate:` keys are dedupe state, not data. */
const keys = [];
let cursor = '';

do {
  const query = new URLSearchParams({ prefix: 'report:', limit: '1000' });
  if (cursor) query.set('cursor', cursor);

  const res = await cf(`${base}/keys?${query}`);
  if (!res.ok) {
    console.error(`KV list returned ${res.status}. Keeping the existing flags.`);
    process.exit(1);
  }

  const payload = await res.json();
  keys.push(...payload.result.map((key) => key.name));
  cursor = payload.result_info?.cursor ?? '';
} while (cursor);

console.log(`${keys.length} report key(s) in KV.`);

/*
 * Keys are `report:<kind>:<id>:<timestamp>-<nonce>`. The endpoint validates the
 * slug's shape but not whether it names anything, so an id matching no entry is
 * dropped here — the same way fetch-popular.mjs discards analytics paths with
 * no matching tool. The key expires on its own in ninety days.
 */
const toolIds = new Set(tools.map((tool) => tool.id));
const byEntry = new Map();
const unmatched = new Set();

for (const key of keys) {
  const [, kind, id] = key.split(':');
  if (!kind || !id) continue;

  if (kind === 'tool' && !toolIds.has(id)) {
    unmatched.add(id);
    continue;
  }

  const slot = byEntry.get(`${kind}:${id}`) ?? { kind, id, keys: [], reasons: new Map() };
  slot.keys.push(key);
  byEntry.set(`${kind}:${id}`, slot);
}

if (unmatched.size > 0) {
  console.log(`Ignored reports for ${unmatched.size} unknown id(s): ${[...unmatched].join(', ')}`);
}

/*
 * Reasons are only fetched for entries that already clear the report floor.
 * Everything below it is going to be discarded anyway, and a value read per
 * report on a namespace full of noise is the one part of this that could get
 * slow.
 */
for (const slot of byEntry.values()) {
  if (slot.keys.length < MIN_REPORTS) continue;

  for (const key of slot.keys) {
    const res = await cf(`${base}/values/${encodeURIComponent(key)}`);
    if (!res.ok) continue;

    try {
      const { reason } = JSON.parse(await res.text());
      if (reason) slot.reasons.set(reason, (slot.reasons.get(reason) ?? 0) + 1);
    } catch {
      /* A malformed value is not worth failing the run over. */
    }
  }
}

/* --------------------------------------------------- the views, from analytics */

const end = new Date();
const start = new Date(end.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

const query = `
  query TopPaths($accountTag: string!, $siteTag: string!, $start: Time!, $end: Time!) {
    viewer {
      accounts(filter: { accountTag: $accountTag }) {
        rumPageloadEventsAdaptiveGroups(
          filter: { siteTag: $siteTag, datetime_geq: $start, datetime_leq: $end }
          orderBy: [count_DESC]
          limit: 1000
        ) {
          count
          dimensions { requestPath }
        }
      }
    }
  }
`;

const analytics = await cf('/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query,
    variables: {
      accountTag: CF_ACCOUNT_ID,
      siteTag: CF_SITE_TAG,
      start: start.toISOString(),
      end: end.toISOString(),
    },
  }),
});

const views = new Map();

if (analytics.ok) {
  const payload = await analytics.json();
  if (payload.errors?.length) {
    console.log('GraphQL errors; treating views as unknown:', JSON.stringify(payload.errors));
  }

  const groups = payload.data?.viewer?.accounts?.[0]?.rumPageloadEventsAdaptiveGroups ?? [];
  for (const group of groups) {
    const path = (group.dimensions?.requestPath ?? '').split('?')[0].replace(/\/$/, '');
    views.set(path, (views.get(path) ?? 0) + group.count);
  }
} else {
  console.log(`Analytics returned ${analytics.status}; treating views as unknown.`);
}

/*
 * The denominator is views of the page that carries the report link, which is
 * the population that could actually have filed one. For a tool that is its own
 * page. A suggestion has no page — it appears at the foot of a category shelf —
 * so the shelf is its denominator.
 */
const suggestionCategory = new Map();

try {
  const snapshot = JSON.parse(readFileSync(join(dirname(OUT), 'suggestions.json'), 'utf8'));
  for (const entry of snapshot.entries ?? []) suggestionCategory.set(entry.id, entry.category);
} catch {
  /* No suggestions yet. */
}

function viewsFor(kind, id) {
  if (kind === 'tool') return views.get(`/tools/${id}`) ?? 0;

  const category = suggestionCategory.get(id);
  return category ? (views.get(`/categories/${category}`) ?? 0) : 0;
}

/* ------------------------------------------------------------------ the verdict */

/**
 * Wilson score lower bound — the low end of the plausible range for the true
 * report rate, given this many reports out of this many views. Small samples
 * are pulled hard towards zero, which is exactly the correction a raw ratio is
 * missing.
 */
function wilsonLower(successes, trials, z = 1.96) {
  if (trials === 0) return 0;

  const p = successes / trials;
  const z2 = z * z;
  const denominator = 1 + z2 / trials;
  const centre = p + z2 / (2 * trials);
  const margin = z * Math.sqrt((p * (1 - p) + z2 / (4 * trials)) / trials);

  return Math.max(0, (centre - margin) / denominator);
}

const flagged = [];
const reviewed = [];

for (const slot of byEntry.values()) {
  const reports = slot.keys.length;
  if (reports < MIN_REPORTS) continue;

  /*
   * You cannot report an entry without having looked at it, so a report count
   * above the recorded view count means the analytics missed views rather than
   * that the rate exceeds 100%. Taking the larger of the two keeps the maths
   * honest and stops a gap in the analytics from flagging everything.
   */
  const seen = Math.max(viewsFor(slot.kind, slot.id), reports);
  const rate = wilsonLower(reports, seen);

  reviewed.push({ ...slot, reports, seen, rate });
  if (rate < RATE) continue;

  flagged.push({
    id: slot.id,
    kind: slot.kind,
    reasons: [...slot.reasons.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([reason]) => reason),
  });
}

flagged.sort((a, b) => a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id));

for (const entry of reviewed) {
  const verdict = entry.rate >= RATE ? 'FLAG' : 'below threshold';
  console.log(
    `  ${verdict.padEnd(16)} ${entry.kind}/${entry.id}: ` +
      `${entry.reports} report(s) of ${entry.seen} view(s), ` +
      `lower bound ${(entry.rate * 100).toFixed(2)}%`,
  );
}

console.log(`${flagged.length} entry(ies) flagged for review.`);

/* ------------------------------------------------------------- the review issue */

async function gh(path, init) {
  return fetch(`https://api.github.com/repos/${GITHUB_REPOSITORY}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init?.headers ?? {}),
    },
  });
}

const openIssues = await gh('/issues?labels=review&state=open&per_page=100');
const existing = new Set();

if (openIssues.ok) {
  for (const issue of await openIssues.json()) {
    const match = /`([a-z0-9-]+)`/.exec(issue.title ?? '');
    if (match) existing.add(match[1]);
  }
}

for (const entry of reviewed) {
  if (entry.rate < RATE) continue;
  // One open issue per entry. Re-raising it daily would bury the tracker.
  if (existing.has(entry.id)) continue;

  const reasons = [...entry.reasons.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => `- ${reason} × ${count}`)
    .join('\n');

  const body =
    `Readers have reported \`${entry.id}\` enough times to be worth a look.\n\n` +
    `| | |\n| --- | --- |\n` +
    `| Reports | ${entry.reports} |\n` +
    `| Views of the page carrying the report link | ${entry.seen} |\n` +
    `| Report rate, lower bound | ${(entry.rate * 100).toFixed(2)}% |\n\n` +
    `Reasons given:\n\n${reasons || '- none recorded'}\n\n` +
    (entry.kind === 'suggestion'
      ? 'This is an unreviewed suggestion, so it has been **withheld from its shelf** ' +
        'until this is resolved. Closing this issue does not restore it — remove the ' +
        'flag by resolving the underlying reports, or accept or reject the suggestion.\n\n'
      : 'This is a reviewed entry, so **nothing has changed on the site** and nothing ' +
        'will until you decide something. Reports are a prompt, not a verdict.\n\n') +
    'Filed automatically by `scripts/fetch-reports.mjs`. See docs/reports.md.';

  const created = await gh('/issues', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: `Review \`${entry.id}\` — ${entry.reports} reader reports`,
      body,
      labels: ['review'],
    }),
  });

  console.log(
    created.ok
      ? `Opened a review issue for ${entry.id}.`
      : `Could not open a review issue for ${entry.id}: ${created.status}`,
  );
}

/* --------------------------------------------------------------------- writing */

const snapshot = { generatedAt: new Date().toISOString(), flagged };

const previous = readFileSync(OUT, 'utf8');
const next = `${JSON.stringify(snapshot, null, 2)}\n`;

const stripStamp = (text) => text.replace(/"generatedAt":.*?,/, '');
if (stripStamp(previous) === stripStamp(next)) {
  console.log('Flags unchanged. Nothing to commit.');
  process.exit(0);
}

writeFileSync(OUT, next);
console.log(`Wrote ${flagged.length} flag(s).`);
