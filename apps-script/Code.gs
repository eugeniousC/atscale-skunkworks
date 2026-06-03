/**
 * atScale Advisors — Growth Friction Diagnostic backend
 *
 * Deploy this as a Google Apps Script Web App bound to a Google Sheet
 * named `atScale Diagnostic Submissions` in Eugene's Workspace.
 *
 * See apps-script/README.md for the deploy walkthrough.
 *
 * Behavior:
 *   - POST: appends a row to the bound Sheet, emails Eugene the internal
 *     summary, emails the PROSPECT their result + Scaling Journey map + CTAs,
 *     and returns JSON {ok: true}.
 *   - GET:  health check ("atScale diagnostic backend OK").
 */

/* ============================================================
 * CONFIG — edit these once after creating the Sheet & deploying
 * ============================================================ */
const SHEET_NAME = "Submissions";
const NOTIFY_EMAIL = "eugene@atscale-advisors.com";

// Public base URL the prospect email pulls the journey graphic from.
// Swap to https://atscale-advisors.com after the domain cutover (old emails keep
// working as long as the workers.dev URL stays alive).
const SITE_BASE_URL = "https://atscale-website.eugene-ed1.workers.dev";

// Calendly booking links surfaced in the prospect email.
const CAL_DISCOVERY = "https://calendly.com/eugene-atscale-advisors/strategy-discovery";
const CAL_SESSION   = "https://calendly.com/eugene-atscale-advisors/friction-diagnostic-session";

const COLUMNS = [
  "submitted_at",
  "p1_first_name",
  "p2_last_name",
  "p3_email",
  "p4_company",
  "p5_revenue_band",
  "p6_industry",
  "p7_role",
  "q1","q2","q3","q4","q5","q6","q7","q8","q9","q10","q11","q12",
  "dim_revenue","dim_delivery","dim_systems","dim_leadership",
  "total_score",
  "src_score","src_tier",
  "stage_n","stage_name",
  "primary_leak",
  "cost_low","cost_high",
  "user_agent",
];

// Per-tier email copy + journey-graphic key. Keyed on src_tier text.
const TIER_EMAIL = {
  "The Grind": {
    key: "grind",
    means: "The business is running on heroics and your bandwidth. That's survivable, but it doesn't scale — the first work is foundation, not growth.",
  },
  "The Plateau": {
    key: "plateau",
    means: "You have systems and dashboards, but the team can't yet predict outcomes from them. This is where most owner-operators stall — and where the biggest, most fixable leaks hide.",
  },
  "The Inflection": {
    key: "inflection",
    means: "Your foundation is honest. The next altitude is building the systems that compound — forecast discipline, decision rights, and the architecture that lets the business run without you in every room.",
  },
  "The Machine": {
    key: "machine",
    means: "You're operating ahead of the curve. The remaining work is strategic — the rare, high-leverage moves your current system isn't built to handle.",
  },
};

/* ============================================================
 * HTTP HANDLERS
 * ============================================================ */
function doGet(_e) {
  return ContentService
    .createTextOutput("atScale diagnostic backend OK — " + new Date().toISOString())
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const sheet = ensureSheet_();
    sheet.appendRow(COLUMNS.map(c => payload[c] == null ? "" : payload[c]));

    let mailOk = true, mailErr = "";
    try { sendNotificationEmail_(payload); }
    catch (err) { mailOk = false; mailErr = String(err); console.error("Notify mail failed:", err); }

    let prospectOk = true, prospectErr = "";
    try { sendProspectEmail_(payload); }
    catch (err) { prospectOk = false; prospectErr = String(err); console.error("Prospect mail failed:", err); }

    return jsonResponse_({
      ok: true,
      mail_ok: mailOk, mail_error: mailErr || undefined,
      prospect_mail_ok: prospectOk, prospect_mail_error: prospectErr || undefined,
    });
  } catch (err) {
    console.error("doPost error:", err);
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

/* ============================================================
 * HELPERS
 * ============================================================ */
function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("No POST body received");
  }
  let obj;
  try {
    obj = JSON.parse(e.postData.contents);
  } catch (_) {
    throw new Error("Body is not valid JSON");
  }
  if (typeof obj !== "object" || obj == null) throw new Error("Body is not an object");
  if (!obj.submitted_at) obj.submitted_at = new Date().toISOString();
  return obj;
}

function ensureSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error("Active spreadsheet missing — bind this script to a Google Sheet (Extensions → Apps Script from inside the Sheet).");
  }
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold");
  }
  const firstCell = sheet.getRange(1, 1).getValue();
  if (!firstCell) {
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function money_(n) { return "$" + (Number(n) || 0).toLocaleString("en-US"); }

function isEmail_(s) { return typeof s === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.trim()); }

