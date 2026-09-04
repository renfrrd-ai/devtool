# devtool.fyi — Project Description

> **Historical document.** The site's scope has since widened from a portfolio of
> Renfred's own tools to a curated directory of developer tools generally, with his own in
> a Built here section. See [D0 in decisions.md](decisions.md#d0--the-site-is-a-curated-directory-not-a-portfolio-supersedes-the-prds-premise)
> for what changed and what survived. This file is kept as written, not updated.

## Overview
devtool.fyi is a hub and directory site showcasing developer tools built and maintained by Renfred Alonge. It serves as a single, discoverable front door for an expanding portfolio of independent products — starting with Clueline, hqbase.io, and trueluk.com — so that visitors, potential users, and collaborators can see the full body of work in one place instead of stumbling on each tool separately.

## Problem
Right now, each tool lives on its own domain with no connective tissue between them. There's no single place that says "these are all made by the same person/team," which means:
- No cross-promotion between tools (someone who likes Clueline has no easy path to discover hqbase or trueluk)
- No credibility signal — a visitor landing on one tool in isolation can't see it's part of a broader, actively maintained toolkit
- Wasted domain investments — domains like trueluk.com sit idle with nothing pointing to or from them

## Solution
A lightweight, fast-loading directory/landing page at devtool.fyi that lists each tool with:
- Name and logo/wordmark
- One-line description of what it does and who it's for
- Status badge (e.g., Live, Beta, Coming Soon, Idea)
- Outbound link to the tool's own domain

## Goals
- Give every tool a shared home base that builds compound credibility as the portfolio grows
- Make it trivial to add a new tool later — the site should scale by just adding a card/entry
- Drive discovery traffic between tools (visitors of one tool find the others)
- Act as a personal/professional showcase — a de facto "portfolio of dev tools"

## Initial Scope (v1)
- Single-page directory: hero/intro + grid or list of tool cards
- Entries for:
  - **Clueline** (clueline.dev) — AI-powered error management/translation tool
  - **hqbase.io** — status/description TBD
  - **trueluk.com** — placeholder entry (status: Idea / Coming Soon) since no product is built yet
- Simple, clean design — no heavy framework needed; static site is sufficient for v1
- Mobile-responsive

## Out of Scope (for now)
- User accounts, search, or filtering (not needed until the tool count grows significantly)
- Blog or content section
- Analytics dashboards beyond basic page-view tracking

## Open Questions
- What exactly is hqbase.io, and what's its one-liner?
- What should trueluk.com actually become — is the domain name itself a hint at the product idea, or is it still undecided?
- Visual identity: should devtool.fyi have its own distinct branding, or should it borrow visual language from the tools it lists?

## Success Criteria
- devtool.fyi is live and listing at least the 3 known domains
- Each tool's own site links back to devtool.fyi (and vice versa)
- Adding a new tool in the future takes under 15 minutes of work
