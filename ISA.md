---
project: atscale-advisors-website
slug: atscale-website-v1
effort: E4
phase: execute
progress: deploy-live | backend-pending
mode: build
started: 2026-06-02T05:48:00Z
updated: 2026-06-02T22:30:00Z
iteration: 8
session_state: /home/ecoleman/Projects/website/RESUME_HERE.md
---

# atScale Advisors Website — ISA

## Problem

The current www.atscale-advisors.com site is hosted on Squarespace, costs $200-400/yr, and renews 2026-06-15. Eugene uses none of Squarespace's value-added features (ecommerce, templates-for-non-coders). It is, functionally, a brochure host. Meanwhile, the GTM strategy requires a scored diagnostic with custom logic, dollar-quantified results, and full data ownership — capabilities Squarespace forms (and Tally) cannot deliver without either a paid plan or branded-vendor friction. The constraint that made Tally + Squarespace the right call (June 2026-05-26) has been relaxed by Eugene's decision to drop Squarespace entirely. The new constraint set yields a different optimum: a static site + Apps Script backend, hosted on Cloudflare Pages, with the diagnostic built into the site.

## Vision

Eugene wakes up to a complete, working, branded multi-page site sitting in `/home/ecoleman/Projects/website/`, ready for Cloudflare Pages deploy. The diagnostic is a full first-class page with the 19-question scored assessment, custom Replication Wall positioning, and a Google Sheets backend pre-wired (one URL swap away from live). A morning checklist walks him through the 6-8 manual steps he must do (Cloudflare account, GitHub repo, Apps Script deploy, Google Workspace DNS, Squarespace cancel). The euphoric surprise: every page is genuinely on-brand (Architect's Blueprint colors, Space Grotesk + Inter + Plex Mono, blueprint grid, bronze CTAs), the diagnostic UX feels like a real product not a form, and the build is small enough that he can read every file and trust it. The site IS the credibility now — "I built this" is the signal.

## Out of Scope

- React, Vue, Next.js, or any SPA framework. Plain HTML/CSS/vanilla JS only.
- Build step (Vite, webpack, parcel). The repo as-checked-out is the deployed artifact.
- Tailwind CDN. Hand-written CSS using the documented Architect's Blueprint tokens.
- CMS layer. Content is in HTML files, edited directly.
- Beehiiv integration. Deferred per existing decision (2026-05-26) until ~10+ leads/week.
- Tally embed. Replaced by native diagnostic. All Tally references in build plan files are now stale (handled in LEARN).
- Per-stage results pages. v1 renders a single results page with the stage filled in dynamically.
- PDF email attachment. v1 sends the structured payload to Eugene; the auto-PDF + auto-stage-email arc is v2.
- Auth or accounts. The diagnostic is fully public-anonymous.
- Analytics scripts. Cloudflare Pages gives request-count for free; deeper analytics later.
- The actual deploy. Eugene does Cloudflare account creation, GitHub push, Apps Script deploy, and DNS — those are queued as morning steps with full instructions. I do not own external service credentials.
- Logo. Wordmark in Space Grotesk is sufficient for v1; custom logo is a polish item.
- Sub-pages under /frameworks (e.g. /frameworks/replication-wall). v1 is the index.
- Squarespace migration step. Eugene cancels Squarespace himself after Cloudflare site is live.

## Principles

- **Brutalism over polish.** Owner-operators trust the typography and the data, not the gloss. Cut animation budget; spend it on clarity.
- **The site IS the proof.** Every credibility claim ("Revenue Systems Architect," "I build systems") is undercut if the site looks bought. Hand-built signals belief.
- **One source of truth.** Each piece of content lives in exactly one HTML file. No partials engine, no includes. Easy to edit. Easy to grep. Easy to trust.
- **Mobile-first because owners read on phones.** LinkedIn-comment traffic clicks through on mobile.
- **Lead with the problem, never the methodology.** Hero of every page (except About) starts with the buyer's pain.
- **Friction is a feature where it self-disqualifies.** The Contact page's "What I don't accept" is not abrasive — it's a self-disqualification filter that increases conversion on the right-fit reader.
- **Data ownership is non-negotiable.** Every diagnostic submission is OUR row in OUR Sheet. No vendor between Eugene and the lead.
- **Pre-wire everything Eugene can't do at 4am.** He should wake up to a checklist of clicks, not a checklist of design decisions.

## Constraints

- **Hosting:** Cloudflare Pages free tier. No build command. Deploy from `main` branch root.
- **Backend:** Google Apps Script Web App. Eugene's Google Workspace account. Free tier.
- **Storage:** Google Sheet owned by Eugene. Schema designed for later CRM import.
- **Email notify:** Apps Script's MailApp / GmailApp to Eugene's address. No SendGrid/Mailgun.
- **Fonts:** Google Fonts CDN. Space Grotesk + Inter + IBM Plex Mono. Loaded with `display=swap` to avoid FOIT.
- **Browser support:** modern evergreen (Chrome/Safari/Edge/Firefox last 2 years). No IE.
- **Accessibility:** WCAG AA color contrast. Semantic HTML. Keyboard-navigable diagnostic. ARIA where progress + form state need it.
- **No client-side dependencies beyond fonts.** No jQuery, no Bootstrap, no analytics SDK at v1.
- **Domain:** atscale-advisors.com staying with Eugene. Redirect from Google Workspace DNS to Cloudflare Pages.
- **Repo:** initialized at `/home/ecoleman/Projects/website/`. Eugene pushes to GitHub under `eugeniousC` himself; I prep the commit but don't push (autonomy rule).
- **Content lock:** all five page drafts (Home, About, Services, Frameworks, Insights, Contact) and the diagnostic spec already exist in `~/.claude/PAI/USER/PROJECTS/atscale-advisors/*_v1.md` and are CANONICAL.

## Goal

Ship a deployable static `/home/ecoleman/Projects/website/` repository tonight that, after Eugene executes a pre-written morning checklist, will live on Cloudflare Pages at his existing domain — replacing Squarespace before 2026-06-15 renewal — with a native, custom-scored diagnostic page whose submissions land in his Google Sheet and trigger an email notification to him, with stage-mapped Replication Wall positioning rendered inline.

## Criteria

### Content & Structure

- [ ] ISC-1: `index.html` exists at project root
- [ ] ISC-2: `about.html` exists at project root
- [ ] ISC-3: `services.html` exists at project root
- [ ] ISC-4: `frameworks.html` exists at project root
- [ ] ISC-5: `insights.html` exists at project root
- [ ] ISC-6: `contact.html` exists at project root
- [ ] ISC-7: `diagnostic.html` exists at project root
- [ ] ISC-8: `css/styles.css` exists
- [ ] ISC-9: `js/diagnostic.js` exists
- [ ] ISC-10: `assets/replicationWall.png` exists (copied from atscale-advisors project)
- [ ] ISC-11: `apps-script/Code.gs` exists
- [ ] ISC-12: `apps-script/README.md` exists with deploy instructions
- [ ] ISC-13: `README.md` exists at project root
- [ ] ISC-14: `WAKEUP-CHECKLIST.md` exists at project root
- [ ] ISC-15: `.gitignore` exists at project root
- [ ] ISC-16: `_redirects` file exists for Cloudflare Pages routing (or absence is justified)
- [ ] ISC-17: `_headers` file exists with basic security headers (CSP-lite, X-Frame-Options)

### Shared shell & nav

- [ ] ISC-18: Every page includes the same nav: Home · Frameworks · Insights · Services · About · Contact + Take the Diagnostic CTA
- [ ] ISC-19: Nav highlights the current page (aria-current="page")
- [ ] ISC-20: Mobile nav collapses to a hamburger toggle below 768px
- [ ] ISC-21: Every page includes a footer with `eugene@atscale-advisors.com` and a LinkedIn link placeholder
- [ ] ISC-22: Every page has `<title>` and `<meta name="description">` set per spec
- [ ] ISC-23: Every page declares `<html lang="en">` and `<meta charset="utf-8">` and viewport meta
- [ ] ISC-24: Every page references `/css/styles.css` (or relative `./css/styles.css`)

### Design system tokens — CSS

- [ ] ISC-25: CSS defines `--ink: #0F2238` (navy primary)
- [ ] ISC-26: CSS defines `--body: #1C2B3A` (body text)
- [ ] ISC-27: CSS defines `--slate: #44566B` (muted)
- [ ] ISC-28: CSS defines `--surface: #FFFFFF` (white)
- [ ] ISC-29: CSS defines `--paper: #F4F7FA` (paper tint)
- [ ] ISC-30: CSS defines `--bronze: #B0762F` (accent CTA)
- [ ] ISC-31: CSS defines `--bronze-text: #8A5B22` (small-text-safe bronze)
- [ ] ISC-32: CSS defines `--blueprint-line: #C7D6E4` (grid line)
- [ ] ISC-33: CSS defines `--leak-rust: #A8412A` (cost-of-Wall figures)
- [ ] ISC-34: CSS defines `--steel-teal: #2E6E6A` (Stage 3+ accent)
- [ ] ISC-35: CSS loads Space Grotesk (Medium/Bold) for headings via Google Fonts
- [ ] ISC-36: CSS loads Inter (Regular/Medium) for body via Google Fonts
- [ ] ISC-37: CSS loads IBM Plex Mono for figures via Google Fonts
- [ ] ISC-38: Headings use Space Grotesk
- [ ] ISC-39: Body uses Inter
- [ ] ISC-40: `.figure`, dollar amounts, scores use Plex Mono
- [ ] ISC-41: Blueprint grid background is implemented (`.blueprint-bg`) per design spec
- [ ] ISC-42: Buttons are squared (not pills) with bronze fill, white text
- [ ] ISC-43: Framework cards have thin navy border + small blueprint corner ticks
- [ ] ISC-44: Section dividers use thin bronze rule
- [ ] ISC-45: Body copy max-width 65ch for readability
- [ ] ISC-46: Mobile breakpoints at 768px and 480px

### Homepage content

- [ ] ISC-47: Hero headline reads "You're working harder every quarter just to grow a little."
- [ ] ISC-48: Hero subhead names the Replication Wall™ as the cause
- [ ] ISC-49: Hero primary CTA "Take the Diagnostic →" links to `/diagnostic.html`
- [ ] ISC-50: Hero secondary CTA "Read the frameworks →" links to `/frameworks.html`
- [ ] ISC-51: 6-item pain checklist for $3M-$15M trades/field-service
- [ ] ISC-52: Replication Wall™ section with cost-of-the-Wall figure (15-30% of revenue) styled in leak-rust
- [ ] ISC-53: "How it works" — 3-step (Diagnostic → Readout → Choose depth)
- [ ] ISC-54: "Who this is for" — explicit ICP statement
- [ ] ISC-55: "If you already have a coach, Chair, or Implementer" coexistence section
- [ ] ISC-56: Founder credibility paragraph with $154M ARR + named enterprise list
- [ ] ISC-57: Michael B. testimonial verbatim
- [ ] ISC-58: Closing CTA reiterates diagnostic link

### About page content

- [ ] ISC-59: Lede positions Eugene as enterprise-pattern-translator for SMB
- [ ] ISC-60: Numbers list ($154M, $63M+, $330M+, $1M unlocked, 31% reduction, 3x faster, ISC DataMed exit)
- [ ] ISC-61: "Why I do this" section
- [ ] ISC-62: "Who I work with" — ICP repeated
- [ ] ISC-63: Personal section (Krissy, cooking, drums, fishing, music tastes)
- [ ] ISC-64: "What I believe" bullets
- [ ] ISC-65: Contact + diagnostic CTA at bottom

### Services page content

- [ ] ISC-66: Five rungs with transparent prices visible
- [ ] ISC-67: Rung 1 (Growth Friction Diagnostic) links to `/diagnostic.html`
- [ ] ISC-68: Rung 2 (Friction Diagnostic Session $3,500) Calendly anchor matches LIVE_URLS slug `friction-diagnostic-session`
- [ ] ISC-69: Rungs 3-5 (Foundation Audit / Revenue Architecture / Embedded Advisory) link to Strategy Discovery calendly
- [ ] ISC-70: "How engagements actually run" section
- [ ] ISC-71: "What I don't do" section
- [ ] ISC-72: Trademark symbols (™) retained on framework names

### Frameworks page content

- [ ] ISC-73: Replication Wall™ section + Diagnostic CTA
- [ ] ISC-74: Growth Friction Diagnostic™ summary with 4 dimensions listed
- [ ] ISC-75: Foundation First™ 3-stage model
- [ ] ISC-76: Revenue Intelligence Maturity Curve™ 5-stage table with leakage rates
- [ ] ISC-77: Scale Readiness Curve™ 40-point table
- [ ] ISC-78: Operations → Replication → Intelligence → Automation sequencing rule (Wall sits between Replication and Intelligence)
- [ ] ISC-79: "How they connect" tie-back paragraph
- [ ] ISC-80: replicationWall.png image rendered inline (with alt text)

### Insights page content

- [ ] ISC-81: Section header + 2-essays-a-month cadence statement
- [ ] ISC-82: Subscribe placeholder (Beehiiv DEFERRED — visible but disabled with note)
- [ ] ISC-83: Latest essay placeholder (Post 001 stub)
- [ ] ISC-84: Coming-this-launch-series listing (5 future titles)
- [ ] ISC-85: "What you'll find" + "What you won't find" sections
- [ ] ISC-86: Diagnostic CTA at bottom

### Contact page content

- [ ] ISC-87: Three-bucket intent routing (prospect / press / peer)
- [ ] ISC-88: Prospect path → diagnostic + Strategy Discovery
- [ ] ISC-89: Press path → `mailto:eugene@atscale-advisors.com`
- [ ] ISC-90: Peer path → `mailto:eugene@atscale-advisors.com`
- [ ] ISC-91: "What I don't accept" section
- [ ] ISC-92: Response time + office hours
- [ ] ISC-93: No contact form (deliberate per spec)
- [ ] ISC-94: No phone number (deliberate per spec)

### Diagnostic — structure

- [ ] ISC-95: Welcome screen with what-to-expect (~5 min, free, no call)
- [ ] ISC-96: 7 pre-questions rendered in order (P1-P7)
- [ ] ISC-97: 12 diagnostic questions rendered in order (Q1-Q12)
- [ ] ISC-98: Progress indicator visible on every question (e.g. "3 / 19")
- [ ] ISC-99: One-question-per-screen flow
- [ ] ISC-100: Back button on every question after the first
- [ ] ISC-101: Forward button disabled until answer chosen
- [ ] ISC-102: Required fields validated (P1-P4 cannot be empty)
- [ ] ISC-103: Email field validates format
- [ ] ISC-104: Industry-conditional wording: P6 ∈ {Pro Services, Manufacturing} swaps "jobs" → "engagements/projects" on Q4/Q5/Q6
- [ ] ISC-105: All option labels for Q1-Q12 match the canonical spec verbatim
- [ ] ISC-106: Form state persisted in `sessionStorage` so a back-button refresh doesn't lose data

### Diagnostic — scoring engine

- [ ] ISC-107: Each Q1-Q12 answer maps to integer 1-4
- [ ] ISC-108: Total score = sum of Q1-Q12, range 12-48
- [ ] ISC-109: Dimension 1 (Revenue Engine) = Q1+Q2+Q3, range 3-12
- [ ] ISC-110: Dimension 2 (Delivery & Ops) = Q4+Q5+Q6, range 3-12
- [ ] ISC-111: Dimension 3 (Systems & Data) = Q7+Q8+Q9, range 3-12
- [ ] ISC-112: Dimension 4 (Leadership & Accountability) = Q10+Q11+Q12, range 3-12
- [ ] ISC-113: Stage mapping uses canonical bands: 12-17 / 18-28 / 29-39 / 40-45 / 46-48
- [ ] ISC-114: Stage 1 label = "Reactive Chaos"
- [ ] ISC-115: Stage 2 label = "Dashboard Theater"
- [ ] ISC-116: Stage 3 label = "Revenue Operating System"
- [ ] ISC-117: Stage 4 label = "Intelligent Acceleration"
- [ ] ISC-118: Stage 5 label = "Autonomous Scale"
- [ ] ISC-119: Cost-of-Wall calc uses revenue band midpoint × stage leakage midpoint ± 20%
- [ ] ISC-120: Primary leak zone = lowest-scoring dimension (ties broken in order: Revenue, Delivery, Systems, Leadership)

### Diagnostic — results UX

- [ ] ISC-121: Results screen shows stage name + italicized tagline
- [ ] ISC-122: Results screen shows total score "N/48"
- [ ] ISC-123: Cost-of-Wall range rendered in leak-rust Plex Mono ("$X – $Y annually")
- [ ] ISC-124: 4-bar dimension chart rendered (primary leak zone labeled)
- [ ] ISC-125: Stage 2 (Dashboard Theater) results copy explicitly names "You're hitting the Replication Wall"
- [ ] ISC-126: Stage-specific CTA: Stage 1 → Foundation Check-in Calendly; Stage 2 → Friction Diagnostic Session Calendly; Stage 3+ → Strategy Discovery Calendly
- [ ] ISC-127: replicationWall.png shown on results page with respondent's position marked (or annotated text)

### Diagnostic — backend integration

- [ ] ISC-128: On submit, POST JSON to a configurable `APPS_SCRIPT_URL` constant in diagnostic.js
- [ ] ISC-129: POST body includes all P1-P7 + Q1-Q12 + total + 4 dimension subs + stage + cost-of-Wall low + cost-of-Wall high + timestamp
- [ ] ISC-130: Form shows "Sending..." state during POST
- [ ] ISC-131: On success, results render even if POST failed (graceful degradation — submission was attempted, user sees their score)
- [ ] ISC-132: Failure case logged to `console.error` (so Eugene can debug from devtools)

### Apps Script backend

- [ ] ISC-133: `Code.gs` exports `doPost(e)` handler
- [ ] ISC-134: `doPost` parses JSON body
- [ ] ISC-135: `doPost` appends a row to a named Sheet (sheet name + headers documented)
- [ ] ISC-136: `doPost` sends Eugene an email via MailApp.sendEmail with full payload + triage subject
- [ ] ISC-137: `doPost` returns `{ success: true }` as JSON
- [ ] ISC-138: `doGet(e)` returns a "atScale diagnostic backend OK" string for healthcheck
- [ ] ISC-139: README documents the "Anyone, even anonymous" deploy setting and the 30-second test curl

### Deploy & ops

- [ ] ISC-140: WAKEUP-CHECKLIST.md walks Eugene through every manual step in execution order
- [ ] ISC-141: Each checklist step has a verification ("test it works") sub-step
- [ ] ISC-142: README.md documents the architecture so future-Eugene can edit confidently

### Anti-criteria (must NOT happen)

- [ ] ISC-A1: Anti: No React, Vue, Next.js, Tailwind CDN, or any framework — plain HTML/CSS/JS only
- [ ] ISC-A2: Anti: No tracking pixel, analytics SDK, or third-party JavaScript beyond Google Fonts
- [ ] ISC-A3: Anti: No build step — repo root is what gets deployed
- [ ] ISC-A4: Anti: No reference to Tally, Typeform, or Squarespace in shipped HTML
- [ ] ISC-A5: Anti: No placeholder Lorem Ipsum — every word is real shipped content from the v1 specs
- [ ] ISC-A6: Anti: No mock test data left in the Apps Script or diagnostic.js
- [ ] ISC-A7: Anti: No git push to remote (Eugene's autonomy boundary)
- [ ] ISC-A8: Anti: No Cloudflare account creation, no DNS edits, no Squarespace cancellation — all queued for Eugene's morning

## Test Strategy

| ISC range | Verification approach |
|-----------|----------------------|
| ISC-1..17 | `ls` / `test -f` per file |
| ISC-18..24 | `grep` shared markers across every HTML file |
| ISC-25..46 | `grep --` on `css/styles.css` for each token + each component class |
| ISC-47..94 | `grep` for distinctive content phrases in respective HTML files |
| ISC-95..132 | Read `diagnostic.html` and `js/diagnostic.js` and verify each requirement |
| ISC-133..139 | Read `apps-script/Code.gs` and `apps-script/README.md` and verify |
| ISC-140..142 | Read `WAKEUP-CHECKLIST.md` and `README.md` |
| ISC-A1..A8 | `grep -i` for forbidden strings; `git log` shows no remote push |

## Features

| Feature | Description | Satisfies | Depends on | Parallelizable |
|---------|-------------|-----------|------------|----------------|
| F1: Repo scaffold | Directory tree, .gitignore, README skeleton | ISC-13..17 | none | no |
| F2: Design system CSS | All tokens + components | ISC-25..46 | F1 | no |
| F3: Site shell | Shared nav + footer pattern embedded per page | ISC-18..24 | F2 | no |
| F4: Homepage | index.html | ISC-1, 47..58 | F3 | yes (with F5..F9) |
| F5: About page | about.html | ISC-2, 59..65 | F3 | yes |
| F6: Services page | services.html | ISC-3, 66..72 | F3 | yes |
| F7: Frameworks page | frameworks.html | ISC-4, 73..80 | F3, F11 | yes |
| F8: Insights page | insights.html | ISC-5, 81..86 | F3 | yes |
| F9: Contact page | contact.html | ISC-6, 87..94 | F3 | yes |
| F10: Diagnostic UI | diagnostic.html | ISC-7, 95..106 | F3 | yes (with F11) |
| F11: Asset copy | replicationWall.png copied | ISC-10 | F1 | yes |
| F12: Scoring engine | js/diagnostic.js scoring + submit + render | ISC-107..132 | F10 | no |
| F13: Apps Script | Code.gs + deploy README | ISC-133..139 | none | yes |
| F14: Morning checklist | WAKEUP-CHECKLIST.md | ISC-140..142 | F12, F13 | no |
| F15: Forge code review | GPT-5.4 review of HTML/JS/Apps Script | quality | F12, F13 | yes |
| F16: Cato cross-vendor | E4 mandatory audit | doctrine | all | no |

## Decisions

- 2026-06-02T05:50:00Z — **Hosting:** Cloudflare Pages over GitHub Pages. Reason: built-in analytics, edge speed, Workers as future escape hatch. Cost identical ($0). Eugene's call confirmed.
- 2026-06-02T05:50:00Z — **No framework, no build step.** Hand-written HTML/CSS/JS. Reason: the site is small enough; build complexity buys nothing; Eugene must be able to read/edit any file. Aligns with brand ("I build systems").
- 2026-06-02T05:50:00Z — **One file per page at root.** No `/src` or partials engine. Reason: Cloudflare Pages serves from repo root by default; partials engine is premature abstraction.
- 2026-06-02T05:50:00Z — **Apps Script backend over Cloudflare Workers.** Reason: Eugene already has Google Workspace; Sheet is the destination; one fewer service to learn. Workers is the v2 path if Apps Script daily-quota becomes a problem.
- 2026-06-02T05:50:00Z — **Diagnostic is one page with `?step=N` state, not multiple pages.** Reason: simpler routing, browser back button works via sessionStorage, no Cloudflare Pages redirect rules needed.
- 2026-06-02T05:50:00Z — **No partials, no template engine, copy nav+footer per page.** Reason: 7 pages, 7 copies, total ~30 lines duplicated. Maintenance cost lower than a templating decision Eugene now has to learn.
- 2026-06-02T05:50:00Z — **No client-side third-party libs.** No jQuery, no Bootstrap. Reason: contradicts the "I build systems" credibility signal and adds a download.
- 2026-06-02T05:50:00Z — **I do NOT push to remote.** Per DA autonomy rules: git push needs explicit Eugene approval. I prep the commit; he reviews and pushes in the morning. This is a real boundary, not theater.
- 2026-06-02T05:50:00Z — **Diagnostic POST is best-effort.** If the Apps Script endpoint is unreachable, the user still sees their results. The user experience does not depend on the network. (Eugene loses that one lead; he gets the next one.)
- 2026-06-02T05:50:00Z — **No `/diagnostic` SEO path nicety yet.** It's `diagnostic.html` at root; if Eugene wants clean URLs later he adds a `_redirects` line.

## Changelog

(Populated at LEARN per ISA skill conjecture/refutation/learning format.)

## Verification

(Populated during EXECUTE/VERIFY with per-ISC evidence.)
