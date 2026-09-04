/**
 * Typed access to the most-viewed snapshot.
 *
 * The JSON ships with an empty `entries` array, which TypeScript infers as
 * `never[]` — so the shape is declared here once rather than asserted at every
 * use. The file is written by scripts/fetch-popular.mjs on a daily cron; see
 * docs/analytics.md.
 */

import raw from '../data/popular.json';

export interface PopularEntry {
  id: string;
  /** Share of the most-viewed tool's total, 0–1. Never an absolute count. */
  share: number;
}

export interface PopularSnapshot {
  /** ISO timestamp, or null while no snapshot has been taken. */
  generatedAt: string | null;
  /** e.g. "30d". */
  window: string;
  /** What the ranking is based on: "views" or "clicks". */
  basis: string;
  /** Ranked, most first. Empty until there is real traffic. */
  entries: PopularEntry[];
}

export const popular = raw as PopularSnapshot;
