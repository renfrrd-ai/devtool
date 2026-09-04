/**
 * Every derived view of the directory lives here, so `tools.ts` stays a plain
 * list of facts and adding a tool never means editing a page.
 */

import { tools, type Tool, type ToolStatus } from '../data/tools';
import { categories, type Category } from '../data/categories';

/** Third-party entries — the directory proper. */
export const curated = tools.filter((tool) => !tool.madeHere);

/** Renfred's own tools, whatever their status. */
export const madeHere = tools.filter((tool) => tool.madeHere);

export function getTool(id: string): Tool | undefined {
  return tools.find((tool) => tool.id === id);
}

/**
 * Tools on a shelf. Alphabetical: any other order implies a ranking we have not
 * actually earned, and a directory that pretends to rank is worse than one that
 * does not.
 */
export function toolsInCategory(categoryId: string): Tool[] {
  return tools
    .filter((tool) => tool.categories.includes(categoryId))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function countInCategory(categoryId: string): number {
  return toolsInCategory(categoryId).length;
}

/** Primary category first — it decides where a tool page says the tool lives. */
export function primaryCategory(tool: Tool): Category | undefined {
  return categories.find((category) => category.id === tool.categories[0]);
}

export function categoriesOf(tool: Tool): Category[] {
  return tool.categories
    .map((id) => categories.find((category) => category.id === id))
    .filter((category): category is Category => Boolean(category));
}

/**
 * Named alternatives, falling back to others on the same shelf when an entry
 * has not listed any — a tool page with an empty comparison block is a dead end.
 */
export function alternativesFor(tool: Tool, limit = 3): Tool[] {
  const named = (tool.alternatives ?? [])
    .map(getTool)
    .filter((other): other is Tool => Boolean(other));

  if (named.length >= limit) return named.slice(0, limit);

  const sameShelf = toolsInCategory(tool.categories[0] ?? '').filter(
    (other) => other.id !== tool.id && !named.some((n) => n.id === other.id),
  );

  return [...named, ...sameShelf].slice(0, limit);
}

/** Ordering for the Built here section: usable things first, newest within a status. */
const STATUS_ORDER: Record<ToolStatus, number> = {
  live: 0,
  beta: 1,
  'coming-soon': 2,
  idea: 3,
};

export function sortedMadeHere(): Tool[] {
  return [...madeHere].sort((a, b) => {
    const byStatus =
      STATUS_ORDER[a.status ?? 'idea'] - STATUS_ORDER[b.status ?? 'idea'];
    return byStatus !== 0 ? byStatus : b.addedAt.localeCompare(a.addedAt);
  });
}

/** Categories that actually have something on them, with their counts. */
export function populatedCategories(): Array<Category & { count: number }> {
  return categories
    .map((category) => ({ ...category, count: countInCategory(category.id) }))
    .filter((category) => category.count > 0);
}

/** A few names to show on a category card, so the card says something concrete. */
export function sampleNames(categoryId: string, limit = 4): string[] {
  return toolsInCategory(categoryId)
    .slice(0, limit)
    .map((tool) => tool.name);
}

export const stats = {
  tools: tools.length,
  categories: populatedCategories().length,
  openSource: tools.filter((tool) => tool.openSource).length,
  madeHere: madeHere.length,
};
