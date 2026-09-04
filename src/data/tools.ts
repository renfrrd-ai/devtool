/**
 * The source of truth for everything on this page.
 *
 * Adding a tool is one entry here plus (optionally) a logo in public/logos/.
 * The schema and the full walkthrough live in docs/content-model.md.
 */

export type ToolStatus = 'live' | 'beta' | 'coming-soon' | 'idea';

export interface Tool {
  /** Stable identifier. Lowercase, no spaces. Used as the anchor and the logo filename. */
  id: string;

  /** Display name, cased the way the tool brands itself. */
  name: string;

  /** Canonical URL, including protocol. */
  url: string;

  /** Domain as shown on the card, without protocol — e.g. "clueline.dev". */
  domain: string;

  /**
   * One line: what it does and who it's for. Under ~100 characters so it fits on
   * two lines on mobile. No trailing period.
   */
  tagline: string;

  /** Drives the badge and the display ordering. */
  status: ToolStatus;

  /** Path under public/, e.g. "/logos/clueline.svg". Omit to fall back to a monogram. */
  logo?: string;

  /** ISO date the entry was added. Breaks ties in the ordering. */
  addedAt: string;
}

export const tools: Tool[] = [
  {
    id: 'clueline',
    name: 'Clueline',
    url: 'https://clueline.dev',
    domain: 'clueline.dev',
    tagline: 'The error tool that talks to your users — turns raw failures into messages people understand',
    status: 'live',
    addedAt: '2026-09-04',
  },
  {
    id: 'hqbase',
    name: 'HQBase',
    url: 'https://hqbase.io',
    domain: 'hqbase.io',
    tagline: "Your team's email on your own Cloudflare infrastructure — shared mailboxes, unlimited seats, open source",
    status: 'live',
    addedAt: '2026-09-04',
  },
  {
    id: 'trueluk',
    name: 'trueluk',
    url: 'https://trueluk.com',
    domain: 'trueluk.com',
    tagline: 'An early idea, still taking shape. Nothing to use yet',
    status: 'idea',
    addedAt: '2026-09-04',
  },
];

/** Display order: usable things first, newest first within a status. */
const STATUS_ORDER: Record<ToolStatus, number> = {
  live: 0,
  beta: 1,
  'coming-soon': 2,
  idea: 3,
};

export function sortedTools(list: Tool[] = tools): Tool[] {
  return [...list].sort((a, b) => {
    const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    return byStatus !== 0 ? byStatus : b.addedAt.localeCompare(a.addedAt);
  });
}

export function countByStatus(status: ToolStatus, list: Tool[] = tools): number {
  return list.filter((tool) => tool.status === status).length;
}