/* ---------- Internal notification to Eugene (plain text) ---------- */
function sendNotificationEmail_(p) {
  const subject = `[Diagnostic] ${p.p4_company || "(unknown company)"} — ${p.p5_revenue_band || "?"} — SRC ${p.src_score || "?"} (${p.src_tier || ""}) / Stage ${p.stage_n || "?"}`;
  const bodyLines = [
    `New Growth Friction Diagnostic submission`,
    ``,
    `Name:      ${p.p1_first_name || ""} ${p.p2_last_name || ""}`,
    `Email:     ${p.p3_email || ""}`,
    `Company:   ${p.p4_company || ""}`,
    `Revenue:   ${p.p5_revenue_band || ""}`,
    `Industry:  ${p.p6_industry || ""}`,
    `Role:      ${p.p7_role || ""}`,
    ``,
    `Scale Readiness Score: ${p.src_score || "?"} / 40 — ${p.src_tier || ""}`,
    `RI Curve Stage:        ${p.stage_n || "?"} — ${p.stage_name || ""}`,
    `Raw total:             ${p.total_score || "?"} / 48`,
    `Primary leak:          ${p.primary_leak || ""}`,
    `Cost of the Wall:      ${money_(p.cost_low)} – ${money_(p.cost_high)} / year`,
    ``,
    `Dimensions:`,
    `  Revenue Engine:            ${p.dim_revenue || "?"} / 12`,
    `  Delivery & Operations:     ${p.dim_delivery || "?"} / 12`,
    `  Systems & Data:            ${p.dim_systems || "?"} / 12`,
    `  Leadership & Accountability: ${p.dim_leadership || "?"} / 12`,
    ``,
    `Raw answers:`,
    `  Q1-Q3 (Revenue):     ${p.q1}/${p.q2}/${p.q3}`,
    `  Q4-Q6 (Delivery):    ${p.q4}/${p.q5}/${p.q6}`,
    `  Q7-Q9 (Systems):     ${p.q7}/${p.q8}/${p.q9}`,
    `  Q10-Q12 (Leadership): ${p.q10}/${p.q11}/${p.q12}`,
    ``,
    `Submitted: ${p.submitted_at}`,
    `User agent: ${p.user_agent || ""}`,
    ``,
    `Suggested next move: ${suggestedNextMove_(p)}`,
  ];
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: subject,
    body: bodyLines.join("\n"),
    replyTo: p.p3_email || undefined,
    name: "atScale Diagnostic",
  });
}

