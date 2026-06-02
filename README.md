# atScale Advisors — website

The static site for atScale Advisors LLC. Replaces the Squarespace install at www.atscale-advisors.com with a hand-built version hosted on Cloudflare Pages.

> **First time landing here?** Open `WAKEUP-CHECKLIST.md`. That's the guided walkthrough from "files on disk" to "live site." This README is the longer reference.

## What's in here

```
website/
├── index.html              Homepage (Replication Wall hero)
├── about.html              Eugene bio + credibility surface
├── services.html           Five-rung offer ladder with transparent pricing
├── frameworks.html         Replication Wall, Diagnostic, Foundation First, sequencing
├── insights.html           Publication archive + cadence
├── contact.html            Intent-routed (prospect / press / peer)
├── diagnostic.html         Assessment shell (JS-rendered)
│
├── css/styles.css          Architect's Blueprint design system
├── js/diagnostic.js        Questions, scoring, results, POST to backend
├── assets/replicationWall.png
│
├── apps-script/
│   ├── Code.gs             Google Apps Script backend
│   └── README.md           Backend deploy walkthrough
│
├── _redirects              Cloudflare Pages clean URLs (/about → /about.html)
├── _headers                Security headers (CSP, X-Frame, Permissions-Policy)
├── .gitignore
├── ISA.md                  Thomas's full project spec (12 sections, 142 criteria)
├── README.md               You are here
└── WAKEUP-CHECKLIST.md     Step-by-step launch checklist for Eugene
```

## Architecture

- **Hosting:** Cloudflare Pages free tier. Auto-deploy on push to `main`.
- **Frontend:** plain HTML5 + CSS3 + vanilla JS. **No framework. No build step.** What's on disk is what's served.
- **Fonts:** Google Fonts CDN (Inter / Space Grotesk / IBM Plex Mono) with `display=swap`.
- **Backend:** Google Apps Script Web App receives diagnostic POSTs, appends to a Sheet, emails Eugene.
- **Domain:** `atscale-advisors.com` — DNS managed via Google Workspace or Cloudflare (see WAKEUP-CHECKLIST §6).

### Why no framework?

The site is a brochure plus one stateful page (the diagnostic). React's tax (build, hydrate, ~50KB JS minimum, mental model) buys nothing here. Plain HTML/CSS/JS is:
- Editable in any text editor
- Diffable in git
- Inspectable by reading
- Fast (no JS at all on the marketing pages)

Anyone who can read HTML can fix a typo. That's the brand premise — "I build systems" — applied to its own publishing layer.

### Design system

Locked in `DESIGN_SYSTEM_v1.md` in the broader atScale project notes. Summary:

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#0F2238` | Navy primary, headings, dark sections |
| `--body` | `#1C2B3A` | Body text |
| `--slate` | `#44566B` | Muted captions |
| `--surface` | `#FFFFFF` | White |
| `--paper` | `#F4F7FA` | Section alternation |
| `--bronze` | `#B0762F` | CTAs, highlights |
| `--bronze-text` | `#8A5B22` | Small bronze text (contrast-safe) |
| `--blueprint-line` | `#C7D6E4` | Grid background lines |
| `--leak-rust` | `#A8412A` | Cost-of-Wall figures (sparing) |
| `--steel-teal` | `#2E6E6A` | Stage 3+ positive cues (sparing) |

Fonts: Space Grotesk (headings, brand), Inter (body), IBM Plex Mono (figures, scores, technical labels).

## The diagnostic

`diagnostic.html` is a thin shell. `js/diagnostic.js` does everything:

