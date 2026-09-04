/**
 * Site-level constants. Kept apart from tools.ts so the tool list stays the one
 * file anyone edits when adding a tool.
 */

export const SITE = {
  name: 'devtool.fyi',
  domain: 'devtool.fyi',
  url: 'https://devtool.fyi',
  title: 'devtool.fyi — Developer tools by Renfred Alonge',
  description:
    'A directory of the developer tools built and maintained by Renfred Alonge — Clueline, HQBase, and whatever comes next.',
  imageAlt:
    'devtool.fyi — Small tools, built to last. Developer tools by Renfred Alonge.',
  author: {
    name: 'Renfred Alonge',
    github: 'https://github.com/renfrrd-ai',
    email: 'hello@devtool.fyi',
  },
} as const;
