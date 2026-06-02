# Apps Script backend — deploy steps

This directory holds `Code.gs`, the Google Apps Script that receives diagnostic submissions, appends them to a Google Sheet, and emails Eugene a summary.

## What it does

1. **POST** with JSON body → appends a row, sends Eugene a notification email, returns `{ok: true}`.
2. **GET** → returns a health-check string. Useful for the smoke test below.

## One-time deploy (~10 minutes)

### 1. Create the Sheet

1. In Eugene's Google Workspace, **drive.google.com** → New → Google Sheets.
2. Name it: **atScale Diagnostic Submissions** (rename the default "Untitled spreadsheet").
3. Leave the default sheet empty — the script creates the `Submissions` tab on first submission.

### 2. Open the Apps Script editor

1. Inside the sheet: **Extensions → Apps Script**.
2. Delete the placeholder `function myFunction() {}`.
3. Open `Code.gs` from this repo and paste its full contents into the editor.
4. **Save** (⌘S or the floppy icon). Name the project: **atScale Diagnostic Backend**.

### 3. Edit the config

At the top of `Code.gs`:

```js
const SHEET_NAME   = "Submissions";                  // leave as-is
const NOTIFY_EMAIL = "eugene@atscale-advisors.com";  // confirm correct
```

If `eugene@atscale-advisors.com` is not your sending address yet, change this to the address you want notifications sent to.

### 4. Deploy as Web App

1. **Deploy → New deployment**.
2. **Select type** → click the gear → **Web app**.
3. Fill in:
   - **Description:** `atScale Diagnostic v1`
   - **Execute as:** **Me (your address)**
   - **Who has access:** **Anyone**

   *(Google renamed "Anyone, even anonymous" → "Anyone" in late 2026. If you see two options, pick "Anyone" — NOT "Anyone within your organization".)*

4. **Deploy**.
5. Google asks you to **authorize** the script. Allow it. (It needs Sheets write + MailApp send.)
6. Copy the **Web app URL** that Google gives you. It looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

### 5. Wire the URL into the site

Open `/home/ecoleman/Projects/website/js/diagnostic.js` and replace:

```js
const APPS_SCRIPT_URL = "REPLACE_ME_AFTER_DEPLOY";
```

with the URL from step 4:

```js
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycb.../exec";
```

Commit and redeploy (Cloudflare Pages auto-deploys on push).

### 6. Smoke test

Open the Web App URL in a browser. You should see:

```
atScale diagnostic backend OK — 2026-06-02T13:14:15Z
```

If you see that, the doGet handler works. Now run a POST test — open a terminal and run:

```bash
curl -L -X POST \
  -H "Content-Type: text/plain" \
  -d '{"submitted_at":"2026-06-02T00:00:00Z","p1_first_name":"TEST","p2_last_name":"USER","p3_email":"test@example.com","p4_company":"SmokeCo","p5_revenue_band":"$5M – $10M","p6_industry":"Professional services","p7_role":"Founder / CEO / Owner","q1":2,"q2":2,"q3":2,"q4":2,"q5":2,"q6":2,"q7":2,"q8":2,"q9":2,"q10":2,"q11":2,"q12":2,"dim_revenue":6,"dim_delivery":6,"dim_systems":6,"dim_leadership":6,"total_score":24,"stage_n":2,"stage_name":"Dashboard Theater","primary_leak":"Revenue Engine","cost_low":840000,"cost_high":1260000,"user_agent":"smoke-test"}' \
  "PASTE_YOUR_WEB_APP_URL_HERE"
```

Then:
- check your Sheet — there should be a row with TEST/USER/SmokeCo
- check your inbox — there should be a `[Diagnostic] SmokeCo — $5M – $10M — Stage 2` email
- delete the test row from the Sheet so it doesn't muddle your real data

### 7. If something is wrong

- **No email arrives.** Most common cause: notify address is wrong or the script auth was skipped. Re-deploy from step 4 and re-authorize.
- **POST returns HTML instead of JSON.** Most common cause: the Web App is deployed as "Only myself" instead of "Anyone". Redeploy.
- **CORS errors in browser console.** The client uses `Content-Type: text/plain` to dodge CORS preflight. If you see a preflight error, the client must NOT be sending `application/json` — check `js/diagnostic.js` line ~submit().
- **Submissions land but no email.** Check Apps Script logs: editor → "Executions" tab → look for red rows.

## Re-deploying after changes

1. Edit `Code.gs` in the script editor.
2. **Deploy → Manage deployments → ✏️ pencil icon on the existing deployment**.
3. **Version → New version** → describe the change → **Deploy**.
4. The Web App URL stays the same. No need to change anything on the site.

## Backups

The Sheet is the system of record. To export:
- **File → Download → CSV** (current sheet) for ad-hoc snapshots.
- For something more durable, add Drive's "Make a copy" to the weekly routine.

## What lives where

- `Code.gs` — this script (copy/paste into the Apps Script editor)
- `Submissions` sheet — the data
- Eugene's inbox — the notifications
