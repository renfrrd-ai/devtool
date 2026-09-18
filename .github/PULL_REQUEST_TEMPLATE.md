<!--
A checklist, not a form to obey. Delete whichever half does not apply, and
delete any line that is beside the point — an accurate short PR beats a
complete-looking one. Full guide: CONTRIBUTING.md
-->

## What this changes

<!-- One or two sentences. If it needs more, it may be two pull requests. -->

## Adding or editing a tool

- [ ] The `description` says where the catch is — the trade-off, or who it is genuinely
      not for — rather than restating the tagline at greater length
- [ ] The `tagline` is under 95 characters, has no trailing full stop, and no "powerful"
      or "modern"
- [ ] `categories` has the primary one first, and `pricing` / `openSource` are set
      independently of each other
- [ ] `npm run logos` has been run, and the icon is committed
- [ ] A row added to the shelf's `comparison.rows`, or deliberately left out

## Changing the site

- [ ] No client-side JavaScript beyond the theme toggle, or the PR explains why this is
      the exception
- [ ] Colours come from the tokens in `src/styles/global.css`, and both themes were
      looked at
- [ ] Checked at 320px
- [ ] If it reverses something in `docs/decisions.md`, the PR says which one and why

## Both

- [ ] `npm run build` passes locally (`check:entries`, then `astro check`)
- [ ] Docs updated if this changes how something works

## What I could not check

<!--
Genuinely useful, and never held against anyone. "I have no dark-mode display"
or "I could not test the report endpoint without the KV binding" saves the
review from assuming otherwise.
-->
