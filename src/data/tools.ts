/**
 * Every tool in the directory. The one file you edit to add an entry.
 *
 * Schema and the add-a-tool walkthrough: docs/content-model.md
 * Helpers that group, sort and count these: src/lib/directory.ts
 *
 * House rules for entries:
 *   - `tagline` is one line, under ~95 characters, no trailing period. It has to
 *     survive being read against five others on the same page.
 *   - `description` is two or three sentences and says something a tagline
 *     cannot — the trade-off, the catch, who it is actually for. If it just
 *     restates the tagline at greater length, cut it.
 *   - `stack` is what the tool runs on or is built with, not its feature list.
 */

export type Pricing = 'free' | 'freemium' | 'paid';

/** Only meaningful for `madeHere` tools — third-party entries are all shipping. */
export type ToolStatus = 'live' | 'beta' | 'coming-soon' | 'idea';

export interface Tool {
  /** URL slug: /tools/<id>. Lowercase, no spaces. Also the logo filename. */
  id: string;
  name: string;
  url: string;
  /** Shown on the row, without protocol. */
  domain: string;
  tagline: string;
  description: string;
  /** Primary category first — it decides where the tool page says it lives. */
  categories: string[];
  pricing: Pricing;
  openSource?: boolean;
  /** SPDX-ish identifier. Only when `openSource`. */
  licence?: string;
  /** What it runs on or is built with. Three or four at most. */
  stack?: string[];
  /** Other entries in this directory worth comparing against. Tool ids. */
  alternatives?: string[];
  /** Built and maintained by Renfred — surfaces it in the Built here section. */
  madeHere?: boolean;
  /** Only set for `madeHere` tools. */
  status?: ToolStatus;
  /** Path under public/. Usually omitted; `npm run logos` fills this in. */
  logo?: string;
  addedAt: string;
}

