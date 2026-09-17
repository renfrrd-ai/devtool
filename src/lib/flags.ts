/**
 * Entries that reports have pushed over the review threshold.
 *
 * WHAT IS NOT IN THIS FILE, DELIBERATELY: report counts and view counts. The
 * ratio is computed inside the Action, where the raw analytics numbers already
 * live, and only the verdict is committed. That keeps
 * [D19](../../docs/decisions.md) intact — this repository is public, and a file
 * saying "stripe: 14 reports of 9,000 views" would publish both the site's
 * traffic figures and an unreviewed accusation about a named company.
 *
 * Written by scripts/fetch-reports.mjs on a daily cron. See docs/reports.md.
 */

import raw from '../data/flags.json';

export interface Flag {
  id: string;
  /** 'tool' for a curated entry, 'suggestion' for an unreviewed one. */
  kind: 'tool' | 'suggestion';
  /** Distinct reasons given, most common first. No counts. */
  reasons: string[];
}

export interface FlagSnapshot {
  /** ISO timestamp, or null while no snapshot has been taken. */
  generatedAt: string | null;
  flagged: Flag[];
}

export const flags = raw as FlagSnapshot;

/*
 * Flagged suggestions are withheld from the shelf until somebody has looked.
 *
 * This is the one place a report changes what a reader sees, and it is not a
 * flag being displayed — the entry simply is not shown. A suggestion was never
 * vouched for by anyone here, so declining to keep showing one that readers
 * have objected to costs nothing and protects the ungated surface. A curated
 * entry is the opposite case: somebody reviewed it, so it stays exactly as it
 * is and the report goes to a human instead.
 */
export const flaggedSuggestions = new Set(
  flags.flagged.filter((flag) => flag.kind === 'suggestion').map((flag) => flag.id),
);
