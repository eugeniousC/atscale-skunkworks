# Wake-up checklist — atScale Advisors website launch

**Built overnight by Thomas. Eugene executes the manual steps below.**

This walks you from "files on the box" to "live site at atscale-advisors.com" without surprises. Estimated total time: **90 minutes of clicking** (plus DNS propagation, which is wall-clock not work-clock).

---

## 0. Coffee. Then a 5-minute orientation.

The whole site lives at `/home/ecoleman/Projects/website/`. Open that directory in a terminal or VS Code and skim:

```
website/
├── index.html              ← homepage
├── about.html
├── services.html
├── frameworks.html
├── insights.html
├── contact.html
├── diagnostic.html         ← the assessment shell
├── css/styles.css          ← Architect's Blueprint design system
├── js/diagnostic.js        ← scoring engine + UI + form submit
├── assets/replicationWall.png
├── apps-script/Code.gs     ← Google Apps Script backend
├── apps-script/README.md   ← deploy walkthrough for the backend
├── _redirects              ← Cloudflare Pages clean-URL rules
├── _headers                ← security headers
├── ISA.md                  ← Thomas's spec + criteria for this build
├── README.md               ← architecture docs
└── WAKEUP-CHECKLIST.md     ← you are here
```

The site is **plain HTML/CSS/JS**. No build step. No framework. The repo as-checked-out is what gets served by Cloudflare. You can `python3 -m http.server 8000` in the project root and open `http://localhost:8000` to preview immediately.

---

## 1. Local preview (5 min)

Before touching anything cloud:

```bash
cd /home/ecoleman/Projects/website
python3 -m http.server 8000
```

Open http://localhost:8000 in your browser. Click through every page. Try the diagnostic — fill it out, hit submit. **The submit will fail silently because `APPS_SCRIPT_URL` isn't wired yet** (you'll see a console warning) — that's expected. The results page should still render with your scoring.

If anything looks broken, fix it locally before pushing. Likely culprits: missing font fallback, an `<a>` pointing somewhere wrong. The CSS uses tokens at the top of `css/styles.css` — adjust there, not inline.

`Ctrl-C` to kill the preview server when done.

---

## 2. GitHub repo (10 min)

You're already on `eugeniousC` from the migration. Create a new repo:

