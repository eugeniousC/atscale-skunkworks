/**
 * atScale Advisors — Growth Friction Diagnostic backend
 *
 * Deploy this as a Google Apps Script Web App bound to a Google Sheet
 * named `Diagnostic Submissions` in Eugene's Workspace.
 *
 * See apps-script/README.md for the deploy walkthrough.
 *
 * Behavior:
 *   - POST: appends a row to the bound Sheet, emails Eugene the summary,
 *     and returns JSON {ok: true}.
 *   - GET:  health check ("atScale diagnostic backend OK").
 */

/* ============================================================
 * CONFIG — edit these once after creating the Sheet & deploying
 * ============================================================ */
const SHEET_NAME = "Submissions";
const NOTIFY_EMAIL = "eugene@atscale-advisors.com";

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
  "stage_n","stage_name",
  "primary_leak",
  "cost_low","cost_high",
  "user_agent",
];

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
    try {
      sendNotificationEmail_(payload);
    } catch (mailErr) {
      // Don't fail the submission if mail fails — the row is safe in the sheet.
      console.error("Mail send failed:", mailErr);
    }
    return jsonResponse_({ ok: true });
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
  // Normalize submitted_at — accept ISO from client, fall back to server clock
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
  // Defensive: header row exists?
  const firstCell = sheet.getRange(1, 1).getValue();
  if (!firstCell) {
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function sendNotificationEmail_(p) {
  const subject = `[Diagnostic] ${p.p4_company || "(unknown company)"} — ${p.p5_revenue_band || "?"} — Stage ${p.stage_n || "?"} (${p.stage_name || ""})`;
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
    `Total:     ${p.total_score || "?"} / 48`,
    `Stage:     ${p.stage_n || "?"} — ${p.stage_name || ""}`,
    `Primary leak: ${p.primary_leak || ""}`,
    `Cost of the Wall: $${(p.cost_low || 0).toLocaleString()} – $${(p.cost_high || 0).toLocaleString()} / year`,
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
  // No mail in smoke test by design — wire ensureSheet only.
}
