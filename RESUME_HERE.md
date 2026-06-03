# RESUME HERE — atScale website

**Last updated:** 2026-06-03 (late evening)
**Last working session:** Linux Thomas at u.eugenius.tech
**State:** SITE IS LIVE on the real domain. Funnel fully built + authenticated end-to-end. Next up: LinkedIn articles.

---

## Where we are

**Live in production at https://atscale-advisors.com** (and www) — Cloudflare Worker, valid SSL, serving the new charcoal site. Squarespace is out of the serving path.
- Worker / preview URL: https://atscale-website.eugene-ed1.workers.dev
- GitHub: https://github.com/eugeniousC/atscale-website (private), branch `main`, HEAD `ba2e52b`
- **Push to `main` auto-deploys to production in ~30-60s** (we verified repeatedly). HTML updates instantly; fixed-name static assets (styles.css, diagnostic.js) can briefly edge-cache on the proxied domain — hard-refresh or Cloudflare → Caching → Purge Everything if a CSS/JS change doesn't show.

## What's DONE (this is a lot — most of the build is finished)

- [x] **Charcoal-placard redesign** — all 7 pages. Killed the cyanotype blueprint/grid; dark charcoal base (#0F1318), elevated placards, hairline borders, single bronze hero glow, bronze accent retained. Token-driven (`css/styles.css`).
- [x] **ICP standardized to $3M-$30M** sitewide (copy + diagnostic results). Diagnostic revenue-band selector kept full-range (Under $3M -> Over $40M) on purpose.
- [x] **About** rewritten ("Who I most commonly work with" = owner-operators + executives), personal section removed, beliefs kept.
- [x] **Other-Thomas review fixes:** question count -> 12 everywhere (intro + progress label "Question N of 12" / "About you"); "MODELS file" jargon removed; Michael B. testimonial corrected to exact approved quote; **Insights hidden from nav** (page kept on disk, unlinked — relink when essay #1 ships).
- [x] **Backend live + deployed:** submission -> Sheet row + internal notification email. `apps-script/Code.gs` (pure ASCII, paste-proof). Web App URL wired in `js/diagnostic.js`.
- [x] **Prospect result email:** HTML email with the **4-tier Scaling Journey graphic** (charcoal+bronze, `/assets/journey-{grind|plateau|inflection|machine}.png`) + **dual solid-gold CTAs** (free discovery + $3,500 Friction Diagnostic Session, with the "$3M+" qualifier). Verified end-to-end from a real external Gmail — lands in inbox.
- [x] **DNS moved to Cloudflare** (registrar still Squarespace; nameservers gordon/leah.ns.cloudflare.com). All records intact through the move.
- [x] **Email auth fully passing:** SPF + **DKIM** (2048-bit, published in Cloudflare, "Authenticate email" started in Workspace) + **DMARC** (`p=none` monitoring). Verified SPF/DKIM/DMARC = PASS from external Gmail.
- [x] **Domain cutover (Step 6) DONE** — custom domain attached to the Worker, verified live via Mac bridge.
- [x] **Mac-Chrome testing bridge** built: `~/bin/mac-shot <url>` and `~/bin/mac-open <url>` drive Mac Thomas's real Chrome over Tailscale (see [[reference_mac_thomas_test_bridge]]).

## What's NEXT (canonical) — start here tomorrow (2026-06-04)

### Step 8 — LinkedIn articles: revisit, adapt, post  ** <- THE NEXT TASK**
Eugene's call (2026-06-03): revisit the existing LinkedIn articles/drafts, **adapt them to all the tweaks we made** (ICP now $3M-$30M owner-operators + executives across professional services / trades; ORIA sequencing; Replication Wall; Scale Readiness Score; the diagnostic-led funnel; charcoal brand), and get them posted to drive first real traffic through the funnel.
- Content drafts live in `~/.claude/PAI/USER/PROJECTS/atscale-advisors/` (and the broader content/Telos narratives). Check there for existing article drafts + Post 001.
- Funnel CTA in posts -> the diagnostic (https://atscale-advisors.com/diagnostic.html).
- Per earlier decision: **freeze framework refinements** until ~20 diagnostic completions of real data.

## Pending Eugene actions (not blocking Step 8)

- **Cancel Squarespace -- CAREFULLY.** Cancel the **website/hosting subscription** ONLY. Do NOT cancel/delete the **domain registration** (atscale-advisors.com is registered at Squarespace Domains; DNS is on Cloudflare but the registrar is still Squarespace). Confirm whether the 6/15 renewal is the website plan (cancel) vs the domain (keep). Old Squarespace site is fully replaced.
- **Delete the test rows** in the "atScale Diagnostic Submissions" Sheet (smoke/deploy/button tests + the Gmail test). They live in the `Submissions` tab (not the default tab).
- **~2026-06-17 (~2 weeks):** tighten DMARC `p=none` -> `p=quarantine` once reports confirm nothing legit fails.

## Active decisions / IP state (don't re-litigate)

- Design: charcoal placard (dark, elevation-based, bronze accent), no motion. Locked v2.
- ICP copy: $3M-$30M across professional services or trades. Diagnostic selector full-range on purpose.
- Both email CTAs solid gold, equal weight (open-door — Eugene's call over the hierarchy version).
- ORIA = Operations -> Replication -> Intelligence -> Automation; Replication Wall between Replication and Intelligence.
- Scale Readiness Score (10-40, headline) + RI Maturity Curve stage (1-5, depth). 4-tier journey map (Grind/Plateau/Inflection/Machine) is the email's emotional "you are here".
- Hosting: Cloudflare Workers static assets, no build step. Backend: Google Apps Script + Sheet.

## File locations

| Where | What |
|-------|------|
| `/home/ecoleman/Projects/website/` | Live repo (this VPS) |
| `css/styles.css` | Charcoal Placard v2 design system |
| `js/diagnostic.js` | Diagnostic logic + scoring + POST (APPS_SCRIPT_URL wired) |
| `apps-script/Code.gs` | Backend: Sheet append + notify email + prospect result email (pure ASCII) |
| `assets/journey-*.png` + `assets/journey/map.html`,`map.js` | Journey-map graphics + their generator |
| `~/bin/mac-shot`, `~/bin/mac-open` | Mac-Chrome testing bridge |
| `~/.claude/PAI/USER/PROJECTS/atscale-advisors/` | Content drafts, page specs, GTM notes (Step 8 source material) |
| `~/.claude/PAI/USER/PROJECTS/atscale-advisors/SESSION_STATE.md` | Cross-Thomas pointer to this file |

## If you (next-Thomas) pick this up

1. **Linux Thomas (here):** working dir set, tree clean + pushed. Start Step 8 — pull the LinkedIn article drafts from the project notes and adapt to the tweaks above.
2. **Mac Thomas:** `git clone`/pull `eugeniousC/atscale-website`, or SSH to this VPS over Tailscale. The Mac is also the rendering engine for `~/bin/mac-shot`.
3. **Canonical next step: Step 8 — LinkedIn articles (revisit -> adapt -> post).** The site build is done; this is about driving traffic.

-- Thomas (Linux instance, u.eugenius.tech)
