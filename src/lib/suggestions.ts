/**
 * Typed access to the reader-suggestion snapshot.
 *
 * Deliberately separate from src/lib/directory.ts, and that separation is the
 * whole safety mechanism rather than a filing preference. Nothing here is a
 * `Tool`, so a suggestion cannot reach `toolsInCategory()`, the category counts,
 * the hero statistics, the comparison tables, the sitemap, the structured data
 * or `getStaticPaths` — not because each of those remembers to exclude it, but
 * because it never enters the type they all read from.
 *
 * The file is written by scripts/fetch-suggestions.mjs on a daily cron, the same
 * shape as the most-viewed snapshot. See docs/suggestions.md.
 */

import raw from '../data/suggestions.json';
import { flaggedSuggestions } from './flags';

export interface Suggestion {
  /** Slug derived from the name. Only ever used as a React-ish key and an anchor. */
  id: string;
  name: string;
  url: string;
  /** Shown on the row, without protocol. */
  domain: string;
  tagline: string;
  /** A single category id — suggestions sit on one shelf until reviewed. */
  category: string;
  pricing: string;
  licence?: string;
  stack?: string[];
  /** 👍 reactions on the issue. */
  votes: number;
  /** The issue number, so a reader can go and vote or argue. */
  issue: number;
  /** The submitter ticked "I work on this tool". Surfaced, not filtered. */
  affiliated?: boolean;
}

export interface SuggestionSnapshot {
  /** ISO timestamp, or null while no snapshot has been taken. */
  generatedAt: string | null;
  /** Votes needed before an entry renders on the site at all. */
  threshold: number;
  /** Ranked, most-voted first. Includes entries below the threshold. */
  entries: Suggestion[];
}

export const suggestions = raw as SuggestionSnapshot;

/**
 * Suggestions for one shelf, most-voted first, above the threshold only.
 *
 * The threshold is what stops a vendor self-submitting straight onto a shelf:
 * below it the suggestion is real and visible, but only in the issue tracker,
 * where the affiliation disclosure sits next to it. It has to persuade somebody
 * other than its author before it takes up space on the site.
 */
export function suggestionsForCategory(categoryId: string): Suggestion[] {
  return suggestions.entries
    .filter((entry) => entry.category === categoryId)
    .filter((entry) => entry.votes >= suggestions.threshold)
    /* Reported often enough to be worth a look — withheld until it gets one. */
    .filter((entry) => !flaggedSuggestions.has(entry.id))
    .sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name));
}
