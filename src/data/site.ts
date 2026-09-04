/**
 * Site-level constants. Kept apart from tools.ts so the tool list stays the one
 * file anyone edits when adding a tool.
 */

export const SITE = {
  name: 'devtool.fyi',
  domain: 'devtool.fyi',
  url: 'https://devtool.fyi',
  title: 'devtool.fyi — A curated directory of developer tools',
  description:
    'Hand-picked developer tools by category — auth, payments, email, UI, databases, hosting, monitoring, analytics and AI. What each one is for, what it runs on, and what it costs.',
  imageAlt: 'devtool.fyi — a curated directory of developer tools, by category.',
  author: {
    name: 'Renfred Alonge',
    github: 'https://github.com/renfrrd-ai',
    email: 'hello@devtool.fyi',
  },
} as const;
