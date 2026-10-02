/**
 * How a query matches a tool. Shared by the search page and the header's
 * suggestions, so the two never disagree about what "matches" means. Runs in the
 * browser: no imports, nothing from the data files.
 */

export interface Searchable {
  /** Decides the order. Any casing. */
  name: string;
  /** Lowercased search text, from `searchText()` in lib/directory.ts. */
  text: string;
}

export function terms(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * Every term has to appear somewhere in the text. Names that start with the query
 * come first, then names that contain it, then everything else — so typing a
 * tool's name finds that tool before the entries that merely mention it. Within
 * each group the incoming (alphabetical) order is kept: this sorts by how the
 * query matched, not by which tool is better.
 */
export function match<T extends Searchable>(items: T[], query: string): T[] {
  const wanted = terms(query);
  if (wanted.length === 0) return [];

  const phrase = wanted.join(' ');
  const tier = (item: T) => {
    const name = item.name.toLowerCase();
    return name.startsWith(phrase) ? 0 : name.includes(phrase) ? 1 : 2;
  };

  return items
    .filter((item) => wanted.every((term) => item.text.includes(term)))
    .map((item, index) => ({ item, index, tier: tier(item) }))
    .sort((a, b) => a.tier - b.tier || a.index - b.index)
    .map(({ item }) => item);
}
