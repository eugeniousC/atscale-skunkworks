# RESUME HERE — atScale website build

**Last updated:** 2026-06-02
**Last working session:** Linux Thomas at u.eugenius.tech
**State:** mid-deploy, content polish in progress, backend not yet wired

---

## Where we are

The site is **live on Cloudflare Pages** at:
- Pages URL: https://atscale-website.eugene-ed1.workers.dev
- Domain target (not yet cut over): atscale-advisors.com (still on Squarespace until ~2026-06-15)

GitHub repo: https://github.com/eugeniousC/atscale-website (private)
Branch: `main`
Latest commit: `f8a8548` — feat(frameworks): restructure around the journey as the spine

## What's done

- [x] **Step 0** — repo scaffolded (20+ tracked files at `/home/ecoleman/Projects/website/`)
- [x] **Step 1** — local preview SKIPPED (headless VPS; we used Cloudflare preview directly)
- [x] **Step 2** — GitHub repo created on `eugeniousC`, VPS SSH key added, pushed `main`
- [x] **Step 3** — Cloudflare Pages connected to repo, auto-deploys on push
- [x] **Post-deploy fixes:**
  - Deleted `_redirects` (was causing 307 loop with CF's native `.html` stripping)
  - Removed `Vistage/EOS/Chair` coexistence section from homepage (kept on About + Services + Frameworks)
- [x] **Content evolutions during deploy:**
  - Broadened ICP framing: $3M-$15M trades → $3M-$30M book of business across professional services or trades
  - Renamed "The Scale Readiness Curve" → "Your Scale Readiness Score™" with full hook + diagnostic CTA
  - Diagnostic now outputs Scale Readiness Score (10-40) as the headline, RI Maturity Curve stage as secondary
  - Sequencing framework: Operations → Replication → Intelligence → Automation (was 3-phase; Replication is now where the Wall sits)
  - Cyanotype design pass: deep Prussian blue hero/marquee bands, bronze CTA glow, mono SECTION-N labels
  - **Frameworks page restructured** around the journey-as-spine — leads with ORIA, then Wall, then diagnostic, then maps
- [x] **Backend code complete** in `apps-script/Code.gs` — Sheet append + email notify + dual-score (SRC + Stage) — NOT yet deployed
- [x] Code-reviewed by Forge (Critical + High issues fixed)

## What's next (in order)

### Step 4 — Google Apps Script backend (~15 min)
Eugene executes. Full walkthrough in `apps-script/README.md`. End state:
- A new Sheet at `drive.google.com` named "atScale Diagnostic Submissions"
- Apps Script Web App deployed as **"Execute as: Me"** + **"Who has access: Anyone"** (critical — not "Anyone within org")
- Web App URL captured for Step 5

### Step 5 — Wire APPS_SCRIPT_URL into diagnostic.js (~3 min)
Edit `/home/ecoleman/Projects/website/js/diagnostic.js` near top:
```js
const APPS_SCRIPT_URL = "REPLACE_ME_AFTER_DEPLOY"; // ← swap this
```
Replace with the Web App URL from Step 4. Commit + push. CF auto-deploys.

End-to-end test: open the Cloudflare site's `/diagnostic.html`, fill out, submit. Confirm row in Sheet + email in inbox.

### Step 6 — Point atscale-advisors.com at Cloudflare Pages
Eugene's domain DNS is at Google Workspace.
- Option A (faster): add CNAME `www → atscale-website.pages.dev` in GWS DNS
- Option B (cleaner): move DNS to Cloudflare (Add a site at dash.cloudflare.com → update nameservers at GWS)
After DNS landed: in CF Pages, add custom domain `atscale-advisors.com` + `www.atscale-advisors.com`
Verify with: `curl -I https://atscale-advisors.com 2>&1 | grep -i "server\|cf-ray"` — should show `server: cloudflare`

### Step 7 — Cancel Squarespace
ONLY after Step 6's curl confirms cloudflare server. Squarespace renews 2026-06-15.

### Step 8 — Ship Post 001 to LinkedIn
Drive first real traffic through the funnel. **Freeze the framework refinements** until we have ~20 diagnostic completions of real data.

## Active decisions / IP state

- **Hosting:** Cloudflare Pages free, GitHub repo private, no build step
- **Backend:** Google Apps Script + Sheet (Path 1 of upgrade ladder — Workers + D1 is the v2 destination when volume justifies)
- **Brand voice on Home:** pain-first emotional ("you're working harder every quarter") — NOT journey-frame
- **Brand voice on Frameworks:** cartographer/architect ("the pattern we've watched every business take") — journey-frame as spine
- **Replication Wall™:** structural barrier between Replication and Intelligence in ORIA — has a logical home, not just a poetic phrase
- **Scale Readiness Score™:** headline number on diagnostic results page; RI Maturity Curve stage is the depth
- **ORIA = Operations → Replication → Intelligence → Automation** is the locked sequencing framework
- **Foundation First™:** 3-stage view (Survive · Systematize · Scale); Plateau = where the Wall sits
- **Pricing on Services:** transparent across all 5 rungs ($0 / $3.5K / $9.5K / $28K / $45-65K + $10K/mo retainer)
- **Beehiiv:** deferred until ~10+ leads/week
- **CRM:** deferred until ~15-20 active prospects or 2-3 paying clients
- **Chair/EOS/Implementer differentiation:** ON About + Services + Frameworks (mid/deep funnel); OFF Homepage (deliberate, conversion path)

## File locations

| Where | What |
|-------|------|
| `/home/ecoleman/Projects/website/` | The live repo (this VPS) |
| `/home/ecoleman/Projects/website/ISA.md` | Project ISA (142 ISCs, system of record) |
| `/home/ecoleman/Projects/website/WAKEUP-CHECKLIST.md` | Original deploy walkthrough (some steps now stale; use this file's "What's next" instead) |
| `/home/ecoleman/Projects/website/apps-script/README.md` | Apps Script deploy walkthrough |
| `~/.claude/PAI/USER/PROJECTS/atscale-advisors/` | Project notes, content drafts (HOME_PAGE_v1.md etc.), design system |
| `~/.claude/PAI/USER/PROJECTS/atscale-advisors/SESSION_STATE.md` | Cross-Thomas pointer to this file |

## If you (next-Thomas) pick this up

1. **On THIS VPS (Linux Thomas):** working dir already set; everything is in place. Start at "Step 4" above.
2. **On Mac Thomas:** the code is on GitHub. Either SSH to this VPS via Tailscale (`u.eugenius.tech`) to continue working here, or `git clone git@github.com:eugeniousC/atscale-website.git` locally to work from Mac. Both work; the VPS path keeps the build context intact, the Mac path is faster local iteration.
3. Either way, **the canonical next step is Step 4 (Apps Script backend deploy).** Don't drift into more framework refinements until that's live AND we have submission data.

— Thomas (Linux instance, u.eugenius.tech)