1. Go to https://github.com/new
2. **Owner:** eugeniousC
3. **Repository name:** `atscale-website` (or whatever you prefer — Cloudflare doesn't care)
4. **Visibility:** Private (you can flip to public later)
5. **Initialize:** leave EVERYTHING unchecked (no README, no .gitignore, no license — we have them already)
6. **Create repository**

Then push from the local repo. Thomas will have already run `git init` and staged a commit. You verify and push:

```bash
cd /home/ecoleman/Projects/website
git status
git log --oneline -1
# If you like what you see:
git remote add origin git@github.com:eugeniousC/atscale-website.git
git push -u origin main
```

If `git push` complains about `master` vs `main`, run `git branch -M main` first.

**Verification:** refresh github.com/eugeniousC/atscale-website. You should see all the files.

---

## 3. Cloudflare Pages (15 min)

### 3a. Sign in (or sign up)

1. https://dash.cloudflare.com
2. Use the same email that owns `atscale-advisors.com` (if you have it on Cloudflare DNS already) OR create a new Cloudflare account if not.

### 3b. Create the Pages project

1. Left sidebar → **Workers & Pages** → **Create application** → **Pages** tab → **Connect to Git**.
2. Authorize Cloudflare to access your GitHub. Pick the `eugeniousC/atscale-website` repo.
3. Configure the build:
   - **Project name:** `atscale-website` (becomes `atscale-website.pages.dev`)
   - **Production branch:** `main`
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/` (just a slash, or leave the field blank — both work)
   - **Root directory:** *(leave empty)*
4. **Save and Deploy**.

Cloudflare builds and deploys in 30-60 seconds.

### 3c. Verify the preview deploy

Once green, click the URL Cloudflare gives you — `https://atscale-website.pages.dev`. Click through every page. Try the diagnostic. **The submit will still fail** (we haven't wired the backend yet) but the UI should work.

**If the diagnostic UI looks broken (just shows "Loading…"), check the browser console.** Likely cause: a `<script>` tag failed to load. Fix locally, commit, push — Cloudflare redeploys automatically.

---

## 4. Google Apps Script backend (15 min)

Open `/home/ecoleman/Projects/website/apps-script/README.md` and follow it. It's a self-contained walkthrough. You'll end up with:

- A Google Sheet named **atScale Diagnostic Submissions**
- An Apps Script Web App deployed as "Anyone"
- A URL like `https://script.google.com/macros/s/AKfycb.../exec`

**Verify with the smoke-test curl in the apps-script README before moving on.** If the curl returns `{"ok":true}` and a row appears in your Sheet AND an email lands in your inbox — you're done. Don't move on until those three things all confirm.

---

## 5. Wire the Apps Script URL into the site (5 min)

Edit `/home/ecoleman/Projects/website/js/diagnostic.js`. Near the top:

```js
const APPS_SCRIPT_URL = "REPLACE_ME_AFTER_DEPLOY";
```

Replace with your URL from step 4:

```js
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycb.../exec";
```

Save, commit, push:

```bash
cd /home/ecoleman/Projects/website
git add js/diagnostic.js
git commit -m "wire Apps Script endpoint"
git push
```

Cloudflare auto-redeploys in 30-60 seconds.

**Verify end-to-end:** open `https://atscale-website.pages.dev/diagnostic`, fill it out, submit. Check:
1. Browser shows the results page
2. Email lands in your inbox
3. Row appears in the Sheet

If any of those fail, see the troubleshooting in `apps-script/README.md`.

---

## 6. Point atscale-advisors.com at Cloudflare Pages (20 min + DNS wait)

This is the cutover. **Read it all before doing any of it.**

### 6a. Where is your DNS today?

Your domain `atscale-advisors.com` is registered through Google Workspace. The DNS records likely live in **Google Domains / Squarespace Domains / Cloudflare** — wherever you currently manage the nameservers.

Check by running:

```bash
dig NS atscale-advisors.com +short
```

The output tells you who answers DNS today. Most likely options:
- `ns-cloud-*.googledomains.com` — Google manages DNS
- `ns*.squarespace.com` — Squarespace manages DNS
- `*.ns.cloudflare.com` — Cloudflare manages DNS (best case — go to 6c)

### 6b. Decide your DNS strategy

**Option A — Easiest: keep DNS where it is, add CNAME/A records to point to Cloudflare Pages.**

In your current DNS host (Google or Squarespace), add records:

```
Type: CNAME    Name: www       Value: atscale-website.pages.dev   TTL: 300
Type: A        Name: @ (apex)  Value: 192.0.2.1                   TTL: 300
```

(The apex A record is a placeholder — Cloudflare Pages doesn't use a fixed IP for the apex. We'll fix this with Cloudflare's custom-domain wizard in 6d.)

**Option B — Move DNS to Cloudflare entirely** (recommended long-term). Adds 20 minutes and a nameserver-change wait, but gives you CDN, analytics, and the apex-domain CNAME flattening that Cloudflare needs to serve the root domain properly.

To do this: in Cloudflare Dashboard → **Add a site** → enter `atscale-advisors.com`. Cloudflare scans your existing records and gives you two nameservers. Update those at Google Workspace / wherever your domain is registered. **This propagation is hours, not minutes.** Once it goes green, come back here.

**Picking:** if Squarespace is the DNS host (likely), move to Cloudflare DNS (Option B) — you're cancelling Squarespace anyway. If Google Workspace is the DNS host, either works; Option A is faster but you'll want Option B eventually.

### 6c. Once DNS is at the right host

In the Cloudflare Pages dashboard for `atscale-website`:

1. **Custom domains** tab → **Set up a custom domain** → enter `atscale-advisors.com`
2. Cloudflare creates the right DNS records automatically (if DNS is at Cloudflare).
3. Add `www.atscale-advisors.com` too (same process).
4. Wait for both to show "Active" — usually under 5 minutes once DNS is correct.

### 6d. Verify

- Open `https://atscale-advisors.com` — should show your new homepage.
- Open `https://www.atscale-advisors.com` — same.
- Open the diagnostic at `https://atscale-advisors.com/diagnostic` and complete it — submission should still land in your Sheet.
- Force-refresh (Ctrl-Shift-R) a few times to make sure no Squarespace-cached HTML is still hanging around.

**If the homepage still shows the OLD Squarespace site after 1 hour, the DNS propagation hasn't completed yet.** Check `dig atscale-advisors.com +short` — once it returns Cloudflare's IP, the new site is live.

---

## 7. Cancel Squarespace (5 min, but be careful)

**Do this AFTER step 6 is fully verified.**

1. Log into Squarespace.
2. Go to billing / subscription settings for the atScale site.
3. **Important:** make sure you cancel the SITE plan, NOT the domain registration. Your domain should be at Google Workspace, not Squarespace — but verify in step 6a above.
4. If Squarespace also manages your DNS (Option B in step 6b skipped this), point the domain elsewhere FIRST before cancelling — otherwise the domain goes dark.
5. Confirm cancellation. Take a screenshot of the confirmation.

**Renewal date:** 2026-06-15 per the chat history. You have margin — don't rush this step until step 6 is solid.

---

## 8. Optional polish (anytime in the next week)

Listed in order of impact / cost:

- **Add your real LinkedIn URL.** Search for `https://www.linkedin.com/in/eugene-coleman` across the HTML files (`rg "linkedin.com" -l .`) and replace with your actual handle.
- **Add a favicon.** Drop a `favicon.ico` (or `favicon.png`) at the project root and add to each `<head>`: `<link rel="icon" href="/favicon.ico">`.
- **Add a logo.** A wordmark in Space Grotesk is already in the nav (`atScale Advisors`). If you want a glyph, replace the `[↗]` brand-mark span with an `<img>` or inline SVG.
- **More testimonials.** The Michael B. quote is the only one on the homepage. When you have more, add them as a carousel-free static list below it.
- **Insights essay publishing.** Once Post 001 actually ships, replace the `coming-2026-06-09` stub on `insights.html` with the live essay copy + actual publish date. Each future essay = one new `<article>` block.
- **A `/diagnostic` results page that emails the respondent their score.** Right now the email goes ONLY to you. v2: the Apps Script sends a parallel email to the respondent. Code stub at the bottom of `Code.gs` (commented `// TODO v2`).
- **Beehiiv integration.** Per the chat history, deferred until ~10 leads/week. The newsletter signup block on `insights.html` is a stub.

---

## 9. Stuff Thomas left undecided (your call)

Thomas made best-guess decisions on these. Audit and override if you disagree:

| Decision | Thomas's pick | How to change |
|---|---|---|
| Stage 2 results page shows the Replication Wall image | Yes (calls it out visually for the highest-intent prospect) | Remove the `<img>` block in `renderResults()` in diagnostic.js |
| Pricing on services page is fully transparent (Rung 5 shows $45K-$65K) | Yes per the v1 spec | Edit `services.html` → "Rung 5" section |
| LinkedIn link is `linkedin.com/in/eugene-coleman` placeholder | Yes | Find/replace across HTML files |
| Brand mark in nav is `[↗]` in mono | Yes (engineered feel) | Edit `<span class="brand-mark">` in every HTML file |
| Insights subscribe is "coming soon" text, not a form | Yes per Beehiiv-deferred decision | Replace with `<form>` once Beehiiv is live |
| Diagnostic identity grouped (P1-P4 same screen) instead of one-at-a-time | Yes for friction reduction | Adjust step order in `STEP_IDS` in `diagnostic.js` |
| Strategy Discovery is the universal "talk to me" CTA | Yes per LIVE_URLS.md | Edit constants at top of `diagnostic.js` |

---

## 10. When something is broken

The Cloudflare deploy log shows build/deploy status in the Pages dashboard. The browser console shows JS errors. The Apps Script "Executions" tab shows backend errors. The Sheet shows submission data.

If the diagnostic ever stops submitting:
1. Open https://atscale-advisors.com/diagnostic, open DevTools console
2. Fill out + submit
3. Look for `[diagnostic] submission failed` in the console
4. Match the error to the troubleshooting list in `apps-script/README.md`

If the styling ever looks wrong on one page but right on another:
1. View source on both pages
2. Verify the `<link rel="stylesheet" href="/css/styles.css">` line matches
3. If different — somebody (you or Thomas) drifted one page. Re-sync to match.

---

## You're done when

- [ ] `https://atscale-advisors.com` shows the new homepage
- [ ] Every nav link works
- [ ] Submitting the diagnostic emails you and lands in the Sheet
- [ ] Calendly links from the results page work
- [ ] Squarespace is cancelled (or scheduled to cancel after the next billing cycle)
- [ ] You have a screenshot of the homepage saved for the LinkedIn post that ships Post 001

**Take a victory beer. Then go write Post 001 to actually drive traffic to this thing.**

— Thomas