1. Renders welcome → identity (P1–P4 grouped) → P5–P7 → Q1–Q12 → submitting → results
2. Persists answers in `sessionStorage` (so a back-button / refresh doesn't lose data)
3. Computes total + 4 dimension subscores + stage + cost-of-Wall
4. Renders results: stage name + tagline + score + cost range + 4-bar dimension chart + stage-specific CTA
5. POSTs the full payload to `APPS_SCRIPT_URL` (best-effort; failure does NOT block results)

**Scoring math:**

| Component | Formula |
|---|---|
| Question score | 1–4 each (option index) |
| Total | sum of Q1–Q12, range 12–48 |
| Dimension subscore | sum of 3 questions, range 3–12 |
| Stage band | 12–17 → 1, 18–28 → 2, 29–39 → 3, 40–45 → 4, 46–48 → 5 |
| Cost low/high | revenue-band midpoint × stage leakage midpoint, ± 20% |
| Primary leak zone | lowest-scoring dimension (ties broken in Revenue / Delivery / Systems / Leadership order) |

**Industry-conditional wording:**

When P6 is "Professional services", "Manufacturing", or "Other", Q4/Q5/Q6 swap "jobs" → "engagements" in their prompts and option text. Scoring is identical; only the nouns change.

**Backend payload schema:**

See `COLUMNS` constant in `apps-script/Code.gs`. Sheet columns are stable; new fields go to the right.

## Editing content

- **A page's text:** edit the `.html` file directly. No partials engine, no template strings. Commit + push → Cloudflare redeploys.
- **A page's style:** edit `css/styles.css`. Tokens at the top govern everything.
- **A question's wording:** edit `QUESTIONS` array in `js/diagnostic.js`. Keep option count at 4 (the scoring assumes it).
- **A stage's CTA or interp copy:** edit `STAGES` array in `js/diagnostic.js`.
- **The notification email format:** edit `sendNotificationEmail_()` in `apps-script/Code.gs`. Redeploy the Apps Script after.

## Deploying

- **The HTML site:** `git push origin main`. Cloudflare auto-deploys in ~30-60s.
- **The Apps Script backend:** edit `Code.gs` in the Apps Script web editor → Deploy → Manage deployments → ✏️ → new version. URL stays the same.

The HTML and the backend deploy independently. You can ship a copy fix without touching the backend.

## When something breaks

- **A page is broken visually:** view source, check that `<link rel="stylesheet" href="/css/styles.css">` matches the other pages.
- **The diagnostic shows "Loading…" forever:** JS error. Open browser DevTools → Console.
- **Submissions don't reach the Sheet:** see `apps-script/README.md` § "If something is wrong".
- **The domain shows the old Squarespace site:** DNS hasn't propagated. `dig atscale-advisors.com +short` — once it shows Cloudflare's IP, you're live.

## Non-goals (deliberate omissions)

- No analytics SDK (Cloudflare Pages gives you request counts for free)
- No tracking pixels, no Pixel, no Hotjar
- No cookies (the diagnostic uses `sessionStorage`, which auto-clears on tab close)
- No marketing-automation integration (Beehiiv is deferred per the existing 2026-05-26 decision)
- No CMS (HTML is the CMS)
- No PWA / service worker (overkill at this scale)
- No client-side framework (see "Why no framework" above)

## Related project notes

The longer planning artifacts live in `~/.claude/PAI/USER/PROJECTS/atscale-advisors/`:

- `HOME_PAGE_v1.md` — homepage content spec (source of truth for the home copy)
- `ABOUT_PAGE_v1.md`, `SERVICES_PAGE_v1.md`, etc. — per-page specs
- `FRAMEWORK_PAGE_v1.md`
- `DIAGNOSTIC/GROWTH_FRICTION_DIAGNOSTIC_v1.md` — the canonical question set + scoring rules
- `DESIGN_SYSTEM_v1.md` — design tokens
- `LIVE_URLS.md` — Calendly URLs + status of every external surface
- `GTM_RETHINK_2026-05-13.md` — the strategy that drove the v1 content

When you edit a page, also update the corresponding `*_v1.md` so the source-of-truth stays in sync. (Or stop syncing and let the HTML become the source — your call. Pick one and stick with it.)

## License

This codebase is unpublished IP of atScale Advisors LLC. The content (frameworks, terminology, models) is the property of Eugene Coleman / atScale Advisors LLC. Replication Wall™, Foundation First™, Growth Friction Diagnostic™, Revenue Intelligence Maturity Curve™, Scale Readiness Curve™, Invisible Revenue Tax™, and Revenue-First Transformation Framework™ are claimed trademarks of atScale Advisors LLC.

— Built overnight 2026-06-02 by Thomas (Eugene's PAI). Welcome to your new website.