export const tools: Tool[] = [
  // ---------------------------------------------------------------- built here

  {
    id: 'clueline',
    name: 'Clueline',
    url: 'https://clueline.dev',
    domain: 'clueline.dev',
    tagline: 'The error tool that talks to your users, not just your dashboard',
    description:
      'Most error tracking points inward: it tells your team what broke. Clueline also handles the outward half — turning a raw failure into something the person who hit it can actually read and act on.',
    categories: ['monitoring'],
    pricing: 'freemium',
    stack: ['Web'],
    alternatives: ['sentry', 'betterstack'],
    madeHere: true,
    status: 'live',
    addedAt: '2026-09-04',
  },
  {
    id: 'trueluk',
    name: 'trueluk',
    url: 'https://trueluk.com',
    domain: 'trueluk.com',
    tagline: 'An early idea, still taking shape',
    description:
      'A domain and a direction, nothing built yet. Listed here so it is not a secret, not because there is anything to try.',
    categories: [],
    pricing: 'free',
    madeHere: true,
    status: 'idea',
    addedAt: '2026-09-04',
  },

  // -------------------------------------------------------------------- auth

  {
    id: 'clerk',
    name: 'Clerk',
    url: 'https://clerk.com',
    domain: 'clerk.com',
    tagline: 'Drop-in auth UI and user management for React and Next.js',
    description:
      'Ships pre-built sign-in, sign-up and profile components that look finished out of the box, which is most of why teams pick it. The trade is that you are adopting their UI and their hosted user store, and pricing scales with monthly active users.',
    categories: ['auth'],
    pricing: 'freemium',
    stack: ['React', 'Next.js', 'Hosted'],
    alternatives: ['auth0', 'better-auth', 'workos', 'stytch'],
    addedAt: '2026-09-04',
  },
  {
    id: 'better-auth',
    name: 'Better Auth',
    url: 'https://www.better-auth.com',
    domain: 'better-auth.com',
    tagline: 'Framework-agnostic authentication for TypeScript, running in your own app',
    description:
      'A library rather than a service: sessions and users live in your database and there is no per-user bill. Plugins cover the parts people usually leave a library for — 2FA, organisations, passkeys. You own the operational side, including the security patches.',
    categories: ['auth'],
    pricing: 'free',
    openSource: true,
    licence: 'MIT',
    stack: ['TypeScript', 'Self-hosted'],
    alternatives: ['clerk', 'keycloak', 'supabase'],
    addedAt: '2026-09-04',
  },
  {
    id: 'workos',
    name: 'WorkOS',
    url: 'https://workos.com',
    domain: 'workos.com',
    tagline: 'The enterprise checklist — SSO, SCIM directory sync, and audit logs',
    description:
      'Aimed squarely at the moment a deal stalls because the buyer wants SAML and user provisioning. Less about your consumer sign-in flow than about the compliance features enterprise procurement asks for, priced accordingly.',
    categories: ['auth'],
    pricing: 'freemium',
    stack: ['Hosted', 'SAML', 'SCIM'],
    alternatives: ['auth0', 'clerk', 'keycloak'],
    addedAt: '2026-09-04',
  },
  {
    id: 'auth0',
    name: 'Auth0',
    url: 'https://auth0.com',
    domain: 'auth0.com',
    tagline: 'Long-established identity platform, now part of Okta',
    description:
      'The incumbent, and still the most complete answer for complex identity requirements — custom rules, many providers, enterprise federation. Reputation for cost climbing sharply as you grow, so check the tier boundaries before committing.',
    categories: ['auth'],
    pricing: 'freemium',
    stack: ['Hosted', 'OIDC', 'SAML'],
    alternatives: ['clerk', 'workos', 'keycloak'],
    addedAt: '2026-09-04',
  },
  {
    id: 'stytch',
    name: 'Stytch',
    url: 'https://stytch.com',
    domain: 'stytch.com',
    tagline: 'Passwordless auth APIs with fraud and bot detection built in',
    description:
      'API-first rather than component-first, so you build the UI and it handles magic links, passkeys, OTP and device fingerprinting. The fraud-prevention side is the real differentiator against the other hosted options.',
    categories: ['auth'],
    pricing: 'freemium',
    stack: ['Hosted', 'Passkeys'],
    alternatives: ['clerk', 'auth0'],
    addedAt: '2026-09-04',
  },
  {
    id: 'keycloak',
    name: 'Keycloak',
    url: 'https://www.keycloak.org',
    domain: 'keycloak.org',
    tagline: 'Open-source identity and access management you run yourself',
    description:
      'A full IAM server backed by Red Hat, covering OIDC, SAML, federation and fine-grained authorisation. Genuinely free and genuinely heavy — this is a Java service you operate, not a library you import.',
    categories: ['auth'],
    pricing: 'free',
    openSource: true,
    licence: 'Apache-2.0',
    stack: ['Java', 'Self-hosted', 'OIDC'],
    alternatives: ['auth0', 'better-auth', 'workos'],
    addedAt: '2026-09-04',
  },

  // ---------------------------------------------------------------- payments

  {
    id: 'stripe',
    name: 'Stripe',
    url: 'https://stripe.com',
    domain: 'stripe.com',
    tagline: 'The default payments API, with the documentation everyone else is judged against',
    description:
      'Broadest coverage of payment methods, subscriptions and payouts, and the SDKs are excellent. Not a merchant of record, so cross-border sales tax and VAT registration remain your problem unless you add Stripe Tax and still file yourself.',
    categories: ['payments'],
    pricing: 'paid',
    stack: ['Hosted', 'REST', 'Webhooks'],
    alternatives: ['paddle', 'lemon-squeezy', 'polar'],
    addedAt: '2026-09-04',
  },
  {
    id: 'paddle',
    name: 'Paddle',
    url: 'https://www.paddle.com',
    domain: 'paddle.com',
    tagline: 'Merchant of record for software — it owns the global tax problem',
    description:
      'Paddle is the seller of record, which means it registers for and remits sales tax and VAT worldwide instead of you. You pay a higher percentage than a raw processor and accept less control over checkout; for a small team selling internationally that is usually the right trade.',
    categories: ['payments'],
    pricing: 'paid',
    stack: ['Hosted', 'Merchant of record'],
    alternatives: ['lemon-squeezy', 'stripe', 'polar'],
    addedAt: '2026-09-04',
  },
  {
    id: 'lemon-squeezy',
    name: 'Lemon Squeezy',
    url: 'https://www.lemonsqueezy.com',
    domain: 'lemonsqueezy.com',
    tagline: 'Merchant of record aimed at indie digital products and SaaS',
    description:
      'The same tax-handling model as Paddle with a lighter setup, plus licence keys and digital file delivery built in. Now owned by Stripe, which is worth factoring into a long-term bet.',
    categories: ['payments'],
    pricing: 'paid',
    stack: ['Hosted', 'Merchant of record'],
    alternatives: ['paddle', 'polar', 'stripe'],
    addedAt: '2026-09-04',
  },
  {
    id: 'polar',
    name: 'Polar',
    url: 'https://polar.sh',
    domain: 'polar.sh',
    tagline: 'Merchant of record built for open-source maintainers and developer products',
    description:
      'Handles the tax paperwork like Paddle, but shaped around the things developers actually sell: sponsorships, licence keys, private repository access and usage billing. Open source itself, which is a reasonable signal of intent.',
    categories: ['payments'],
    pricing: 'paid',
    openSource: true,
    licence: 'Apache-2.0',
    stack: ['Hosted', 'Merchant of record'],
    alternatives: ['lemon-squeezy', 'paddle', 'stripe'],
    addedAt: '2026-09-04',
  },
  {
    id: 'mollie',
    name: 'Mollie',
    url: 'https://www.mollie.com',
    domain: 'mollie.com',
    tagline: 'European payments with the local methods Stripe covers less well',
    description:
      'Strong on the payment methods that matter in Europe — iDEAL, Bancontact, SEPA direct debit — with transparent per-transaction pricing and no monthly fee. Narrower geographic reach than Stripe in exchange.',
    categories: ['payments'],
    pricing: 'paid',
    stack: ['Hosted', 'SEPA'],
    alternatives: ['stripe', 'paddle'],
    addedAt: '2026-09-04',
  },
  {
    id: 'adyen',
    name: 'Adyen',
    url: 'https://www.adyen.com',
    domain: 'adyen.com',
    tagline: 'One platform for online, in-store and marketplace payouts worldwide',
    description:
      'Acquiring, local payment methods, point of sale and split payouts on a single contract, which is why marketplaces and retailers with physical stores end up here rather than stitching three vendors together. Onboarding is a sales process with volume expectations attached, not a signup form — if you are looking for an API key this afternoon, this is the wrong shelf entry.',
    categories: ['payments'],
    pricing: 'paid',
    stack: ['REST', 'Hosted checkout', 'Point of sale'],
    alternatives: ['stripe', 'mollie'],
    addedAt: '2026-09-17',
  },

  // ------------------------------------------------------------------- email

  {
    id: 'resend',
    name: 'Resend',
    url: 'https://resend.com',
    domain: 'resend.com',
    tagline: 'Transactional email with React components instead of HTML table soup',
    description:
      'Built by people who were clearly tired of the incumbents: a clean API, a good free tier, and React Email for writing templates as components. Younger than Postmark, so it has less deliverability history behind it.',
    categories: ['email'],
    pricing: 'freemium',
    stack: ['Hosted', 'React Email', 'SMTP'],
    alternatives: ['postmark', 'loops', 'plunk', 'hqbase'],
    addedAt: '2026-09-04',
  },
  {
    id: 'postmark',
    name: 'Postmark',
    url: 'https://postmarkapp.com',
    domain: 'postmarkapp.com',
    tagline: 'Transactional email chosen almost entirely for deliverability',
    description:
      'Keeps bulk marketing mail on separate infrastructure from transactional, which is the main reason its inbox placement stays good. Fewer features than its rivals and priced above them; the people who use it are paying for the reliability.',
    categories: ['email'],
    pricing: 'paid',
    stack: ['Hosted', 'SMTP'],
    alternatives: ['resend', 'sendgrid', 'hqbase'],
    addedAt: '2026-09-04',
  },
  {
    id: 'loops',
    name: 'Loops',
    url: 'https://loops.so',
    domain: 'loops.so',
    tagline: 'Marketing and transactional email for SaaS in one place',
    description:
      'Solves the split most teams end up with — one tool for product emails and another for campaigns — by putting both against a single contact list. Best fit if your lifecycle emails and your newsletter are aimed at the same people.',
    categories: ['email'],
    pricing: 'freemium',
    stack: ['Hosted'],
    alternatives: ['resend', 'plunk'],
    addedAt: '2026-09-04',
  },
  {
    id: 'plunk',
    name: 'Plunk',
    url: 'https://www.useplunk.com',
    domain: 'useplunk.com',
    tagline: 'Open-source email platform that sends through your own AWS SES',
    description:
      'Transactional, marketing and automation in one open-source app, with SES underneath — so you pay Amazon\'s per-email rate rather than a platform markup. Self-host it or use the managed version.',
    categories: ['email'],
    pricing: 'freemium',
    openSource: true,
    licence: 'AGPL-3.0',
    stack: ['AWS SES', 'Self-hosted'],
    alternatives: ['resend', 'loops', 'hqbase'],
    addedAt: '2026-09-04',
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    url: 'https://sendgrid.com',
    domain: 'sendgrid.com',
    tagline: 'High-volume sending at enterprise scale, now under Twilio',
    description:
      'The incumbent for large volumes, with the deliverability tooling and account management that implies. The developer experience is dated next to Resend, and shared IP reputation can be a problem on lower tiers.',
    categories: ['email'],
    pricing: 'freemium',
    stack: ['Hosted', 'SMTP'],
    alternatives: ['postmark', 'resend'],
    addedAt: '2026-09-04',
  },
  {
    id: 'hqbase',
    name: 'HQBase',
    url: 'https://hqbase.io',
    domain: 'hqbase.io',
    tagline: "Your team's email, running on your own Cloudflare account",
    description:
      'Shared mailboxes, team access and workflows deployed into infrastructure you already own, so the mail data never sits on someone else\'s servers. Free and unlimited seats because you are paying Cloudflare for Workers and R2 rather than paying per user. The catch is the same as the pitch: you operate it.',
    categories: ['email'],
    pricing: 'free',
    openSource: true,
    licence: 'AGPL-3.0',
    stack: ['Cloudflare Workers', 'R2', 'Self-hosted'],
    alternatives: ['resend', 'postmark', 'plunk'],
    addedAt: '2026-09-04',
  },

  // ---------------------------------------------------------------------- ui

  {
    id: 'shadcn-ui',
    name: 'shadcn/ui',
    url: 'https://ui.shadcn.com',
    domain: 'ui.shadcn.com',
    tagline: 'Components you copy into your repo and own outright',
    description:
      'Not a dependency: the CLI writes the component source into your project, so customising it means editing your own file rather than fighting a library API. The flip side is that you no longer get upstream fixes for free.',
    categories: ['ui'],
    pricing: 'free',
    openSource: true,
    licence: 'MIT',
    stack: ['React', 'Radix UI', 'Tailwind CSS'],
    alternatives: ['radix-ui', 'base-ui', 'mantine'],
    addedAt: '2026-09-04',
  },
  {
    id: 'radix-ui',
    name: 'Radix UI',
    url: 'https://www.radix-ui.com',
    domain: 'radix-ui.com',
    tagline: 'Unstyled React primitives with the accessibility already solved',
    description:
      'Dialogs, menus, comboboxes and the rest, with focus management, keyboard handling and ARIA done properly and no opinion about how they look. The layer most other component libraries are built on, including shadcn/ui.',
    categories: ['ui'],
    pricing: 'free',
    openSource: true,
    licence: 'MIT',
    stack: ['React', 'Headless'],
    alternatives: ['base-ui', 'shadcn-ui'],
    addedAt: '2026-09-04',
  },
  {
    id: 'base-ui',
    name: 'Base UI',
    url: 'https://base-ui.com',
    domain: 'base-ui.com',
    tagline: 'Headless React components from the teams behind MUI, Radix and Floating UI',
    description:
      'A consolidation of three well-known primitive libraries into one, which is a strong signal for where this layer is heading. Younger than Radix, so weigh the smaller ecosystem against the pedigree.',
    categories: ['ui'],
    pricing: 'free',
    openSource: true,
    licence: 'MIT',
    stack: ['React', 'Headless'],
    alternatives: ['radix-ui', 'shadcn-ui'],
    addedAt: '2026-09-04',
  },
  {
    id: 'tailwindcss',
    name: 'Tailwind CSS',
    url: 'https://tailwindcss.com',
    domain: 'tailwindcss.com',
    tagline: 'Utility-first CSS that keeps styling next to the markup',
    description:
      'The styling layer under most of this category. The design-token system is the part that earns its keep on a team — constraints on spacing, colour and type that hold across a codebase without anyone policing them.',
    categories: ['ui'],
    pricing: 'free',
    openSource: true,
    licence: 'MIT',
    stack: ['CSS', 'PostCSS'],
    alternatives: ['shadcn-ui'],
    addedAt: '2026-09-04',
  },
  {
    id: 'mantine',
    name: 'Mantine',
    url: 'https://mantine.dev',
    domain: 'mantine.dev',
    tagline: 'A full styled component library, batteries very much included',
    description:
      'The opposite bet to headless primitives: a hundred-plus components that already look good, plus form handling, notifications and hooks. Fastest way to a working interface if you can live inside its design decisions.',
    categories: ['ui'],
    pricing: 'free',
    openSource: true,
    licence: 'MIT',
    stack: ['React', 'CSS Modules'],
    alternatives: ['shadcn-ui', 'radix-ui'],
    addedAt: '2026-09-04',
  },
  {
    id: 'chakra-ui',
    name: 'Chakra UI',
    url: 'https://chakra-ui.com',
    domain: 'chakra-ui.com',
    tagline: 'Styled, accessible components driven by design tokens rather than overrides',
    description:
      'Sits on the same side of the line as Mantine — components that already look finished — but customisation runs through a token and recipe system instead of per-component overrides, which holds up better once a design system has real constraints. The v3 rewrite changed the styling engine, so a v2 codebase faces a genuine migration rather than a version bump.',
    categories: ['ui'],
    pricing: 'free',
    openSource: true,
    licence: 'MIT',
    stack: ['React', 'TypeScript'],
    alternatives: ['mantine', 'radix-ui', 'shadcn-ui'],
    addedAt: '2026-09-17',
  },

  // ---------------------------------------------------------------- database

  {
    id: 'supabase',
    name: 'Supabase',
    url: 'https://supabase.com',
    domain: 'supabase.com',
    tagline: 'Postgres with auth, storage, realtime and generated APIs on top',
    description:
      'The open-source Firebase answer, except the database underneath is plain Postgres you can take with you. Row-level security is central to the model, which is powerful and is also where most teams trip up early.',
    categories: ['database', 'auth'],
    pricing: 'freemium',
    openSource: true,
    licence: 'Apache-2.0',
    stack: ['PostgreSQL', 'Self-hosted', 'Realtime'],
    alternatives: ['neon', 'planetscale', 'better-auth'],
    addedAt: '2026-09-04',
  },
  {
    id: 'neon',
    name: 'Neon',
    url: 'https://neon.com',
    domain: 'neon.com',
    tagline: 'Serverless Postgres that branches like Git',
    description:
      'Separates storage from compute, so a database branch is instant and cheap and every pull request can have its own. Scales to zero when idle, which is either the main attraction or a cold-start problem depending on your traffic.',
    categories: ['database'],
    pricing: 'freemium',
    stack: ['PostgreSQL', 'Serverless'],
    alternatives: ['supabase', 'planetscale', 'turso'],
    addedAt: '2026-09-04',
  },
  {
    id: 'planetscale',
    name: 'PlanetScale',
    url: 'https://planetscale.com',
    domain: 'planetscale.com',
    tagline: 'MySQL and Postgres at scale, with schema changes that do not lock the table',
    description:
      'Built on Vitess, the sharding layer YouTube ran on, and its schema-branching workflow is still the most convincing answer to migrations on a large live table. Priced for teams past the hobby stage.',
    categories: ['database'],
    pricing: 'paid',
    stack: ['MySQL', 'Vitess', 'PostgreSQL'],
    alternatives: ['neon', 'supabase'],
    addedAt: '2026-09-04',
  },
  {
    id: 'turso',
    name: 'Turso',
    url: 'https://turso.tech',
    domain: 'turso.tech',
    tagline: 'SQLite at the edge, and a database per tenant without the bill',
    description:
      'Built on libSQL, a fork of SQLite with replication. The unusual move it enables is one database per customer, which is cheap here and prohibitive almost everywhere else.',
    categories: ['database'],
    pricing: 'freemium',
    openSource: true,
    licence: 'MIT',
    stack: ['SQLite', 'libSQL', 'Edge'],
    alternatives: ['neon', 'supabase'],
    addedAt: '2026-09-04',
  },
  {
    id: 'drizzle',
    name: 'Drizzle ORM',
    url: 'https://orm.drizzle.team',
    domain: 'orm.drizzle.team',
    tagline: 'A TypeScript ORM that stays close to the SQL you would have written',
    description:
      'Thin enough that the generated queries hold no surprises, with full type inference from your schema and no runtime engine to ship. Preferred over Prisma where serverless cold starts or bundle size matter.',
    categories: ['database'],
    pricing: 'free',
    openSource: true,
    licence: 'Apache-2.0',
    stack: ['TypeScript', 'SQL'],
    alternatives: ['prisma'],
    addedAt: '2026-09-04',
  },
  {
    id: 'prisma',
    name: 'Prisma',
    url: 'https://www.prisma.io',
    domain: 'prisma.io',
    tagline: 'Schema-first ORM with the best migration and studio tooling',
    description:
      'Its own schema language generates a fully typed client, and the surrounding tooling — migrations, seeding, a data browser — is more polished than anything else here. Heavier at runtime than Drizzle, which matters most on serverless.',
    categories: ['database'],
    pricing: 'freemium',
    openSource: true,
    licence: 'Apache-2.0',
    stack: ['TypeScript', 'Node.js'],
    alternatives: ['drizzle'],
    addedAt: '2026-09-04',
  },

  // ----------------------------------------------------------------- hosting

  {
    id: 'vercel',
    name: 'Vercel',
    url: 'https://vercel.com',
    domain: 'vercel.com',
    tagline: 'Push-to-deploy for frontend frameworks, and the home of Next.js',
    description:
      'Preview deployments per pull request set the standard the rest of the category copied, and Next.js support is naturally first-class. Watch bandwidth and function invocation pricing — that is where the bills tend to surprise people.',
    categories: ['hosting'],
    pricing: 'freemium',
    stack: ['Serverless', 'Edge', 'Next.js'],
    alternatives: ['netlify', 'cloudflare-workers', 'railway'],
    addedAt: '2026-09-04',
  },
  {
    id: 'cloudflare-workers',
    name: 'Cloudflare Workers',
    url: 'https://workers.cloudflare.com',
    domain: 'workers.cloudflare.com',
    tagline: 'Code running in 300-odd cities, with storage and queues alongside it',
    description:
      'V8 isolates rather than containers, so cold starts are effectively nil and the pricing is aggressive. The platform around it — R2 with no egress fees, D1, KV, Durable Objects — is the real reason to pick it. You do have to write for the Workers runtime, not plain Node.',
    categories: ['hosting'],
    pricing: 'freemium',
    stack: ['V8 isolates', 'Edge', 'R2', 'D1'],
    alternatives: ['vercel', 'netlify', 'fly-io'],
    addedAt: '2026-09-04',
  },
  {
    id: 'netlify',
    name: 'Netlify',
    url: 'https://www.netlify.com',
    domain: 'netlify.com',
    tagline: 'The original Git-driven static host, still very good at it',
    description:
      'Invented most of this workflow and remains a clean choice for static sites and framework-agnostic builds. Less tied to any one framework than Vercel, which cuts both ways.',
    categories: ['hosting'],
    pricing: 'freemium',
    stack: ['Static', 'Serverless', 'Edge'],
    alternatives: ['vercel', 'cloudflare-workers'],
    addedAt: '2026-09-04',
  },
  {
    id: 'fly-io',
    name: 'Fly.io',
    url: 'https://fly.io',
    domain: 'fly.io',
    tagline: 'Run actual containers close to your users, in regions you choose',
    description:
      'For workloads that need a real long-running process — a Rails app, a websocket server, a background worker — rather than functions. More control than the serverless hosts and correspondingly more to operate.',
    categories: ['hosting'],
    pricing: 'paid',
    stack: ['Docker', 'Firecracker', 'Multi-region'],
    alternatives: ['railway', 'render', 'cloudflare-workers'],
    addedAt: '2026-09-04',
  },
  {
    id: 'railway',
    name: 'Railway',
    url: 'https://railway.com',
    domain: 'railway.com',
    tagline: 'Deploy a service and its database without writing infrastructure config',
    description:
      'Detects what your repository is and runs it, with managed Postgres, Redis and the rest a click away. The nicest developer experience in the container end of this category; usage-based pricing means idle services still cost something.',
    categories: ['hosting'],
    pricing: 'paid',
    stack: ['Docker', 'Nixpacks'],
    alternatives: ['render', 'fly-io', 'vercel'],
    addedAt: '2026-09-04',
  },
  {
    id: 'render',
    name: 'Render',
    url: 'https://render.com',
    domain: 'render.com',
    tagline: 'Managed web services, cron jobs and databases with a free tier to start on',
    description:
      'The closest thing to old Heroku still being actively developed, covering web services, static sites, background workers and cron in one place. Free-tier services sleep when idle, which is fine for side projects and not for production.',
    categories: ['hosting'],
    pricing: 'freemium',
    stack: ['Docker', 'PostgreSQL'],
    alternatives: ['railway', 'fly-io'],
    addedAt: '2026-09-04',
  },
  {
    id: 'minio',
    name: 'MinIO',
    url: 'https://www.min.io',
    domain: 'min.io',
    tagline: 'S3-compatible object storage you run on your own servers',
    description:
      'The open-source edition was archived in April 2026 and gets no more releases or security fixes; what MinIO ships now is AIStor, free on a single node and paid once you need it distributed. Either way you run the storage yourself — disks, capacity, backups, upgrades and uptime are all yours.',
    categories: ['hosting'],
    pricing: 'freemium',
    stack: ['Go', 'S3 API', 'Self-hosted'],
    alternatives: ['garage', 'cloudflare-workers'],
    addedAt: '2026-09-25',
  },
  {
    id: 'garage',
    name: 'Garage',
    url: 'https://garagehq.deuxfleurs.fr',
    domain: 'garagehq.deuxfleurs.fr',
    tagline: 'S3-compatible object storage built for small clusters spread across sites',
    description:
      'It covers the everyday S3 calls, not the whole API: no object versioning, object lock, bucket policies or server-side encryption, so check what your app expects first. It stores whole copies of your data (three by default) rather than erasure coding, which costs raw disk. And it is maintained by a small hosting co-op, not a company you can buy support from off the shelf.',
    categories: ['hosting'],
    pricing: 'free',
    openSource: true,
    licence: 'AGPL-3.0',
    stack: ['Rust', 'S3 API', 'Self-hosted'],
    alternatives: ['minio'],
    addedAt: '2026-09-25',
  },

  // -------------------------------------------------------------- monitoring

  {
    id: 'sentry',
    name: 'Sentry',
    url: 'https://sentry.io',
    domain: 'sentry.io',
    tagline: 'Error tracking with the stack trace, the release, and the commit that caused it',
    description:
      'The default for exception monitoring, with source maps, release tracking and performance tracing across essentially every language. Self-hostable, though running it yourself is a real commitment.',
    categories: ['monitoring'],
    pricing: 'freemium',
    openSource: true,
    licence: 'BSL-1.1',
    stack: ['Self-hosted', 'Tracing'],
    alternatives: ['betterstack', 'clueline', 'axiom'],
    addedAt: '2026-09-04',
  },
  {
    id: 'betterstack',
    name: 'Better Stack',
    url: 'https://betterstack.com',
    domain: 'betterstack.com',
    tagline: 'Uptime checks, logs and on-call paging in one product',
    description:
      'Covers the three jobs that usually mean three vendors, with status pages and incident escalation included. Good fit for a small team that wants one bill and one dashboard rather than best-in-class at each layer.',
    categories: ['monitoring'],
    pricing: 'freemium',
    stack: ['Hosted', 'On-call'],
    alternatives: ['sentry', 'grafana', 'axiom'],
    addedAt: '2026-09-04',
  },
  {
    id: 'axiom',
    name: 'Axiom',
    url: 'https://axiom.co',
    domain: 'axiom.co',
    tagline: 'Log and event storage priced so you can afford to keep everything',
    description:
      'Built around ingesting all your events rather than sampling them, which changes how you debug — the data you need is already there. Query-first rather than dashboard-first, so expect to learn its query language.',
    categories: ['monitoring'],
    pricing: 'freemium',
    stack: ['Hosted', 'OpenTelemetry'],
    alternatives: ['grafana', 'betterstack', 'sentry'],
    addedAt: '2026-09-04',
  },
  {
    id: 'grafana',
    name: 'Grafana',
    url: 'https://grafana.com',
    domain: 'grafana.com',
    tagline: 'The dashboard layer over Prometheus, Loki and everything else',
    description:
      'The open standard for visualising metrics and logs, with a hosted tier if you would rather not run Prometheus and Loki yourself. Enormously capable and correspondingly more setup than the all-in-one options.',
    categories: ['monitoring'],
    pricing: 'freemium',
    openSource: true,
    licence: 'AGPL-3.0',
    stack: ['Prometheus', 'Loki', 'Self-hosted'],
    alternatives: ['axiom', 'betterstack'],
    addedAt: '2026-09-04',
  },
  {
    id: 'checkly',
    name: 'Checkly',
    url: 'https://www.checklyhq.com',
    domain: 'checklyhq.com',
    tagline: 'Monitors written as Playwright scripts, run from where your users are',
    description:
      'Everything else on this shelf tells you about a request your own servers already saw; this runs the real signup flow from outside, on a schedule, from the regions you care about, and pages you when a step breaks. It watches from the outside, so it tells you that checkout failed without telling you why — it pairs with an error tracker rather than replacing one, and the bill scales with frequency multiplied by locations.',
    categories: ['monitoring'],
    pricing: 'freemium',
    stack: ['Playwright', 'TypeScript', 'Hosted'],
    alternatives: ['betterstack', 'sentry'],
    addedAt: '2026-09-17',
  },

  // --------------------------------------------------------------- analytics

  {
    id: 'plausible',
    name: 'Plausible',
    url: 'https://plausible.io',
    domain: 'plausible.io',
    tagline: 'Cookie-free web analytics on a script under 1 KB',
    description:
      'No cookies and no personal data, so no consent banner, and the whole report fits on one page. Deliberately shallow compared to a product-analytics tool — that is the point, not an omission.',
    categories: ['analytics'],
    pricing: 'paid',
    openSource: true,
    licence: 'AGPL-3.0',
    stack: ['Elixir', 'ClickHouse', 'Self-hosted'],
    alternatives: ['fathom', 'umami', 'posthog'],
    addedAt: '2026-09-04',
  },
  {
    id: 'posthog',
    name: 'PostHog',
    url: 'https://posthog.com',
    domain: 'posthog.com',
    tagline: 'Product analytics, session replay, feature flags and A/B tests together',
    description:
      'The heavy end of the category: funnels, cohorts, replays and experiments against one event stream. Generous free tier, and self-hostable — but it is a large product with a learning curve to match.',
    categories: ['analytics'],
    pricing: 'freemium',
    openSource: true,
    licence: 'MIT',
    stack: ['ClickHouse', 'Self-hosted'],
    alternatives: ['plausible', 'umami'],
    addedAt: '2026-09-04',
  },
  {
    id: 'fathom',
    name: 'Fathom Analytics',
    url: 'https://usefathom.com',
    domain: 'usefathom.com',
    tagline: 'Privacy-first analytics with EU data isolation',
    description:
      'Closest comparison to Plausible, with an EU-hosted option for keeping data out of US jurisdiction entirely. Simple, fast, and priced per pageview.',
    categories: ['analytics'],
    pricing: 'paid',
    stack: ['Hosted', 'EU isolation'],
    alternatives: ['plausible', 'umami'],
    addedAt: '2026-09-04',
  },
  {
    id: 'umami',
    name: 'Umami',
    url: 'https://umami.is',
    domain: 'umami.is',
    tagline: 'Self-hosted analytics you can run on a free database tier',
    description:
      'The same privacy-friendly shape as Plausible and Fathom, except you host it — a Node app against Postgres or MySQL, cheap enough to run alongside an existing project. Managed cloud tier available if you would rather not.',
    categories: ['analytics'],
    pricing: 'free',
    openSource: true,
    licence: 'MIT',
    stack: ['Node.js', 'PostgreSQL', 'Self-hosted'],
    alternatives: ['plausible', 'fathom', 'posthog'],
    addedAt: '2026-09-04',
  },
  {
    id: 'cloudflare-analytics',
    name: 'Cloudflare Web Analytics',
    url: 'https://www.cloudflare.com/web-analytics/',
    domain: 'cloudflare.com',
    tagline: 'Free cookie-free analytics, with no plan to outgrow and no sampling',
    description:
      'Genuinely free for any traffic level, cookieless, and it works on any host rather than only on sites proxied through Cloudflare. The catch is that it counts pageviews and nothing else — there is no custom-event API, so anything that is not a page load has to be modelled as one to be measured at all.',
    categories: ['analytics'],
    pricing: 'free',
    stack: ['Beacon script', 'Cloudflare'],
    alternatives: ['plausible', 'fathom', 'umami'],
    addedAt: '2026-09-17',
  },
  {
    id: 'matomo',
    name: 'Matomo',
    url: 'https://matomo.org',
    domain: 'matomo.org',
    tagline: 'The full Google Analytics replacement, self-hosted and entirely yours',
    description:
      'The heavyweight of the self-hosted end: segments, goals, funnels, heatmaps and session recording, with the raw data staying on your own server. That completeness is also the cost — it is a PHP and MySQL application with real operational weight, and the cookieless configuration that removes the consent banner is something you switch on rather than the default.',
    categories: ['analytics'],
    pricing: 'free',
    openSource: true,
    licence: 'GPL-3.0',
    stack: ['PHP', 'MySQL', 'Self-hosted'],
    alternatives: ['posthog', 'plausible', 'umami'],
    addedAt: '2026-09-17',
  },

  // ---------------------------------------------------------------------- ai

  {
    id: 'claude-api',
    name: 'Claude API',
    url: 'https://www.anthropic.com/api',
    domain: 'anthropic.com',
    tagline: "Anthropic's models, with strong long-context and tool-use behaviour",
    description:
      'The Messages API plus an agent SDK, prompt caching and a tool-use loop. Caching is the lever worth learning early — it changes the economics of long system prompts substantially.',
    categories: ['ai'],
    pricing: 'paid',
    stack: ['REST', 'Streaming', 'MCP'],
    alternatives: ['openai', 'openrouter', 'vercel-ai-sdk'],
    addedAt: '2026-09-04',
  },
  {
    id: 'openai',
    name: 'OpenAI Platform',
    url: 'https://platform.openai.com',
    domain: 'platform.openai.com',
    tagline: 'The most widely integrated model API, and the de facto request format',
    description:
      'Its request shape has become the interface half the ecosystem implements, so building against it keeps the most doors open. Covers text, images, audio and embeddings in one account.',
    categories: ['ai'],
    pricing: 'paid',
    stack: ['REST', 'Streaming'],
    alternatives: ['claude-api', 'openrouter'],
    addedAt: '2026-09-04',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    url: 'https://openrouter.ai',
    domain: 'openrouter.ai',
    tagline: 'One API and one bill across hundreds of models from every provider',
    description:
      'Useful for comparing models without opening an account with each vendor, and for automatic failover when a provider is down. You add a hop and a margin in exchange for the flexibility.',
    categories: ['ai'],
    pricing: 'paid',
    stack: ['REST', 'Multi-provider'],
    alternatives: ['claude-api', 'openai', 'vercel-ai-sdk'],
    addedAt: '2026-09-04',
  },
  {
    id: 'vercel-ai-sdk',
    name: 'AI SDK',
    url: 'https://ai-sdk.dev',
    domain: 'ai-sdk.dev',
    tagline: 'One TypeScript interface for streaming, tools and structured output',
    description:
      'Abstracts the provider differences behind a single set of functions, with first-class streaming into React and Svelte and schema-validated structured output. The default answer for LLM features in a TypeScript app.',
    categories: ['ai'],
    pricing: 'free',
    openSource: true,
    licence: 'Apache-2.0',
    stack: ['TypeScript', 'React', 'Streaming'],
    alternatives: ['openrouter', 'claude-api'],
    addedAt: '2026-09-04',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    url: 'https://ollama.com',
    domain: 'ollama.com',
    tagline: 'Run open models on your own machine with one command',
    description:
      'Makes local inference a single pull-and-run, exposing an HTTP API most tools already speak. Free and private; what you give up is the capability gap between open weights and frontier hosted models.',
    categories: ['ai'],
    pricing: 'free',
    openSource: true,
    licence: 'MIT',
    stack: ['Local', 'llama.cpp', 'GGUF'],
    alternatives: ['claude-api', 'openai'],
    addedAt: '2026-09-04',
  },
  {
    id: 'replicate',
    name: 'Replicate',
    url: 'https://replicate.com',
    domain: 'replicate.com',
    tagline: 'Run open models behind an API without provisioning a single GPU',
    description:
      'The practical way to use image, audio and video models that the text-first providers do not serve, plus fine-tuning on your own data. Billing is per second of compute rather than per token, which means a slow model costs more for identical output, and a model nobody has called recently pays a cold-start penalty before it answers.',
    categories: ['ai'],
    pricing: 'paid',
    stack: ['REST', 'Cog', 'Hosted GPUs'],
    alternatives: ['ollama', 'openrouter'],
    addedAt: '2026-09-17',
  },
];
