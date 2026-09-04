/**
 * Refreshes src/data/popular.json from Cloudflare Web Analytics.
 *
 * Run by .github/workflows/refresh-popular.yml on a daily cron. Never run during
 * `astro build` — the build stays hermetic, so an analytics outage can never
 * fail a deploy. If this script fails, yesterday's committed snapshot stands.
 *
 * Environment:
 *   CF_API_TOKEN   an API token with Account Analytics: Read
 *   CF_ACCOUNT_ID  the account the Web Analytics site lives in
 *   CF_SITE_TAG    the Web Analytics site tag (not the beacon token)
 *
 * Getting those: docs/analytics.md.
 *
 * NOTE ON WHAT IS STORED: only each tool's share relative to the most-viewed
 * one, rounded to two decimals. No absolute counts, ever. This repository is
 * public, so committing raw numbers would publish the site's traffic figures —
 * which is exactly what "rank only, no raw numbers" was chosen to avoid. Share
 * is all the bar chart needs.
 */

import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { tools } from '../src/data/tools.ts';

const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'data',
  'popular.json',
);

const { CF_API_TOKEN, CF_ACCOUNT_ID, CF_SITE_TAG } = process.env;
const WINDOW_DAYS = 30;

/** Rank on page views by default; `--basis=clicks` ranks on outbound /go/ hits. */
const basis = process.argv.find((a) => a.startsWith('--basis='))?.split('=')[1] ?? 'views';
const PREFIX = basis === 'clicks' ? '/go/' : '/tools/';

if (!CF_API_TOKEN || !CF_ACCOUNT_ID || !CF_SITE_TAG) {
  console.error('Missing CF_API_TOKEN, CF_ACCOUNT_ID or CF_SITE_TAG — see docs/analytics.md');
  process.exit(1);
}

const end = new Date();
const start = new Date(end.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

const query = `
  query TopPaths($accountTag: string!, $siteTag: string!, $start: Time!, $end: Time!) {
    viewer {
      accounts(filter: { accountTag: $accountTag }) {
        rumPageloadEventsAdaptiveGroups(
          filter: { siteTag: $siteTag, datetime_geq: $start, datetime_leq: $end }
          orderBy: [count_DESC]
          limit: 500
        ) {
          count
          dimensions { requestPath }
        }
      }
    }
  }
`;

const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${CF_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
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

if (!res.ok) {
  console.error(`Cloudflare API returned ${res.status}. Keeping the existing snapshot.`);
  process.exit(1);
}

const payload = await res.json();

if (payload.errors?.length) {
  console.error('GraphQL errors:', JSON.stringify(payload.errors, null, 2));
  process.exit(1);
}

const groups =
  payload.data?.viewer?.accounts?.[0]?.rumPageloadEventsAdaptiveGroups ?? [];

// Only paths that resolve to a tool we actually list. Anything else — a stale
// slug, a probe, a typo in a shared link — is dropped rather than ranked.
const known = new Set(tools.map((tool) => tool.id));
const counts = new Map();

const unmatched = [];

for (const group of groups) {
  // Strip any query string and normalise the trailing slash. The site serves
  // /tools/stripe/ with a slash; older links and manual visits may not have one.
  const path = (group.dimensions?.requestPath ?? '').split('?')[0];
  if (!path.startsWith(PREFIX)) continue;

  const id = path.slice(PREFIX.length).replace(/\/$/, '');
  if (!known.has(id)) {
    unmatched.push(path);
    continue;
  }

  counts.set(id, (counts.get(id) ?? 0) + group.count);
}

// A slug that no longer exists is usually a renamed or removed tool, and worth
// knowing about — it means inbound links are landing on a 404.
if (unmatched.length > 0) {
  console.log(`Ignored ${unmatched.length} path(s) with no matching tool:`);
  console.log(unmatched.slice(0, 10).map((p) => `  ${p}`).join('\n'));
}

/*
 * "Nothing to rank" has two very different causes and they need different
 * fixes, so say which one it is. Silently reporting "no traffic" when the API
 * actually returned hundreds of rows that failed to match the prefix would
 * hide a real bug for as long as the site stayed quiet.
 */
if (counts.size === 0) {
  if (groups.length === 0) {
    console.log('The API returned no pageviews at all for this window.');
    console.log('Expected on a new site. Check the beacon is live:');
    console.log('  curl -s https://devtool.fyi | grep beacon');
    process.exit(0);
  }

  const sample = groups
    .slice(0, 10)
    .map((g) => `  ${String(g.count).padStart(6)}  ${g.dimensions?.requestPath}`)
    .join('\n');

  console.log(`The API returned ${groups.length} paths, but none started with ${PREFIX}.`);
  console.log('If any of these look like tool pages, the prefix or the slug');
  console.log('matching below it needs adjusting:');
  console.log(sample);
  process.exit(0);
}

const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
const top = ranked[0][1];

const snapshot = {
  generatedAt: new Date().toISOString(),
  window: `${WINDOW_DAYS}d`,
  basis,
  // Share only — see the note at the top of this file.
  entries: ranked.map(([id, count]) => ({
    id,
    share: Math.round((count / top) * 100) / 100,
  })),
};

const previous = readFileSync(OUT, 'utf8');
const next = `${JSON.stringify(snapshot, null, 2)}\n`;

// Compare ignoring the timestamp, so an unchanged ranking doesn't produce a
// commit every single day.
const stripStamp = (text) => text.replace(/"generatedAt":.*?,/, '');
if (stripStamp(previous) === stripStamp(next)) {
  console.log('Ranking unchanged. Nothing to commit.');
  process.exit(0);
}

writeFileSync(OUT, next);
console.log(`Wrote ${snapshot.entries.length} entries, ranked by ${basis}.`);
