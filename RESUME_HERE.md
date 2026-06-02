# RESUME HERE — atScale website build

**Last updated:** 2026-06-02
**Last working session:** Linux Thomas at u.eugenius.tech
**State:** live on preview, charcoal-placard redesign shipped, ICP copy standardized, backend still not wired

---

## Where we are

Live on Cloudflare (Workers static assets) at:
- Preview URL: https://atscale-website.eugene-ed1.workers.dev
- Domain target (not yet cut over): atscale-advisors.com (still on Squarespace until ~2026-06-15)

GitHub repo: https://github.com/eugeniousC/atscale-website (private)
Branch: `main`
Latest commit: `161e7cb` — chore(diagnostic): align tie-break comment to $3M-$30M

> **Infra note:** this is Cloudflare **Workers static assets**, NOT Pages — there is **no `pages.dev`**. Custom-domain hookup at Step 6 runs through the Workers route, not a Pages CNAME. (Corrects the stale Option-A instruction in older notes.)

## What's done

- [x] Site scaffolded, on GitHub, auto-deploys to Cloudflare on push to `main`
- [x] **Design v2 — charcoal placard pass (commit `c35bb22`)**: killed the cyanotype blueprint grid, marquee bands, and draftsman corner-ticks; inverted to dark charcoal (`#0F1318` base, `#171C24` placards), near-white headings, cool-gray body; depth now from elevation + hairline borders + soft shadows; single bronze hero glow; bronze retained and brightened (`#C8893B`) as the only accent. All token names preserved → all 7 pages converted as a set.
- [x] **About page edits (commit `59e2de3`)**: "Who I most commonly work with" rewrite (owner-operators + executives); removed "Who I am beyond the work"; kept "What I believe."
- [x] **ICP band standardized to $3M–$30M sitewide (commits `aafd3fb`, `b097448`, `161e7cb`)**: all marketing copy + diagnostic results interp now read $3M–$30M. Diagnostic's revenue-band **selector** deliberately left full-range (Under $3M → Over $40M) so larger visitors still feel captured.
- [x] **Backend code complete** in `apps-script/Code.gs` (Sheet append + email + dual-score) — NOT yet deployed
- [x] Forge code-reviewed (Critical + High fixed)

## Open / awaiting

- [ ] **Eugene's visual verdict on design v2.** Reviewing on the preview URL. Iterate from his delta list (hero glow intensity, body-text contrast, placard shadow depth, score halo, CTA weight) — batch fixes into one follow-up commit. Thomas can't verify visually from the headless VPS; Eugene is the design judge.

## What's next (in order)

### Step 4 — Google Apps Script backend (~15 min) — **OWNER: Eugene**
Full walkthrough in `apps-script/README.md`. End state:
- New Sheet "atScale Diagnostic Submissions"
- Apps Script Web App deployed as **"Execute as: Me"** + **"Who has access: Anyone"** (critical — NOT "Anyone within org")
- Capture the Web App URL for Step 5
**This is the canonical next step.** Don't drift into more design/copy refinement until it's live.

### Step 5 — Wire APPS_SCRIPT_URL into diagnostic.js (~3 min) — **OWNER: Thomas (after Eugene hands over the URL)**
Edit `js/diagnostic.js`, replace `const APPS_SCRIPT_URL = "REPLACE_ME_AFTER_DEPLOY"`. Commit + push. Then end-to-end test: submit the diagnostic, confirm a row in the Sheet + email in inbox.

### Step 6 — Point atscale-advisors.com at Cloudflare — **OWNER: Eugene + Thomas**
DNS is at Google Workspace. Hook the custom domain through the **Workers** custom-domain route (not Pages). Verify: `curl -I https://atscale-advisors.com 2>&1 | grep -i "server\|cf-ray"` → should show `server: cloudflare`.

### Step 7 — Cancel Squarespace — **OWNER: Eugene**
ONLY after Step 6's curl confirms cloudflare. Squarespace renews 2026-06-15.

### Step 8 — Ship Post 001 to LinkedIn — **OWNER: Eugene**
Drive first funnel traffic. **Freeze framework refinements** until ~20 real diagnostic completions.

## Active decisions / IP state

- **Design:** charcoal placard (dark, elevation-based, bronze accent) — locked v2, replaced the cyanotype blueprint look per feedback (too busy/lined). No motion required.
- **ICP copy:** $3M–$30M book of business across professional services or trades — consistent sitewide. Diagnostic selector stays full-range on purpose.
- **Hosting:** Cloudflare Workers static assets, GitHub repo private, no build step.
- **Backend:** Google Apps Script + Sheet (Path 1; Workers + D1 is the v2 destination when volume justifies).
- **ORIA** = Operations → Replication → Intelligence → Automation (locked sequencing). **Replication Wall™** sits between Replication and Intelligence.
- **Scale Readiness Score™** = headline number (10–40) on results; **RI Maturity Curve stage** (1–5) is the depth driving cost-of-Wall.
- **Beehiiv** deferred until ~10+ leads/week. **CRM** deferred until ~15–20 active prospects or 2–3 paying clients.

## File locations

| Where | What |
|-------|------|
| `/home/ecoleman/Projects/website/` | The live repo (this VPS) |
| `css/styles.css` | Charcoal Placard v2 design system (token-driven) |
| `js/diagnostic.js` | Questions, scoring, results, POST to backend (`APPS_SCRIPT_URL` still placeholder) |
| `ISA.md` | Project ISA (system of record) |
| `apps-script/README.md` | Apps Script deploy walkthrough (Step 4) |
| `~/.claude/PAI/USER/PROJECTS/atscale-advisors/` | Project notes, content drafts, design system |
| `~/.claude/PAI/USER/PROJECTS/atscale-advisors/SESSION_STATE.md` | Cross-Thomas pointer to this file |

## If you (next-Thomas) pick this up

1. **On THIS VPS (Linux Thomas):** working dir set, tree clean and pushed. Start at **Step 4** (or process Eugene's design-delta list first if he's given one).
2. **On Mac Thomas:** `git clone git@github.com:eugeniousC/atscale-website.git` for local iteration, or SSH to this VPS over Tailscale (`u.eugenius.tech`) to keep build context. Both work.
3. **Canonical next step: Step 4 — Apps Script backend deploy (Eugene-owned).** Don't drift into more design/copy work until the backend is live AND there's submission data.

— Thomas (Linux instance, u.eugenius.tech)
