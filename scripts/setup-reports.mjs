/**
 * Turns reporting on, and says what is wrong when it is off.
 *
 * Reporting is the one feature here that cannot be finished from inside the
 * repository: the code has been correct since it was written, and the endpoint
 * still does not work, because a Pages Function needs a KV namespace bound to
 * the project and the project needs to be building Functions at all. Both are
 * Cloudflare state. Until now the instructions for that were a table in
 * docs/reports.md and a walk through the dashboard, which is how a feature ends
 * up shipped, documented and quietly broken for a month.
 *
 * So this does it through the API instead, from the same CF_API_TOKEN the
 * analytics job already uses (with two permissions added — it says which).
 *
 *   node scripts/setup-reports.mjs            what is wrong, and what it would do
 *   node scripts/setup-reports.mjs --apply    do it
 *   node scripts/setup-reports.mjs --probe    hit the live endpoint, no token needed
 *
 * The default run changes nothing. Every write is behind --apply, nothing that
 * already exists is overwritten without --force, and the salt it generates is
 * never printed, because nothing else ever needs to read it.
 *
 * WHY IT PROBES FIRST: 404 and 503 from /api/report mean different things and
 * need different fixes — 404 is the Functions worker missing from the
 * deployment, which no binding can repair. Guessing between them is what makes
 * this take an afternoon. See docs/reports.md#telling-the-two-failure-modes-apart.
 *
 * Environment:
 *   CF_API_TOKEN      Cloudflare Pages: Edit, and Workers KV Storage: Edit
 *   CF_ACCOUNT_ID     the account holding the Pages project
 *   CF_PAGES_PROJECT  optional — discovered from the site's domain otherwise
 */

import { randomBytes } from 'node:crypto';

import { SITE } from '../src/data/site.ts';

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');
const FORCE = args.has('--force');
const PREVIEW = args.has('--preview');
const REDEPLOY = args.has('--redeploy');
const PROBE_ONLY = args.has('--probe');

/** Lets the probe run against `wrangler pages dev` as well as production. */
const urlFlag = [...args].find((arg) => arg.startsWith('--url='));
const ORIGIN = urlFlag ? urlFlag.slice('--url='.length) : SITE.url;

const { CF_API_TOKEN, CF_ACCOUNT_ID, CF_PAGES_PROJECT } = process.env;

const KV_TITLE = 'devtool-reports';
const BINDING = 'REPORTS';
const SALT = 'REPORT_SALT';

const say = (line = '') => console.log(line);
const step = (line) => console.log(`\n${line}\n${'─'.repeat(line.length)}`);

/*
 * An API refusal is a message to read, not a stack trace to decode — the useful
 * half of a 403 here is the sentence naming the permission that is missing, and
 * burying it under eight frames of Node internals hides it.
 */
const fail = (error) => {
  console.error(`\n${error?.message ?? error}\n`);
  process.exit(1);
};

process.on('unhandledRejection', fail);
process.on('uncaughtException', fail);

/* ------------------------------------------------------------------ the probe */

/**
 * Asks the live endpoint what state it is in, without writing anything.
 *
 * The reason is deliberately not one of the six the handler accepts, so a
 * working endpoint validates it, rejects it and redirects — reaching the branch
 * that proves the Function ran and the binding is there, and stopping before
 * the branch that puts a report in KV. Probing a production endpoint should not
 * leave a report behind for a moderator to puzzle over.
 */
async function probe() {
  const body = new URLSearchParams({ id: 'probe', kind: 'tool', reason: '__diagnostic__' });

  let res;
  try {
    res = await fetch(`${ORIGIN}/api/report`, { method: 'POST', body, redirect: 'manual' });
  } catch (error) {
    say(`Could not reach ${ORIGIN}: ${error.message}`);
    return 'unreachable';
  }

  const location = res.headers.get('location') ?? '';

  if (res.status === 303 && location.includes('/report/problem/')) {
    say(`✓ ${ORIGIN}/api/report is working — the Function ran, the binding is there,`);
    say('  and the deliberately invalid reason was rejected exactly as it should be.');
    return 'working';
  }

  if (res.status === 503) {
    say(`✗ 503 — the Function ran and found no ${BINDING} binding.`);
    say('  The deployment is fine. This is the part --apply fixes.');
    return 'unbound';
  }

  if (res.status === 404) {
    /*
     * The tell, and the reason this check exists at all: a 404 carrying the
     * headers from public/_headers is the static asset handler answering,
     * which means the Functions worker was never in the deployment. A Function
     * that ran and 404'd would not carry them.
     */
    const asset = res.headers.get('x-content-type-options') !== null;
    say('✗ 404 — the Function is not in the deployment at all.');

    if (asset) {
      say('  It carries the headers from public/_headers, so this is the static asset');
      say('  handler answering a path it has no file for — not a Function that 404d.');
    } else {
      say('  It carries none of the headers from public/_headers, which is unusual.');
      say('  Check the build log for the most recent deployment.');
    }

    say('  No binding fixes this: it is a project setting, not a missing namespace.');
    if (PROBE_ONLY) say('  Run without --probe, with CF_API_TOKEN set, to see which one.');
    return 'no-function';
  }

  say(`? ${res.status}${location ? ` → ${location}` : ''} — not a state this knows about.`);
  return 'unknown';
}

