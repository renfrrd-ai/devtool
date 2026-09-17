/**
 * The directory's shelves.
 *
 * Categories are a fixed, curated set — not a free-form tag cloud. Adding one is
 * a deliberate act: every category is a page that has to earn its place, and a
 * shelf with two tools on it looks broken. Six entries is roughly the floor.
 *
 * `id` is the URL slug: /categories/<id>.
 */

/**
 * The head-to-head table at the foot of a category page.
 *
 * The columns are deliberately category-specific: "Merchant of record" means
 * nothing outside payments, and "Scales to zero" means nothing outside
 * databases. That is the whole point — the rows above the table already carry
 * pricing, licence and stack, so a table repeating those would be filler. This
 * compares on the axis you actually decide along.
 *
 * `rows` is keyed by tool id, and the values are positional against `columns`.
 * A tool with no row is simply left out of the table; it still appears in the
 * list above.
 */
export interface Comparison {
  /** One line naming the axis the table compares on. */
  note: string;
  columns: string[];
  rows: Record<string, string[]>;
}

export interface Category {
  id: string;
  name: string;
  /** One line for the category card on the home page. */
  tagline: string;
  /** A short paragraph for the category page header. */
  description: string;
  comparison?: Comparison;
}

export const categories: Category[] = [
  {
    id: 'auth',
    name: 'Authentication',
    tagline: 'Sign-in, sessions, and knowing who someone is',
    description:
      'Auth is the classic build-versus-buy trap: the happy path takes an afternoon and the long tail — password resets, SSO, SCIM, session revocation, account recovery — takes years. These are the tools worth reaching for before you write your own.',
    comparison: {
      note: 'The decision is usually where the user table lives and what enterprise sign-in costs.',
      columns: ['Shape', 'Users live in', 'SSO & SCIM', 'Priced on'],
      rows: {
        auth0: ['Hosted service', 'Their store', 'Included', 'Monthly active users'],
        'better-auth': ['Library', 'Your database', 'Plugins', 'Free'],
        clerk: ['Hosted service', 'Their store', 'Paid tiers', 'Monthly active users'],
        keycloak: ['Server you run', 'Your database', 'Included', 'Free'],
        stytch: ['Hosted API', 'Their store', 'Included', 'Monthly active users'],
        workos: ['Hosted service', 'Their store', 'The core product', 'Per connection'],
      },
    },
  },
  {
    id: 'payments',
    name: 'Payments',
    tagline: 'Taking money, and the tax paperwork that follows',
    description:
      'The real split here is whether the provider is a merchant of record. If it is, it owns global sales tax and VAT registration on your behalf; if it is not, that work lands on you the moment you sell across a border.',
    comparison: {
      note: 'Merchant of record is the column that matters. Everything else follows from it.',
      columns: ['Merchant of record', 'Global tax', 'Checkout control', 'Best for'],
      rows: {
        adyen: ['No', 'Yours to file', 'Full', 'Enterprise and in-store volume'],
        'lemon-squeezy': ['Yes', 'Handled', 'Their checkout', 'Indie digital products'],
        mollie: ['No', 'Yours to file', 'Full', 'European payment methods'],
        paddle: ['Yes', 'Handled', 'Their checkout', 'SaaS selling worldwide'],
        polar: ['Yes', 'Handled', 'Their checkout', 'Open source and devtools'],
        stripe: ['No', 'Add-on, you still file', 'Full', 'Any model, at any scale'],
      },
    },
  },
  {
    id: 'email',
    name: 'Email & SMTP',
    tagline: 'Transactional sending, and getting past the spam folder',
    description:
      'Sending email is easy and being delivered is not. What separates these tools is deliverability reputation, how much of the DNS and authentication setup they handle for you, and whether marketing and transactional email live in one place or two.',
    comparison: {
      note: 'Who owns the sending infrastructure decides both the bill and the deliverability risk.',
      columns: ['Sends through', 'Marketing email', 'You operate it', 'Best for'],
      rows: {
        hqbase: ['Your Cloudflare account', 'No', 'Yes', 'Team mailboxes you own'],
        loops: ['Their infrastructure', 'Yes', 'No', 'Lifecycle and campaigns together'],
        plunk: ['Your AWS SES', 'Yes', 'Optional', 'SES rates without the wiring'],
        postmark: ['Their infrastructure', 'Separate product', 'No', 'Deliverability above all'],
        resend: ['Their infrastructure', 'Broadcasts', 'No', 'React-based templates'],
        sendgrid: ['Their infrastructure', 'Yes', 'No', 'High volume at scale'],
      },
    },
  },
  {
    id: 'ui',
    name: 'UI & Components',
    tagline: 'Component libraries, primitives, and styling systems',
    description:
      'The market has largely settled on unstyled, accessible primitives plus your own styling, rather than a themed component kit you fight with later. These are the primitives, the systems built on them, and the CSS layer underneath.',
    comparison: {
      note: 'These sit at different layers — read the first two columns together before comparing.',
      columns: ['Layer', 'Styling', 'Arrives as', 'Customising means'],
      rows: {
        'base-ui': ['Primitives', 'Unstyled', 'A dependency', 'Your own CSS'],
        'chakra-ui': ['Component kit', 'Styled', 'A dependency', 'Tokens and recipes'],
        mantine: ['Component kit', 'Styled', 'A dependency', 'Theme overrides'],
        'radix-ui': ['Primitives', 'Unstyled', 'A dependency', 'Your own CSS'],
        'shadcn-ui': ['Components', 'Tailwind', 'Source in your repo', 'Editing your own file'],
        tailwindcss: ['Styling', 'Utilities', 'A build step', 'Config and tokens'],
      },
    },
  },
  {
    id: 'database',
    name: 'Databases & ORMs',
    tagline: 'Storing things, and talking to what stores them',
    description:
      'Postgres won. What differs now is the operational shape around it — serverless or always-on, branching or not, how cold starts are handled — and which type-safe layer you use to query it.',
    comparison: {
      note: 'The last two entries are ORMs, not databases — they sit on top of the rest.',
      columns: ['Engine', 'Scales to zero', 'Branching', 'Notable for'],
      rows: {
        drizzle: ['Any SQL (ORM)', '—', '—', 'Thin, no runtime engine'],
        neon: ['PostgreSQL', 'Yes', 'Yes', 'A branch per pull request'],
        planetscale: ['MySQL, PostgreSQL', 'No', 'Yes', 'Non-blocking schema changes'],
        prisma: ['Any SQL (ORM)', '—', '—', 'Migrations and Studio'],
        supabase: ['PostgreSQL', 'Pauses on free tier', 'Yes', 'Auth, storage and realtime'],
        turso: ['SQLite (libSQL)', 'Yes', 'Yes', 'A database per tenant'],
      },
    },
  },
  {
    id: 'hosting',
    name: 'Hosting & Deploy',
    tagline: 'Getting it onto the internet and keeping it there',
    description:
      'Pick on the deployment model, not the marketing: whether you are shipping a container, a set of edge functions, or static files decides most of this, and the pricing surprises tend to live in bandwidth and always-on compute.',
    comparison: {
      note: 'What actually runs decides everything else — a container host and a function host are not substitutes.',
      columns: ['Runs', 'Where', 'Long-running processes', 'Free tier'],
      rows: {
        'cloudflare-workers': ['V8 isolates', '300+ cities', 'Durable Objects', 'Yes'],
        'fly-io': ['Containers', 'Regions you pick', 'Yes', 'No'],
        netlify: ['Static and functions', 'CDN edge', 'No', 'Yes'],
        railway: ['Containers', 'A few regions', 'Yes', 'Trial only'],
        render: ['Containers', 'A few regions', 'Yes', 'Yes, sleeps when idle'],
        vercel: ['Static and functions', 'CDN edge', 'No', 'Yes'],
      },
    },
  },
  {
    id: 'monitoring',
    name: 'Monitoring & Errors',
    tagline: 'Finding out it broke before your users tell you',
    description:
      'Error tracking, uptime checks, and logs are three different jobs that vendors increasingly sell as one. Worth knowing which of the three you actually have covered, because a green uptime dashboard says nothing about the exception your users are hitting.',
    comparison: {
      note: 'Check the first column against what you are actually missing — these overlap less than the marketing suggests.',
      columns: ['Covers', 'Self-host', 'Alerting', 'Notable for'],
      rows: {
        axiom: ['Logs, events', 'No', 'Monitors', 'Keeping everything, not sampling'],
        betterstack: ['Uptime, logs, on-call', 'No', 'Paging', 'Three jobs, one bill'],
        checkly: ['Uptime, browser flows', 'No', 'Paging', 'Playwright scripts as monitors'],
        clueline: ['Errors', 'No', 'Yes', 'Messages your users can read'],
        grafana: ['Metrics, logs, traces', 'Yes', 'Yes', 'The dashboard standard'],
        sentry: ['Errors, tracing', 'Yes', 'Yes', 'Stack trace to the commit'],
      },
    },
  },
  {
    id: 'analytics',
    name: 'Analytics',
    tagline: 'What people do, without the consent banner',
    description:
      'The privacy-first end of this category has become genuinely good, and cookie-free tools avoid the consent banner entirely. The trade is depth: if you need funnels, replays and feature flags, you are looking at a heavier product.',
    comparison: {
      note: 'Cookie-free is what removes the consent banner. Depth is what you trade for it.',
      columns: ['Cookie-free', 'Consent banner', 'Self-host', 'Depth'],
      rows: {
        'cloudflare-analytics': ['Yes', 'Not needed', 'No', 'Pageviews and referrers only'],
        fathom: ['Yes', 'Not needed', 'No', 'Pageviews, referrers, goals'],
        matomo: ['Configurable', 'Usually needed', 'Yes', 'Funnels, goals, heatmaps'],
        plausible: ['Yes', 'Not needed', 'Yes', 'Pageviews, referrers, goals'],
        posthog: ['Configurable', 'Usually needed', 'Yes', 'Funnels, replays, flags'],
        umami: ['Yes', 'Not needed', 'Yes', 'Pageviews and custom events'],
      },
    },
  },
  {
    id: 'ai',
    name: 'AI & LLMs',
    tagline: 'Model APIs, SDKs, and running things locally',
    description:
      'Three distinct layers get lumped together here: the model providers themselves, the SDKs that give you one interface across them, and the runtimes for running open models on your own hardware.',
    comparison: {
      note: 'Read the Layer column first — a provider, a router, an SDK and a local runtime are complements, not rivals.',
      columns: ['Layer', 'Inference runs', 'Billing', 'Locks you to'],
      rows: {
        'claude-api': ['Model provider', 'Hosted', 'Per token', 'One provider'],
        ollama: ['Local runtime', 'Your machine', 'Free', 'Nothing'],
        openai: ['Model provider', 'Hosted', 'Per token', 'One provider'],
        openrouter: ['Router', 'Hosted', 'Per token, plus margin', 'One gateway'],
        replicate: ['Model host', 'Hosted', 'Per second of compute', 'One host'],
        'vercel-ai-sdk': ['SDK', 'Whichever you point it at', 'Free', 'Nothing'],
      },
    },
  },
];

export const categoryIds = categories.map((category) => category.id);

export type CategoryId = (typeof categories)[number]['id'];

export function getCategory(id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}
