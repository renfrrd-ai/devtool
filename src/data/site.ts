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

  /*
   * Cloudflare Web Analytics beacon token. Paste it here and commit — it is not
   * a secret: it appears in the HTML of every page and grants nothing. Leave it
   * empty and no analytics script is emitted at all.
   *
   * PUBLIC_CF_BEACON_TOKEN overrides this at build time if you would rather
   * measure production only. See docs/analytics.md.
   */
  analyticsToken: '',
  author: {
    name: 'Renfred Alonge',
    github: 'https://github.com/renfrrd-ai',
    email: 'hello@devtool.fyi',
  },
} as const;