/* ------------------------------------------------------------- the Cloudflare API */

const cf = async (path, init) => {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok || payload.success === false) {
    const detail = (payload.errors ?? []).map((error) => `${error.code}: ${error.message}`);

    if (res.status === 403) {
      detail.push(
        'The token is missing a permission. Reporting setup needs ' +
          'Account → Cloudflare Pages: Edit and Account → Workers KV Storage: Edit, ' +
          'on top of the Account Analytics: Read the refresh job already uses.',
      );
    }

    throw new Error(`${init?.method ?? 'GET'} ${path} → ${res.status}\n  ${detail.join('\n  ')}`);
  }

  return payload.result;
};

/* ---------------------------------------------------------------------- running */

step(`Probing ${ORIGIN}/api/report`);
const state = await probe();

if (PROBE_ONLY) {
  process.exit(state === 'working' ? 0 : 1);
}

if (!CF_API_TOKEN || !CF_ACCOUNT_ID) {
  say('');
  say('Set CF_API_TOKEN and CF_ACCOUNT_ID to go further than the probe.');
  say('Setup: docs/reports.md#setting-it-up');
  process.exit(state === 'working' ? 0 : 1);
}

/* The project, by name if given and by its domain otherwise. */
step('The Pages project');

let project;

if (CF_PAGES_PROJECT) {
  project = await cf(`/accounts/${CF_ACCOUNT_ID}/pages/projects/${CF_PAGES_PROJECT}`);
} else {
  const all = await cf(`/accounts/${CF_ACCOUNT_ID}/pages/projects`);
  project = all.find((candidate) => (candidate.domains ?? []).includes(SITE.domain));

  if (!project) {
    say(`No Pages project serves ${SITE.domain}. Projects on this account:`);
    for (const candidate of all) say(`  ${candidate.name} — ${(candidate.domains ?? []).join(', ')}`);
    say('\nSet CF_PAGES_PROJECT to pick one.');
    process.exit(1);
  }

  // The list response is a summary; the bindings live on the full record.
  project = await cf(`/accounts/${CF_ACCOUNT_ID}/pages/projects/${project.name}`);
}

const production = project.deployment_configs?.production ?? {};
const build = project.build_config ?? {};
const rootDir = build.root_dir ?? '';
const image = production.build_image_major_version;

say(`${project.name} — ${(project.domains ?? []).join(', ')}`);
say(`  Production branch   ${project.production_branch}`);
say(`  Build command       ${build.build_command ?? '(none)'}`);
say(`  Output directory    ${build.destination_dir ?? '(none)'}`);
say(`  Root directory      ${rootDir === '' ? '/ (repository root)' : rootDir}`);
say(`  Build image         v${image ?? '(unset — the account default)'}`);
say(`  KV bindings         ${Object.keys(production.kv_namespaces ?? {}).join(', ') || '(none)'}`);
say(`  Env vars            ${Object.keys(production.env_vars ?? {}).join(', ') || '(none)'}`);

/* ----------------------------------------------------------------- the diagnosis */

const plan = [];
const patch = { build_config: {}, deployment_configs: { production: {} } };
const target = patch.deployment_configs.production;

/*
 * Two settings can stop Pages compiling functions/ even though the file is
 * committed and the static build succeeds. Both are only visible from here.
 *
 * Root directory is the one that matters most: Pages looks for functions/
 * inside it, so anything other than the repository root means it looks in a
 * place this repository does not put them and finds nothing to build. There is
 * no error for that — an empty functions directory is a legitimate project.
 */
const rootWrong = !['', '.', '/'].includes(rootDir.trim());
if (rootWrong) {
  plan.push(`Root directory is "${rootDir}" — functions/ is at the repository root, so ` +
    'Pages is looking somewhere that has none. Set it to /.');
  patch.build_config.root_dir = '';
}

if (image !== undefined && image < 2) {
  plan.push(`Build image is v${image}. Functions need v2. Set it to 2.`);
  target.build_image_major_version = 2;
}

if (state === 'no-function' && !rootWrong && (image === undefined || image >= 2)) {
  plan.push(
    'The endpoint 404s but neither setting explains it. Next: the build log for the ' +
      'most recent deployment, which names a compile error if there is one — ' +
      `https://dash.cloudflare.com/${CF_ACCOUNT_ID}/pages/view/${project.name}`,
  );
}

/* The KV namespace, which is the part that turns a 503 into a working endpoint. */
const bound = production.kv_namespaces?.[BINDING]?.namespace_id;
let namespaceId = bound;

if (bound && !FORCE) {
  say(`\n${BINDING} is already bound to ${bound}.`);
} else {
  const namespaces = await cf(`/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces?per_page=100`);
  const existing = namespaces.find((namespace) => namespace.title === KV_TITLE);

  if (existing) {
    namespaceId = existing.id;
    plan.push(`Bind ${BINDING} to the existing "${KV_TITLE}" namespace (${existing.id}).`);
  } else {
    namespaceId = null;
    plan.push(`Create the "${KV_TITLE}" KV namespace and bind it as ${BINDING}.`);
  }
}

