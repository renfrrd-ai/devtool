/**
 * The directory's shelves.
 *
 * Categories are a fixed, curated set — not a free-form tag cloud. Adding one is
 * a deliberate act: every category is a page that has to earn its place, and a
 * shelf with two tools on it looks broken. Six entries is roughly the floor.
 *
 * `id` is the URL slug: /categories/<id>.
 */

export interface Category {
  id: string;
  name: string;
  /** One line for the category card on the home page. */
  tagline: string;
  /** A short paragraph for the category page header. */
  description: string;
}

export const categories: Category[] = [
  {
    id: 'auth',
    name: 'Authentication',
    tagline: 'Sign-in, sessions, and knowing who someone is',
    description:
      'Auth is the classic build-versus-buy trap: the happy path takes an afternoon and the long tail — password resets, SSO, SCIM, session revocation, account recovery — takes years. These are the tools worth reaching for before you write your own.',
  },
  {
    id: 'payments',
    name: 'Payments',
    tagline: 'Taking money, and the tax paperwork that follows',
    description:
      'The real split here is whether the provider is a merchant of record. If it is, it owns global sales tax and VAT registration on your behalf; if it is not, that work lands on you the moment you sell across a border.',
  },
  {
    id: 'email',
    name: 'Email & SMTP',
    tagline: 'Transactional sending, and getting past the spam folder',
    description:
      'Sending email is easy and being delivered is not. What separates these tools is deliverability reputation, how much of the DNS and authentication setup they handle for you, and whether marketing and transactional email live in one place or two.',
  },
  {
    id: 'ui',
    name: 'UI & Components',
    tagline: 'Component libraries, primitives, and styling systems',
    description:
      'The market has largely settled on unstyled, accessible primitives plus your own styling, rather than a themed component kit you fight with later. These are the primitives, the systems built on them, and the CSS layer underneath.',
  },
  {
    id: 'database',
    name: 'Databases & ORMs',
    tagline: 'Storing things, and talking to what stores them',
    description:
      'Postgres won. What differs now is the operational shape around it — serverless or always-on, branching or not, how cold starts are handled — and which type-safe layer you use to query it.',
  },
  {
    id: 'hosting',
    name: 'Hosting & Deploy',
    tagline: 'Getting it onto the internet and keeping it there',
    description:
      'Pick on the deployment model, not the marketing: whether you are shipping a container, a set of edge functions, or static files decides most of this, and the pricing surprises tend to live in bandwidth and always-on compute.',
  },
  {
    id: 'monitoring',
    name: 'Monitoring & Errors',
    tagline: 'Finding out it broke before your users tell you',
    description:
      'Error tracking, uptime checks, and logs are three different jobs that vendors increasingly sell as one. Worth knowing which of the three you actually have covered, because a green uptime dashboard says nothing about the exception your users are hitting.',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    tagline: 'What people do, without the consent banner',
    description:
      'The privacy-first end of this category has become genuinely good, and cookie-free tools avoid the consent banner entirely. The trade is depth: if you need funnels, replays and feature flags, you are looking at a heavier product.',
  },
  {
    id: 'ai',
    name: 'AI & LLMs',
    tagline: 'Model APIs, SDKs, and running things locally',
    description:
      'Three distinct layers get lumped together here: the model providers themselves, the SDKs that give you one interface across them, and the runtimes for running open models on your own hardware.',
  },
];

export const categoryIds = categories.map((category) => category.id);

export type CategoryId = (typeof categories)[number]['id'];

export function getCategory(id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}
