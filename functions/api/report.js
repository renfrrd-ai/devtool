/**
 * POST /api/report — the one dynamic endpoint on an otherwise static site.
 *
 * A Cloudflare Pages Function. It exists because reporting has to be a
 * two-second reflex: gate it behind a GitHub account and the report rate goes
 * to zero, which makes the reports-to-views ratio meaningless. That is the
 * trade recorded in D23 — this is the smallest write surface that makes the
 * feature real.
 *
 * No JavaScript reaches the browser. /report/<id>/ is a static page with a
 * plain <form method="POST">, the same trick /go/<id>/ uses for outbound click
 * counting, and this handler answers with a 303 to a static thank-you page.
 *
 * WHAT A REPORT CAN AND CANNOT DO: it can cause a human to look at an entry.
 * That is all. Reports never hide a curated entry, never reorder anything, and
 * are never displayed. That ceiling is what makes it safe to accept them from
 * anonymous strangers — gaming this buys an attacker one moderator glance.
 *
 * Bindings (set in the Pages dashboard — see docs/reports.md):
 *   REPORTS      KV namespace holding one key per report
 *   REPORT_SALT  secret, so the dedupe hashes are not reversible by anyone who
 *                can read the namespace
 */

const REASONS = new Set(['dead-link', 'misleading', 'pricing', 'spam', 'security', 'other']);
const KINDS = new Set(['tool', 'suggestion']);

/** Matches the slugs tools.ts uses. Format only — see the note by `validity`. */
const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;

const MAX_DETAIL = 500;
const TTL_SECONDS = 90 * 24 * 60 * 60;

/** Reports one person can file in a day, across all entries. Best effort. */
const DAILY_CAP = 10;

const hex = (buffer) =>
  [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');

/*
 * Hashes the parts as a JSON array rather than a joined string, so no separator
 * can collide with the content. An IPv6 address is full of colons and the salt
 * can be anything, which rules out most of the obvious delimiters.
 */
async function hash(...parts) {
  const data = new TextEncoder().encode(JSON.stringify(parts));
  return hex(await crypto.subtle.digest('SHA-256', data)).slice(0, 32);
}

const seeOther = (request, path) =>
  new Response(null, { status: 303, headers: { Location: new URL(path, request.url).toString() } });

export async function onRequestPost(context) {
  const { request, env } = context;

  // A missing binding must be loud. Silently accepting reports into nowhere is
  // the worst outcome available: the feature looks fine and measures nothing.
  if (!env.REPORTS) {
    return new Response('Reporting is not configured on this deployment.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return seeOther(request, '/report/problem/');
  }

  const id = String(form.get('id') ?? '');
  const kind = String(form.get('kind') ?? '');
  const reason = String(form.get('reason') ?? '');
  const detail = String(form.get('detail') ?? '').slice(0, MAX_DETAIL).trim();

  /*
   * A honeypot. The static form renders this field hidden with a label telling
   * humans to leave it alone; anything that fills it in is automated. Costs
   * nothing, needs no JavaScript, and catches the undirected form spam that
   * makes up most of the volume.
   *
   * Answered with the ordinary thank-you page rather than an error, so a bot
   * learns nothing about why it failed.
   */
  if (String(form.get('website') ?? '') !== '') {
    return seeOther(request, '/report/thanks/');
  }

  /*
   * Format validation only. Whether `id` names a tool that actually exists is
   * settled later, by scripts/fetch-reports.mjs, which already holds the entry
   * list and drops keys that match nothing — the same way fetch-popular.mjs
   * discards analytics paths with no matching tool. Keeping this handler
   * ignorant of the catalogue means it never needs redeploying when a tool is
   * added, and a junk key costs one expiring KV entry.
   */
  const valid = SLUG.test(id) && KINDS.has(kind) && REASONS.has(reason);
  if (!valid) {
    return seeOther(request, '/report/problem/');
  }

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const day = new Date().toISOString().slice(0, 10);
  const salt = env.REPORT_SALT ?? 'unsalted';

  /*
   * The raw IP is never stored, and never leaves this function. What goes into
   * KV is a salted hash that is scoped to one day, so it cannot be correlated
   * across days, cannot be reversed without the secret, and expires on its own.
   * The site's privacy line depends on this staying true.
   */
  const who = await hash(salt, ip, day);

  // One report per person per entry per day.
  const seenKey = `seen:${who}:${id}`;
  if (await env.REPORTS.get(seenKey)) {
    return seeOther(request, '/report/thanks/');
  }

  /*
   * A per-person daily cap on top of that, so one person cannot report fifty
   * different entries in a sitting. Read-modify-write on KV is not atomic and
   * a burst of concurrent requests can undercount — accepted deliberately. The
   * cap exists to stop casual bulk reporting, and the consequence of it being
   * off by a few is that somebody files a couple of extra reports, which at
   * worst wastes a moderator's time briefly.
   */
  const rateKey = `rate:${who}`;
  const filed = Number((await env.REPORTS.get(rateKey)) ?? 0);
  if (filed >= DAILY_CAP) {
    return seeOther(request, '/report/thanks/');
  }

  const stamp = new Date().toISOString();
  const nonce = crypto.randomUUID().slice(0, 8);

  /*
   * One key per report rather than a counter per entry. KV has no atomic
   * increment, so a shared counter loses writes under concurrency; separate
   * keys cannot. It also keeps the reason with the report, which is what makes
   * the review issue actionable rather than just a number.
   */
  await env.REPORTS.put(
    `report:${kind}:${id}:${stamp}-${nonce}`,
    JSON.stringify({ reason, detail: detail || undefined, at: stamp }),
    { expirationTtl: TTL_SECONDS },
  );

  await env.REPORTS.put(seenKey, '1', { expirationTtl: 24 * 60 * 60 });
  await env.REPORTS.put(rateKey, String(filed + 1), { expirationTtl: 24 * 60 * 60 });

  return seeOther(request, '/report/thanks/');
}

/** Nobody should arrive here by GET; send them to the directory rather than a 405. */
export async function onRequestGet({ request }) {
  return seeOther(request, '/');
}
