/**
 * Refreshes src/data/suggestions.json from open GitHub issues.
 *
 * Run by .github/workflows/refresh-suggestions.yml on a daily cron. Never run
 * during `astro build` — same rule as the most-viewed snapshot: the build stays
 * hermetic, so a GitHub outage can never fail a deploy, and yesterday's
 * committed snapshot simply stands.
 *
 * GitHub is the database. Issues hold the submissions, 👍 reactions are the
 * votes, and labels are the moderation state. That is the entire reason this
 * feature needs no backend, no write endpoint and no client-side JavaScript —
 * see docs/suggestions.md for what was rejected and why.
 *
 * Environment:
 *   GITHUB_TOKEN  the workflow's own token is enough; it only reads issues
 *   GITHUB_REPOSITORY  owner/name, set automatically by Actions
 */

import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { tools } from '../src/data/tools.ts';
import { NEW_CATEGORY_OPTION, shelfForSuggestion } from '../src/data/categories.ts';

const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'data',
  'suggestions.json',
);

const { GITHUB_TOKEN, GITHUB_REPOSITORY } = process.env;
const LABEL = 'tool-suggestion';

/*
 * Votes needed before an entry renders on the site. Low enough to be reachable
 * on a site with modest traffic, high enough that submitting your own product
 * and clicking 👍 once does not buy you a place on a shelf.
 */
const THRESHOLD = 3;

if (!GITHUB_TOKEN || !GITHUB_REPOSITORY) {
  console.error('Missing GITHUB_TOKEN or GITHUB_REPOSITORY — see docs/suggestions.md');
  process.exit(1);
}

/* ------------------------------------------------------------------ parsing */

/**
 * GitHub renders an issue form as `### Label` followed by the value. Unfilled
 * optional fields come through as the literal `_No response_`.
 *
 * This is a text format produced by a form definition in another file, so the
 * two can drift. Every lookup below is by the exact label in
 * .github/ISSUE_TEMPLATE/suggest-tool.yml, and a miss on a required field skips
 * the issue loudly rather than writing a half-built entry to the site.
 */
function parseForm(body) {
  const fields = new Map();

  for (const chunk of (body ?? '').split(/^### /m).slice(1)) {
    const newline = chunk.indexOf('\n');
    if (newline === -1) continue;

    const label = chunk.slice(0, newline).trim();
    const value = chunk.slice(newline + 1).trim();

    fields.set(label, value === '_No response_' ? '' : value);
  }

  return fields;
}

/** `free — no cost for normal use` is what the dropdown stores; we want `free`. */
const firstWord = (value) => value.split(/[\s—-]/)[0].trim().toLowerCase();

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/* --------------------------------------------------------------------- fetch */

const res = await fetch(
  `https://api.github.com/repos/${GITHUB_REPOSITORY}/issues` +
    `?labels=${LABEL}&state=open&per_page=100`,
  {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  },
);

if (!res.ok) {
  console.error(`GitHub API returned ${res.status}. Keeping the existing snapshot.`);
  process.exit(1);
}

const issues = await res.json();

/* ------------------------------------------------------------------ mapping */

// A suggestion for something already listed is noise on the shelf, so it is
// dropped here. Matching on domain as well as slug catches "Checkly" suggested
// against an existing `checkly`, and also "Checkly HQ" pointing at the same site.
const listedIds = new Set(tools.map((tool) => tool.id));
const listedDomains = new Set(tools.map((tool) => tool.domain.replace(/^www\./, '')));

const entries = [];
const skipped = [];

for (const issue of issues) {
  // The issues endpoint returns pull requests too.
  if (issue.pull_request) continue;

  const skip = (why) => skipped.push(`#${issue.number} — ${why}`);
  const fields = parseForm(issue.body);

  const name = fields.get('Tool name');
  const url = fields.get('URL');
  const categoryName = fields.get('Category');
  const tagline = fields.get('Tagline');
  const pricing = fields.get('Pricing');

  if (!name || !url || !categoryName || !tagline || !pricing) {
    skip('a required field is missing — the form labels may have drifted');
    continue;
  }

  const proposed = fields.get('New category') ?? '';
  const category = shelfForSuggestion(categoryName, proposed)?.id;
  if (!category) {
    // Not a failure: a tool asking for a shelf that does not exist yet stays in
    // the tracker, and is picked up on the first run after the shelf is added.
    skip(
      categoryName !== NEW_CATEGORY_OPTION
        ? `category "${categoryName}" is not a shelf`
        : proposed
          ? `waiting for a "${proposed}" shelf`
          : 'asks for a new category without naming one',
    );
    continue;
  }

  const domain = hostOf(url);
  if (!domain) {
    skip(`"${url}" is not a URL`);
    continue;
  }

  const id = slugify(name);
  if (listedIds.has(id) || listedDomains.has(domain)) {
    skip(`${name} is already in the directory`);
    continue;
  }

  const stack = (fields.get('Stack') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);

  const licence = fields.get('Open source licence') || undefined;

  /*
   * The disclosure checkbox is surfaced on the site rather than used to filter.
   * A maker submitting their own tool is a perfectly good source — they know it
   * best — and the honest move is to say so next to the entry and let the
   * reader weigh it, not to quietly drop it and pretend the shelf is neutral.
   */
  const disclosure = fields.get('Disclosure') ?? '';
  const affiliated = /- \[x\] I work on this tool/i.test(disclosure);

  entries.push({
    id,
    name,
    url,
    domain,
    tagline,
    category,
    pricing: firstWord(pricing),
    ...(licence ? { licence } : {}),
    ...(stack.length ? { stack } : {}),
    votes: issue.reactions?.['+1'] ?? 0,
    issue: issue.number,
    ...(affiliated ? { affiliated: true } : {}),
  });
}

entries.sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name));

/* ------------------------------------------------------------------- report */

if (skipped.length > 0) {
  console.log(`Skipped ${skipped.length} issue(s):`);
  console.log(skipped.map((line) => `  ${line}`).join('\n'));
}

if (issues.length === 0) {
  console.log(`No open issues labelled "${LABEL}". Expected until people start suggesting.`);
} else {
  const visible = entries.filter((entry) => entry.votes >= THRESHOLD).length;
  console.log(
    `${entries.length} suggestion(s) parsed, ${visible} at or above ${THRESHOLD} votes ` +
      `and therefore visible on the site.`,
  );
}

/* -------------------------------------------------------------------- write */

const snapshot = {
  generatedAt: new Date().toISOString(),
  threshold: THRESHOLD,
  entries,
};

const previous = readFileSync(OUT, 'utf8');
const next = `${JSON.stringify(snapshot, null, 2)}\n`;

// Compare ignoring the timestamp, so an unchanged list doesn't produce a commit
// every single day.
const stripStamp = (text) => text.replace(/"generatedAt":.*?,/, '');
if (stripStamp(previous) === stripStamp(next)) {
  console.log('Suggestions unchanged. Nothing to commit.');
  process.exit(0);
}

writeFileSync(OUT, next);
console.log(`Wrote ${entries.length} suggestion(s).`);
