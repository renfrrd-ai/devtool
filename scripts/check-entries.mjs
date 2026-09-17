/**
 * Editorial guard, run as the first step of `npm run build`.
 *
 * `astro check` proves the entries typecheck. It cannot prove anybody wrote
 * them. This catches the handful of ways an entry can be structurally perfect
 * and still not fit to publish — most importantly the TODO description that
 * scripts/promote-suggestion.mjs leaves behind on purpose, so an accepted
 * suggestion physically cannot reach the live site until someone has written
 * down where its catch is.
 *
 * Failing the build is the point. The failure happens on the promotion PR,
 * never on main, because promotion opens a branch rather than pushing.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { tools } from '../src/data/tools.ts';
import { categories } from '../src/data/categories.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FORM = join(root, '.github', 'ISSUE_TEMPLATE', 'suggest-tool.yml');

const TAGLINE_MAX = 95;

const problems = [];
const known = new Set(tools.map((tool) => tool.id));
const shelves = new Set(categories.map((category) => category.id));

for (const tool of tools) {
  const at = `${tool.id} (${tool.name})`;

  // The one that matters: a promoted suggestion nobody has written up yet.
  if (/^TODO\b/.test(tool.description.trim())) {
    problems.push(
      `${at}: description is still a TODO.\n` +
        `    Two or three sentences saying where the catch is — the trade-off, who it\n` +
        `    is genuinely not for. See docs/content-model.md#writing-the-copy.`,
    );
  } else if (tool.description.trim().length < 80) {
    problems.push(`${at}: description is too short to be saying anything useful.`);
  }

  if (tool.tagline.length > TAGLINE_MAX) {
    problems.push(
      `${at}: tagline is ${tool.tagline.length} characters, over the ${TAGLINE_MAX} limit.`,
    );
  }

  if (tool.tagline.endsWith('.')) {
    problems.push(`${at}: tagline has a trailing full stop.`);
  }

  for (const category of tool.categories) {
    if (!shelves.has(category)) {
      problems.push(`${at}: "${category}" is not a category.`);
    }
  }

  // A dangling alternative renders as nothing, so it fails silently otherwise.
  for (const alternative of tool.alternatives ?? []) {
    if (!known.has(alternative)) {
      problems.push(`${at}: alternative "${alternative}" is not a listed tool.`);
    }
  }

  if (tool.licence && !tool.openSource) {
    problems.push(`${at}: has a licence but is not marked openSource.`);
  }

  if (tool.status && !tool.madeHere) {
    problems.push(`${at}: status is only for tools built here.`);
  }
}

// Comparison rows are keyed by tool id; a typo drops the row silently.
for (const category of categories) {
  for (const id of Object.keys(category.comparison?.rows ?? {})) {
    if (!known.has(id)) {
      problems.push(`${category.name} comparison: "${id}" is not a listed tool.`);
    }
  }
}

/*
 * The suggestion form's category dropdown is a hand-written copy of the shelf
 * names, and the scripts map a submission onto a shelf by matching that string
 * exactly. Drift between the two is silent and nasty: the form keeps accepting
 * submissions, and every one of them is discarded on the next cron run with a
 * line in a log nobody reads. So it is checked here instead.
 */
try {
  const form = readFileSync(FORM, 'utf8');
  const block = form.match(/^ {4}id: category$[\s\S]*?^ {6}options:$\n((?:^ {8}- .*$\n)+)/m);

  if (!block) {
    problems.push(
      'suggest-tool.yml: could not find the category dropdown options.\n' +
        '    The form was restructured — update this check with it.',
    );
  } else {
    const offered = block[1]
      .split('\n')
      .map((line) => line.replace(/^ {8}- /, '').trim())
      .filter(Boolean);

    const names = categories.map((category) => category.name);

    for (const option of offered) {
      if (!names.includes(option)) {
        problems.push(
          `suggest-tool.yml: offers "${option}", which is not a category name.\n` +
            '    Submissions choosing it are silently discarded by fetch-suggestions.mjs.',
        );
      }
    }

    for (const name of names) {
      if (!offered.includes(name)) {
        problems.push(`suggest-tool.yml: the ${name} shelf is missing from the dropdown.`);
      }
    }
  }
} catch (error) {
  problems.push(`suggest-tool.yml could not be read: ${error.message}`);
}

if (problems.length > 0) {
  console.error(`\n${problems.length} entry problem(s):\n`);
  console.error(problems.map((problem) => `  ✗ ${problem}`).join('\n\n'));
  console.error('');
  process.exit(1);
}

console.log(`Entries look publishable: ${tools.length} tools across ${categories.length} shelves.`);