/* ---------- Prospect-facing result email (HTML) ---------- */
function sendProspectEmail_(p) {
  if (!isEmail_(p.p3_email)) {
    console.warn("Prospect email skipped — missing/invalid address:", p.p3_email);
    return;
  }
  const tierInfo = TIER_EMAIL[p.src_tier] || TIER_EMAIL["The Plateau"];
  const first = (p.p1_first_name || "there").toString().trim() || "there";
  const score = p.src_score || "?";
  const tier = p.src_tier || "";
  const img = `${SITE_BASE_URL}/assets/journey-${tierInfo.key}.png`;

  // Stage-aware emphasis: not-yet-a-fit results lead with the free door.
  const discoveryPrimary =
    String(p.p5_revenue_band || "") === "Under $3M" || p.src_tier === "The Grind";

  const btnPrimary = (href, label) =>
    `<a href="${href}" style="display:inline-block;background:#B0762F;color:#FFFFFF;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:15px;padding:14px 26px;border-radius:8px;">${label}</a>`;
  const btnOutline = (href, label) =>
    `<a href="${href}" style="display:inline-block;background:#FFFFFF;color:#0F2238;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:15px;padding:13px 25px;border-radius:8px;border:1px solid #C7D6E4;">${label}</a>`;

  const discoveryBtn = discoveryPrimary
    ? btnPrimary(CAL_DISCOVERY, "Book a free Strategy Discovery call →")
    : btnOutline(CAL_DISCOVERY, "Book a free Strategy Discovery call →");
  const sessionBtn = discoveryPrimary
    ? btnOutline(CAL_SESSION, "Reserve the 90-min session →")
    : btnPrimary(CAL_SESSION, "Book & reserve the session →");

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#EEF2F6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF2F6;padding:24px 0;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#FFFFFF;border-radius:14px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
  <tr><td style="padding:28px 32px 8px;">
    <p style="margin:0;font-size:13px;letter-spacing:2px;color:#B0762F;font-weight:bold;">ATSCALE ADVISORS</p>
    <h1 style="margin:8px 0 0;font-size:22px;line-height:1.25;color:#0F2238;">Hi ${first} — here's where you are.</h1>
    <p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#44566B;">You just finished the Growth Friction Diagnostic. Here's your result — and where it puts you on the journey most $3M&ndash;$30M businesses are climbing.</p>
  </td></tr>
  <tr><td align="center" style="padding:18px 24px 4px;">
    <p style="margin:0;font-size:13px;color:#44566B;">Your Scale Readiness Score</p>
    <p style="margin:4px 0 0;font-family:'Courier New',monospace;font-size:44px;font-weight:bold;color:#0F2238;line-height:1;">${score}<span style="font-size:22px;color:#8A5B22;">/40</span></p>
    <p style="margin:6px 0 0;font-size:17px;font-weight:bold;color:#B0762F;">${tier}</p>
  </td></tr>
  <tr><td align="center" style="padding:14px 16px 6px;">
    <img src="${img}" width="540" alt="Your Scaling Journey — ${tier}" style="width:540px;max-width:100%;height:auto;border-radius:12px;display:block;" />
  </td></tr>
  <tr><td style="padding:14px 32px 0;">
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#44566B;"><strong style="color:#0F2238;">What this means:</strong> ${tierInfo.means}</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#44566B;">Your biggest leak right now is <strong style="color:#0F2238;">${p.primary_leak || "operational drag"}</strong>, and at your revenue band that's quietly costing an estimated <strong style="color:#A8412A;">${money_(p.cost_low)}&ndash;${money_(p.cost_high)} a year</strong> in rework, dropped follow-through, and friction you don't have the bandwidth to chase down.</p>
    <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#44566B;">The gap you're feeling has a name — the <strong style="color:#0F2238;">Replication Wall</strong>, marked on the map above. It's the point where the business has outgrown what one person can hold. Most owners stall there for years. It's also the most fixable thing in the business once you can see it clearly.</p>
  </td></tr>
  <tr><td style="padding:18px 32px 6px;">
    <p style="margin:0 0 16px;font-size:16px;font-weight:bold;color:#0F2238;">Two ways to go from here:</p>

    <p style="margin:0 0 6px;font-size:15px;color:#0F2238;"><strong>① Start with a conversation</strong> &mdash; <span style="color:#44566B;">free, 30 minutes</span></p>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.55;color:#44566B;">Want to talk it through first? We'll look at your result together and the one or two things most worth your attention. No pitch, no pressure.</p>
    <p style="margin:0 0 22px;">${discoveryBtn}</p>

    <p style="margin:0 0 6px;font-size:15px;color:#0F2238;"><strong>② Or skip the warm-up and get to work</strong> &mdash; <span style="color:#44566B;">90-min Friction Diagnostic Session, $3,500</span></p>
    <p style="margin:0 0 6px;font-size:14px;line-height:1.55;color:#44566B;">Already know your single biggest blocker and ready to do the work? Book the session and we'll cut straight to it. Before we meet, we'll request your materials and the details of your <strong>last 10 deals</strong> — so both of us walk in researched and we spend the 90 minutes on <em>your business</em>, not getting up to speed. You'll leave with the leak named in dollars and a plan your team can run.</p>
    <p style="margin:0 0 10px;font-size:13px;color:#7E8A98;font-style:italic;">Best fit if you're $3M+ and already clear on where it hurts.</p>
    <p style="margin:0 0 8px;">${sessionBtn}</p>
  </td></tr>
  <tr><td style="padding:18px 32px 30px;border-top:1px solid #E6ECF2;">
    <p style="margin:14px 0 0;font-size:14px;color:#0F2238;"><strong>Eugene Coleman</strong></p>
    <p style="margin:2px 0 0;font-size:13px;color:#44566B;">atScale Advisors · Revenue Systems Architect</p>
    <p style="margin:6px 0 0;font-size:12px;color:#7E8A98;">25+ years inside FedEx, CIGNA, Allstate, Delta, Salesforce, Tealium — same patterns, your scale.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  const plain = [
    `Hi ${first} — here's where you are.`,
    ``,
    `Your Scale Readiness Score: ${score}/40 — ${tier}`,
    ``,
    `What this means: ${tierInfo.means}`,
    ``,
    `Biggest leak: ${p.primary_leak || "operational drag"} — costing an estimated ${money_(p.cost_low)}–${money_(p.cost_high)}/year.`,
    ``,
    `Two ways to go from here:`,
    `1) Free Strategy Discovery call (30 min): ${CAL_DISCOVERY}`,
    `2) 90-min Friction Diagnostic Session ($3,500): ${CAL_SESSION}`,
    `   Best fit if you're $3M+ and already clear on where it hurts.`,
    ``,
    `— Eugene Coleman, atScale Advisors`,
  ].join("\n");

  MailApp.sendEmail({
    to: p.p3_email.trim(),
    subject: `Your Scale Readiness Score: ${score}/40 — here's where you are`,
    htmlBody: html,
    body: plain,
    replyTo: NOTIFY_EMAIL,
    name: "Eugene Coleman — atScale Advisors",
  });
}

function suggestedNextMove_(p) {
  const stage = p.stage_n || 0;
  if (stage <= 1) return "Foundation Check-in (20 min) — confirm foundation tier and disqualify if outside ICP.";
  if (stage === 2) return "Friction Diagnostic Session ($3,500, 90 min) — name the leak in dollars, walk away with 5-page recap.";
  if (stage === 3) return "Strategy Discovery (30 min) — Revenue Architecture or Foundation Audit fit.";
  if (stage >= 4) return "Strategy Discovery (30 min) — Embedded Advisory / strategic counsel fit.";
  return "Strategy Discovery (30 min).";
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ============================================================
 * Optional: run this once from the editor to verify Sheet wiring
 * before publishing the Web App.
 * ============================================================ */
function _smokeTest() {
  const sheet = ensureSheet_();
  console.log("Sheet OK:", sheet.getName(), "rows:", sheet.getLastRow());
}
