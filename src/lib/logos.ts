import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Tool } from '../data/tools';

/*
 * An explicit `logo` wins; otherwise we pick up whatever `npm run logos`
 * vendored. Resolved at build time against the project root — import.meta.url
 * points into the Vite output here, not at this source file.
 */
export function logoFor(tool: Tool): string | undefined {
  if (tool.logo) return tool.logo;
  for (const ext of ['svg', 'png']) {
    if (existsSync(join(process.cwd(), 'public', 'logos', `${tool.id}.${ext}`))) {
      return `/logos/${tool.id}.${ext}`;
    }
  }
  return undefined;
}
