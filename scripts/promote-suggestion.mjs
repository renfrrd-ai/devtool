/**
 * Turns an accepted suggestion into a real entry in src/data/tools.ts.
 *
 * Run by .github/workflows/promote-suggestion.yml when an issue is labelled
 * `accepted`. Usage: node scripts/promote-suggestion.mjs <issue-number>
 *
 * WHAT THIS DELIBERATELY DOES NOT DO: write the description. The submitter's
 * facts — name, url, category, pricing, licence, stack — are mechanical and get
 * copied across. The "where's the catch" paragraph is the only reason a tool
 * page exists on this site, it is written in one editorial voice, and a
 * submitted one is almost always marketing copy. So the entry lands with a TODO
 * that scripts/check-entries.mjs fails the build on, on a branch, in a pull
 * request. Writing that paragraph is how the PR gets merged.
 *
 * Environment:
 *   GITHUB_TOKEN, GITHUB_REPOSITORY  as for fetch-suggestions.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { tools } from '../src/data/tools.ts';
import { categories } from '../src/data/categories.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const TOOLS = join(root, 'src', 'data', 'tools.ts');

const { GITHUB_TOKEN, GITHUB_REPOSITORY } = process.env;
const issueNumber = process.argv[2];

if (!GITHUB_TOKEN || !GITHUB_REPOSITORY || !issueNumber) {
  console.error('Usage: GITHUB_TOKEN=… node scripts/promote-suggestion.mjs <issue-number>');
  process.exit(1);
}

const res = await fetch(
  `https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${issueNumber}`,
  {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  },
);

if (!res.ok) {
  console.error(`GitHub API returned ${res.status} for issue #${issueNumber}.`);
  process.exit(1);
}

const issue = await res.json();

/* ------------------------------------------------------------------ parsing */

// Same format contract as fetch-suggestions.mjs — see the note there.
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

const fields = parseForm(issue.body);

const name = fields.get('Tool name');
const url = fields.get('URL');
const categoryName = fields.get('Category');
const tagline = fields.get('Tagline');
const pricing = (fields.get('Pricing') ?? '').split(/[\s—-]/)[0].trim().toLowerCase();

if (!name || !url || !categoryName || !tagline || !pricing) {
  console.error(`Issue #${issueNumber} is missing a required field. Not a suggestion form?`);
  process.exit(1);
}

const category = categories.find((entry) => entry.name === categoryName);
if (!category) {
  console.error(`Category "${categoryName}" is not a shelf.`);
  process.exit(1);
}

const id = name
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

if (tools.some((tool) => tool.id === id)) {
  console.error(`${id} is already in tools.ts. Nothing to promote.`);
  process.exit(1);
}

const domain = new URL(url).hostname.replace(/^www\./, '');
const licence = fields.get('Open source licence') || '';
const stack = (fields.get('Stack') ?? '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean)
  .slice(0, 4);

/* ---------------------------------------------------------------- rendering */

const quote = (value) => (value.includes("'") ? `"${value}"` : `'${value}'`);
const list = (items) => `[${items.map(quote).join(', ')}]`;

// The submitter's notes are carried into the PR as a comment, not as the
// description — they are raw material for the paragraph, not the paragraph.
const notes = (fields.get('Where is the catch?') ?? '')
  .split('\n')
  .filter(Boolean)
  .map((line) => `    //   ${line}`)
  .join('\n');

const entry = [
  '  {',
  `    id: ${quote(id)},`,
  `    name: ${quote(name)},`,
  `    url: ${quote(url)},`,
  `    domain: ${quote(domain)},`,
  `    tagline: ${quote(tagline)},`,
  `    // TODO: write the description before merging — two or three sentences saying`,
  `    //       where the catch is. Suggested in #${issueNumber}; the submitter's notes:`,
  notes || '    //   (none given)',
  `    description: 'TODO',`,
  `    categories: [${quote(category.id)}],`,
  `    pricing: ${quote(pricing)},`,
  ...(licence ? ['    openSource: true,', `    licence: ${quote(licence)},`] : []),
  ...(stack.length ? [`    stack: ${list(stack)},`] : []),
  `    addedAt: '${new Date().toISOString().slice(0, 10)}',`,
  '  },',
].join('\n');

/* ------------------------------------------------------------------ writing */

const source = readFileSync(TOOLS, 'utf8');

/*
 * tools.ts is grouped by shelf under `// ---- <category id>` banners, and an
 * entry appended to the wrong group still renders correctly — toolsInCategory()
 * sorts by name and ignores file order entirely. The grouping is for whoever
 * opens the file next, which is reason enough to get it right.
 */
const banner = new RegExp(`^  // -+ ${category.id}$`, 'm');
const match = banner.exec(source);

let updated;

if (match) {
  // End of this section: the next banner, or the array's closing bracket.
  const after = source.slice(match.index + match[0].length);
  const nextBanner = after.search(/^  \/\/ -+ /m);
  const end = nextBanner === -1 ? source.length : match.index + match[0].length + nextBanner;

  const head = source.slice(0, end).replace(/\s+$/, '');
  updated = `${head}\n${entry}\n\n${source.slice(end)}`;
} else {
  console.warn(`No "${category.id}" banner in tools.ts — appending to the end of the array.`);
  updated = source.replace(/\n\];\s*$/, `\n${entry}\n];\n`);
}

writeFileSync(TOOLS, updated);

console.log(`Added ${name} (${id}) to the ${category.name} shelf.`);
console.log('The description is a TODO — the build will fail until it is written.');