if (production.env_vars?.[SALT] && !FORCE) {
  say(`${SALT} is already set. Leaving it alone — rotating it would orphan today's dedupe`);
  say('hashes, which is harmless but pointless.');
} else {
  plan.push(`Generate a 32-byte ${SALT} and set it as a secret. It is never printed here.`);
}

step(APPLY ? 'Applying' : 'What --apply would do');

if (plan.length === 0) {
  say('Nothing. The project is configured.');
} else {
  for (const line of plan) say(`  • ${line}`);
}

if (!APPLY) {
  say('\nRun again with --apply to make these changes.');
  process.exit(0);
}

/*
 * Nothing to change is not the same as nothing to say: the namespace id below
 * is what the daily job needs, and it is the thing somebody comes back here
 * looking for. But an empty PATCH is still a write, and writing to a live
 * project to achieve nothing is how you end up unsure what you changed.
 */
if (plan.length === 0) {
  say(`\n${BINDING} is bound to ${namespaceId}. Nothing was sent.`);
  process.exit(state === 'working' ? 0 : 1);
}

/* ------------------------------------------------------------------- applying */

if (namespaceId === null) {
  const created = await cf(`/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces`, {
    method: 'POST',
    body: JSON.stringify({ title: KV_TITLE }),
  });
  namespaceId = created.id;
  say(`Created the KV namespace: ${namespaceId}`);
}

if (namespaceId && namespaceId !== bound) {
  target.kv_namespaces = { [BINDING]: { namespace_id: namespaceId } };
}

if (!production.env_vars?.[SALT] || FORCE) {
  target.env_vars = { [SALT]: { type: 'secret_text', value: randomBytes(32).toString('hex') } };
}

/*
 * Production only, unless --preview.
 *
 * A preview deployment sharing the namespace would write test reports into the
 * same keyspace the daily job weighs, and a report filed against a branch
 * preview is not evidence of anything. An unbound preview answers 503, which is
 * the honest state for it to be in.
 */
if (PREVIEW) {
  patch.deployment_configs.preview = { ...target };
  say('Binding preview as well, as asked. Its reports land in the same namespace.');
}

if (Object.keys(patch.build_config).length === 0) delete patch.build_config;

await cf(`/accounts/${CF_ACCOUNT_ID}/pages/projects/${project.name}`, {
  method: 'PATCH',
  body: JSON.stringify(patch),
});

say('Project updated.');

/* ---------------------------------------------------------------- what is left */

step('Still yours to do');

say('Add the namespace id to the repository secrets, so the daily job can read the');
say('reports it now collects — Settings → Environments → Devtool Analytics:');
say('');
say(`  gh secret set CF_KV_NAMESPACE_ID --env "Devtool Analytics" --body ${namespaceId}`);
say('');
say('and give CF_API_TOKEN "Workers KV Storage: Read" if it does not have it.');

/*
 * Bindings attach to deployments, not to projects, so the running deployment
 * cannot see one that was added after it was built. Without this step the
 * endpoint keeps answering exactly as it did before and the setup looks broken.
 */
if (!REDEPLOY) {
  say('\nBindings only reach a deployment built after they existed, so the live site is');
  say('unchanged until the next one. Push anything, or run this again with --redeploy.');
  process.exit(0);
}

step('Redeploying');

const form = new FormData();
form.set('branch', project.production_branch);

const deployment = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/pages/projects/${project.name}/deployments`,
  { method: 'POST', headers: { Authorization: `Bearer ${CF_API_TOKEN}` }, body: form },
).then((res) => res.json());

if (!deployment.success) {
  say('Could not start a deployment. Push a commit instead — the settings are saved.');
  process.exit(1);
}

const id = deployment.result.id;
say(`Deployment ${id} started. A build here usually takes about ninety seconds.`);

/* Poll rather than sleep-and-hope: a failed build is invisible from outside. */
for (let attempt = 0; attempt < 40; attempt += 1) {
  await new Promise((resolve) => setTimeout(resolve, 15_000));

  const current = await cf(
    `/accounts/${CF_ACCOUNT_ID}/pages/projects/${project.name}/deployments/${id}`,
  );
  const stage = current.latest_stage ?? {};
  say(`  ${stage.name ?? 'queued'}: ${stage.status ?? 'unknown'}`);

  if (stage.status === 'failure') {
    say('\nThe build failed. The previous deployment is still serving the site.');
    process.exit(1);
  }

  if (stage.name === 'deploy' && stage.status === 'success') {
    step('Probing again');
    const after = await probe();

    if (after !== 'working') {
      say('\nThe settings above are saved, so this state is the next thing to explain');
      say('rather than a reason to run this again. The build log is where it will be.');
    }

    process.exit(after === 'working' ? 0 : 1);
  }
}

say('\nStill building after ten minutes. Check the dashboard.');
process.exit(1);
