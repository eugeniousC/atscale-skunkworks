/* Growth Friction Diagnostic — scoring engine + UI
 * atScale Advisors. Vanilla JS. No build, no deps.
 *
 * Data flow:
 *   welcome → identity (P1-P4) → P5..P7 → Q1..Q12 → submitting → results
 *
 * Scoring:
 *   Each Q answer is integer 1-4.
 *   Total = sum(Q1..Q12), range 12-48.
 *   Dimensions = Revenue Engine (Q1-3), Delivery & Ops (Q4-6),
 *                Systems & Data (Q7-9), Leadership & Accountability (Q10-12).
 *   Each dimension scored 3-12.
 *   Stage band: 12-17 → 1, 18-28 → 2, 29-39 → 3, 40-45 → 4, 46-48 → 5.
 *   Cost-of-Wall = revenue band midpoint × stage leakage midpoint (± 20%).
 *
 * Submission:
 *   POST JSON to APPS_SCRIPT_URL.
 *   Best-effort: if POST fails, results still render. Lead is just lost.
 */

/* ============================================================
 * CONFIG — Eugene swaps APPS_SCRIPT_URL after deploying Code.gs
 * ============================================================ */
const APPS_SCRIPT_URL = "REPLACE_ME_AFTER_DEPLOY"; // wakeup checklist step 5
const STRATEGY_DISCOVERY_URL = "https://calendly.com/eugene-atscale-advisors/strategy-discovery";
const FOUNDATION_CHECKIN_URL = "https://calendly.com/eugene-atscale-advisors/foundation-checkin-atscale-advisors";
const FRICTION_SESSION_URL = "https://calendly.com/eugene-atscale-advisors/friction-diagnostic-session";

/* ============================================================
 * QUESTIONS — canonical content from GROWTH_FRICTION_DIAGNOSTIC_v1
 * ============================================================ */

const REVENUE_BANDS = [
  { value: "u3",   label: "Under $3M",     midpoint: 2_000_000 },
  { value: "3-5",  label: "$3M – $5M",     midpoint: 4_000_000 },
  { value: "5-10", label: "$5M – $10M",    midpoint: 7_500_000 },
  { value: "10-15",label: "$10M – $15M",   midpoint: 12_500_000 },
  { value: "15-25",label: "$15M – $25M",   midpoint: 20_000_000 },
  { value: "25-40",label: "$25M – $40M",   midpoint: 32_500_000 },
  { value: "o40",  label: "Over $40M",     midpoint: 50_000_000 },
];

const INDUSTRIES = [
  "General contracting / remodeling",
  "HVAC / electrical / plumbing / specialty contracting",
  "Field service (pest, landscape, cleaning, etc.)",
  "Manufacturing (owner-led, trades-adjacent)",
  "Professional services",
  "Other",
];
const NON_TRADES_INDUSTRIES = new Set([
  "Manufacturing (owner-led, trades-adjacent)",
  "Professional services",
  "Other",
]);

const ROLES = [
  "Founder / CEO / Owner",
  "COO / President / #2",
  "CFO / Head of Finance",
  "Department lead",
  "Other",
];

// Each diagnostic question has two phrasings: trades (default) and nonTrades (Pro Services / Manufacturing).
// nonTrades is omitted when language is identical.
const QUESTIONS = [
  {
    id: "q1",
    dim: "revenue",
    prompt: "When you look at next quarter's revenue forecast, how confident are you in the number?",
    options: [
      "Honestly? It's a hopeful guess. We'll know when we know.",
      "We have a number, but I'd say we're right within ±25%.",
      "The forecast is usually within ±10%. We track it weekly.",
      "The forecast is the operating plan. We're within ±5% almost every quarter.",
    ],
  },
  {
    id: "q2",
    dim: "revenue",
    prompt: "When an existing customer is ready to upgrade, expand, or add services, who owns that conversation?",
    options: [
      "Whoever happens to be in front of the customer when it comes up.",
      "Sales handles new business; nobody specifically owns expansion.",
      "We have a defined motion — someone owns expansion conversations on a cadence.",
      "Expansion is a tracked, forecasted line item with its own metrics.",
    ],
  },
  {
    id: "q3",
    dim: "revenue",
    prompt: "When a deal closes, how does it move from sales into operations / delivery?",
    options: [
      "Honestly, it's a handoff conversation — sometimes a Slack message.",
      "We have a process, but ops usually has to ask sales for missing details.",
      "The handoff is documented and standard. Ops gets what they need.",
      "Sales and ops share a system; the handoff is mechanical, not a meeting.",
    ],
  },
  {
    id: "q4",
    dim: "delivery",
    prompt: "If you compared estimated margin vs. actual margin on your last 10 jobs, what's the spread?",
    promptNonTrades: "If you compared estimated margin vs. actual margin on your last 10 engagements, what's the spread?",
    options: [
      "I'd have to do the math job-by-job. We don't track it that cleanly.",
      "Some jobs hit, some miss by a lot. Maybe ±15% spread on average.",
      "We track it. Spread is usually within ±8%. We know which jobs miss and why.",
      "Estimating and actual are reconciled monthly. Spread is within ±4%.",
    ],
    optionsNonTrades: [
      "I'd have to do the math engagement-by-engagement. We don't track it that cleanly.",
      "Some engagements hit, some miss by a lot. Maybe ±15% spread on average.",
      "We track it. Spread is usually within ±8%. We know which engagements miss and why.",
      "Estimating and actual are reconciled monthly. Spread is within ±4%.",
    ],
  },
  {
    id: "q5",
    dim: "delivery",
    prompt: "When work moves from sales to operations, miscommunication or missing information costs you:",
    options: [
      "More than I'd like to admit — most jobs hit a friction point in the first week.",
      "A few hours per job, usually. Adds up over the year.",
      "Rare. Maybe 1 in 10 jobs has a handoff issue.",
      "Almost never. The handoff is clean.",
    ],
    optionsNonTrades: [
      "More than I'd like to admit — most engagements hit a friction point in the first week.",
      "A few hours per engagement, usually. Adds up over the year.",
      "Rare. Maybe 1 in 10 engagements has a handoff issue.",
      "Almost never. The handoff is clean.",
    ],
  },
  {
    id: "q6",
    dim: "delivery",
    prompt: "What percentage of completed jobs require unplanned rework, callbacks, or unhappy-customer recovery?",
    promptNonTrades: "What percentage of completed engagements require unplanned rework, scope creep, or client recovery?",
    options: [
      "More than 15%. I hear about it constantly.",
      "8–15%. Enough that we have a 'fix-it' pattern.",
      "Under 8%. Tracked, addressed, decreasing.",
      "Under 3%. We catch issues before they're customer-facing.",
    ],
  },
  {
    id: "q7",
    dim: "systems",
    prompt: "How many separate places store information about an open opportunity in your business?",
    options: [
      "I don't actually know. Spreadsheets, CRM, sales rep's head, somewhere.",
      "3–4 systems. They don't always agree.",
      "1–2 systems. They're synced.",
      "One source of truth. Everyone uses it.",
    ],
  },
  {
    id: "q8",
    dim: "systems",
    prompt: "When you say “we'll close $X next quarter,” the evidence behind the number comes from:",
    options: [
      "My gut and what I'm hearing from sales.",
      "A pipeline report, but it's optimistic — we discount it in our heads.",
      "Weighted pipeline + close-rate history. The math is consistent.",
      "A forecast that integrates pipeline, expansion, retention, and seasonality. Boring, accurate.",
    ],
  },
  {
    id: "q9",
    dim: "systems",
    prompt: "If you took 14 days completely off — no email, no calls — what would break?",
    options: [
      "Several things. The team would call me even though I asked them not to.",
      "Probably an escalation or two. The team can mostly handle it but I'd come back to fires.",
      "Honestly, very little. There's a clear escalation path that doesn't include me.",
      "Nothing operational. The team would email a summary on day 1 back. That's it.",
    ],
  },
  {
    id: "q10",
    dim: "leadership",
    prompt: "When a non-routine decision needs to be made — pricing exception, hiring call, big estimate — how does it typically get resolved?",
    options: [
      "It lands on my desk. I make the call.",
      "It lands on my desk eventually. I make the call after the team has tried.",
      "The team has a framework. Most non-routine decisions get made without me.",
      "Defined decision rights. The team owns their lane. I'm consulted on the rare exception.",
    ],
  },
  {
    id: "q11",
    dim: "leadership",
    prompt: "What percentage of last quarter's revenue required you personally to be involved — meetings, escalations, decisions — to make it land?",
    options: [
      "Most of it. Maybe 70%+.",
      "A lot of it. Probably 40–60%.",
      "Some of it. Maybe 20–30%.",
      "Very little. Under 10%.",
    ],
  },
  {
    id: "q12",
    dim: "leadership",
    prompt: "When something breaks — process, customer, team — the team:",
    options: [
      "…waits for me to fix it.",
      "…tries to fix it, then escalates to me.",
      "…has a defined response and fixes most of them without me knowing until the recap.",
      "…owns the post-mortem and the fix. I find out from the report.",
    ],
  },
];

/* ============================================================
 * STAGE MAPPING
 * ============================================================ */
const STAGES = [
  {
    n: 1,
    name: "Reactive Chaos",
    tag: "We grow when the right people show up.",
    band: [12, 17],
    leakageMid: 0.30, // 25-35%
    cta: {
      label: "Book a 20-min Foundation Check-in",
      url: FOUNDATION_CHECKIN_URL,
      lead: "Your foundation needs work before scale conversations. A 20-minute Foundation Check-in is the lightest first move.",
    },
    interp: "Reactive Chaos is what it sounds like — the business runs on heroics, your judgment is the engine, and growth happens when the right people show up. The number on this page is what the Wall is silently taking off your top line every year.",
  },
  {
    n: 2,
    name: "Dashboard Theater",
    tag: "We have dashboards but still can't predict.",
    band: [18, 28],
    leakageMid: 0.175, // 15-20%
    wallMessage: true,
    cta: {
      label: "Book a Friction Diagnostic Session — $3,500",
      url: FRICTION_SESSION_URL,
      lead: "Name the leak. A 90-minute Friction Diagnostic Session walks you out with a written 5-page recap, the specific leak named in dollars, and the Foundation First next move.",
    },
    interp: "Dashboard Theater means the data and tools are in place, but the team can't yet predict outcomes from them. Most $3M–$30M owner-operators stall here. The gap between Stage 2 and Stage 3 is the Replication Wall — the business has outgrown what one person can hold, and working harder doesn't get you across it.",
  },
  {
    n: 3,
    name: "Revenue Operating System",
    tag: "The business runs. The founder leads.",
    band: [29, 39],
    leakageMid: 0.04,
    cta: {
      label: "Book a Strategy Discovery call",
      url: STRATEGY_DISCOVERY_URL,
      lead: "You're past the foundation. The next altitude is Revenue Architecture — let's talk through your forecast discipline, decision rights, and the operating system that compounds.",
    },
    interp: "Revenue Operating System means the foundation is honest, forecasts hold, and the team owns their lanes. The work from here is structural acceleration, not foundation repair.",
  },
  {
    n: 4,
    name: "Intelligent Acceleration",
    tag: "The system multiplies what the team does.",
    band: [40, 45],
    leakageMid: 0.015,
    cta: {
      label: "Book a Strategy Discovery call",
      url: STRATEGY_DISCOVERY_URL,
      lead: "You're operating ahead of the curve. Let's discuss Embedded Advisory or strategic counsel on the rare exceptions the Phase 2 system isn't built to handle.",
    },
    interp: "Intelligent Acceleration means your operations and intelligence layers compound. AI augments without breaking. Most $3M–$30M businesses never reach here.",
  },
  {
    n: 5,
    name: "Autonomous Scale",
    tag: "The engine runs itself.",
    band: [46, 48],
    leakageMid: 0.005,
    cta: {
      label: "Book a Strategy Discovery call",
      url: STRATEGY_DISCOVERY_URL,
      lead: "You're at the top of the curve. The conversation here is strategic counsel, not fixes.",
    },
    interp: "Autonomous Scale is rare at this revenue band. The engine runs itself. Strategic counsel is the only useful next conversation.",
  },
];

function stageFor(total) {
  // Bands are contiguous 12-48. Out-of-range total signals incomplete state — return Stage 1 as the
  // safer fallback (a refreshed-from-empty-state user should not be shown "Autonomous Scale").
  if (typeof total !== "number" || total < 12 || total > 48) return STAGES[0];
  return STAGES.find(s => total >= s.band[0] && total <= s.band[1]) || STAGES[0];
}

/* ============================================================
 * Scale Readiness Score™ — the 40-point view
 *
 * The diagnostic produces a 12–48 raw total. We project that onto the 10–40
 * Scale Readiness Score scale (the framework on the Frameworks page).
 *
 * Linear projection: srcScore = round(((total - 12) / 36) * 30 + 10)
 *   total=12 → 10 (Grind floor)
 *   total=24 → 20 (Plateau start)
 *   total=36 → 30 (Inflection)
 *   total=48 → 40 (Machine ceiling)
 * ============================================================ */
const SRC_TIERS = [
  { band: [10, 19], name: "The Grind",      need: "Foundation work first",
    interp: "The business runs on heroics and the founder's bandwidth. The first work is foundation, not growth." },
  { band: [20, 27], name: "The Plateau",    need: "Operational architecture",
    interp: "You have systems and dashboards, but the team can't predict outcomes from them. Most $3M-$30M owner-operators stall here — and most never get out without rebuilding the operational architecture." },
  { band: [28, 34], name: "The Inflection", need: "Growth architecture overlay",
    interp: "Foundation is honest. The next altitude is building the systems that compound — forecast discipline, decision rights, the architecture that lets the business run without you in every room." },
  { band: [35, 40], name: "The Machine",    need: "Strategic counsel",
    interp: "You're operating ahead of the curve. The remaining work is strategic — the rare exceptions the Phase 2 system isn't built to handle." },
];

function srcScore(total) {
  if (typeof total !== "number" || total < 12 || total > 48) return 10;
  return Math.round(((total - 12) / 36) * 30 + 10);
}
function srcTier(score) {
  return SRC_TIERS.find(t => score >= t.band[0] && score <= t.band[1]) || SRC_TIERS[0];
}

// Reject non-https/mailto URLs to defang any future XSS via a stage CTA that gets parameterized.
function safeUrl(url) {
  if (typeof url !== "string") return "#";
  var trimmed = url.trim();
  if (/^https:\/\//i.test(trimmed)) return trimmed;
  if (/^mailto:/i.test(trimmed)) return trimmed;
  if (/^\//.test(trimmed)) return trimmed;
  return "#";
}

/* ============================================================
 * STATE
 * ============================================================ */
const STORAGE_KEY = "gfd-state-v1";

const initialAnswers = {
  p1: "", p2: "", p3: "", p4: "", p5: "", p6: "", p7: "",
  q1: null, q2: null, q3: null, q4: null,
  q5: null, q6: null, q7: null, q8: null,
  q9: null, q10: null, q11: null, q12: null,
};

let state = loadState() || { step: "welcome", answers: { ...initialAnswers } };

function loadState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object" || !obj.answers) return null;
    return obj;
  } catch (_) { return null; }
}
function saveState() {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
}
function clearState() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch (_) {}
}

/* ============================================================
 * STEP ORDER
 * ============================================================ */
const STEP_IDS = [
  "welcome",
  "identity",   // P1-P4 grouped
  "p5", "p6", "p7",
  ...QUESTIONS.map(q => q.id), // q1..q12
  "submitting",
  "results",
];

// Answerable steps (used for progress bar — welcome and submitting/results excluded)
const ANSWERABLE = STEP_IDS.slice(1, STEP_IDS.length - 2); // identity .. q12 = 16 screens

function answeredStepIndex() {
  const i = ANSWERABLE.indexOf(state.step);
  return i < 0 ? 0 : i;
}

/* ============================================================
 * RENDER
 * ============================================================ */
const stageEl  = () => document.getElementById("diag-stage");
const progress = () => document.getElementById("diag-progress");
const fill     = () => document.getElementById("diag-progress-fill");
const stepLbl  = () => document.getElementById("diag-step-label");
const pctLbl   = () => document.getElementById("diag-pct");

function renderProgress() {
  if (state.step === "welcome" || state.step === "submitting" || state.step === "results") {
    progress().hidden = true;
    return;
  }
  progress().hidden = false;
  const idx = answeredStepIndex();
  const total = ANSWERABLE.length;
  const pct = Math.round((idx / total) * 100);
  fill().style.width = pct + "%";
  stepLbl().textContent = `Step ${idx + 1} of ${total}`;
  pctLbl().textContent = pct + "%";
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}

function render() {
  renderProgress();
  const el = stageEl();
  const s = state.step;
  if (s === "welcome")     el.innerHTML = renderWelcome();
  else if (s === "identity") el.innerHTML = renderIdentity();
  else if (s === "p5")     el.innerHTML = renderChoice("p5", "What's your annual revenue band?", REVENUE_BANDS.map(b => b.label));
  else if (s === "p6")     el.innerHTML = renderChoice("p6", "What's your industry or trade?", INDUSTRIES);
  else if (s === "p7")     el.innerHTML = renderChoice("p7", "What's your role?", ROLES);
  else if (s.startsWith("q")) {
    const q = QUESTIONS.find(q => q.id === s);
    const nonTrades = NON_TRADES_INDUSTRIES.has(state.answers.p6);
    const prompt = (nonTrades && q.promptNonTrades) ? q.promptNonTrades : q.prompt;
    const opts   = (nonTrades && q.optionsNonTrades) ? q.optionsNonTrades : q.options;
    el.innerHTML = renderRating(q.id, prompt, opts);
  }
  else if (s === "submitting") el.innerHTML = renderSubmitting();
  else if (s === "results")    el.innerHTML = renderResults();
  bindStepEvents();
  el.focus?.();
}

function renderWelcome() {
  return `
    <h2>Growth Friction Diagnostic&trade;</h2>
    <p>If you're running a <strong>$3M–$30M book of business</strong> across professional services or trades, this diagnostic names what's structurally leaking revenue inside your business — in dollars.</p>
    <ul>
      <li><strong>15 minutes</strong> &middot; 19 questions</li>
      <li>Free &middot; no sales call required</li>
      <li>You get the readout immediately</li>
      <li>Your stage on the Revenue Intelligence Maturity Curve&trade;</li>
      <li>An estimate of what the Replication Wall&trade; is costing you, in dollars</li>
    </ul>
    <p class="muted" style="font-size: 0.9rem;">Your answers are not shared. We email your results to the address you provide.</p>
    <div class="diag-actions">
      <span class="spacer"></span>
      <button class="btn" id="btn-start" type="button">Start the diagnostic &rarr;</button>
    </div>
  `;
}

function renderIdentity() {
  const a = state.answers;
  return `
    <h2>Tell us who you are</h2>
    <p class="muted">We email you the readout. No spam, no list — Eugene reads every submission himself.</p>
    <p class="diag-error" id="err" hidden></p>
    <div class="diag-input-row">
      <label>First name<br><input class="diag-input" id="p1" type="text" autocomplete="given-name" value="${escape(a.p1)}" required></label>
      <label>Last name<br><input class="diag-input" id="p2" type="text" autocomplete="family-name" value="${escape(a.p2)}" required></label>
    </div>
    <label>Business email<br><input class="diag-input" id="p3" type="email" autocomplete="email" value="${escape(a.p3)}" required></label>
    <label>Company name<br><input class="diag-input" id="p4" type="text" autocomplete="organization" value="${escape(a.p4)}" required></label>
    <div class="diag-actions">
      <button class="btn-secondary" id="btn-back" type="button">&larr; Back</button>
      <span class="spacer"></span>
      <button class="btn" id="btn-next" type="button">Continue &rarr;</button>
    </div>
  `;
}

function renderChoice(key, prompt, options) {
  const a = state.answers[key];
  const items = options.map((opt, i) => `
    <li>
      <label class="${a === opt ? 'selected' : ''}">
        <input type="radio" name="${key}" value="${escape(opt)}" ${a === opt ? 'checked' : ''}>
        <span>${escape(opt)}</span>
      </label>
    </li>`).join("");
  return `
    <p class="diag-prompt">${escape(prompt)}</p>
    <ul class="diag-options" data-key="${key}">${items}</ul>
    <p class="diag-error" id="err" hidden></p>
    <div class="diag-actions">
      <button class="btn-secondary" id="btn-back" type="button">&larr; Back</button>
      <span class="spacer"></span>
      <button class="btn" id="btn-next" type="button">Continue &rarr;</button>
    </div>
  `;
}

function renderRating(qid, prompt, options) {
  const a = state.answers[qid];
  const items = options.map((opt, i) => {
    const val = i + 1; // 1-4
    const checked = a === val ? 'checked' : '';
    const selectedCls = a === val ? 'selected' : '';
    return `
      <li>
        <label class="${selectedCls}">
          <input type="radio" name="${qid}" value="${val}" ${checked}>
          <span>${escape(opt)}</span>
        </label>
      </li>`;
  }).join("");
  return `
    <p class="muted" style="font-family: var(--font-mono); font-size: 0.85rem; margin: 0 0 8px;">${qid.toUpperCase()} &middot; ${dimensionLabel(qid)}</p>
    <p class="diag-prompt">${escape(prompt)}</p>
    <ul class="diag-options" data-key="${qid}" data-rating="1">${items}</ul>
    <p class="diag-error" id="err" hidden></p>
    <div class="diag-actions">
      <button class="btn-secondary" id="btn-back" type="button">&larr; Back</button>
      <span class="spacer"></span>
      <button class="btn" id="btn-next" type="button">Continue &rarr;</button>
    </div>
  `;
}

function dimensionLabel(qid) {
  const q = QUESTIONS.find(q => q.id === qid);
  return ({
    revenue: "Revenue Engine",
    delivery: "Delivery & Operations",
    systems: "Systems & Data",
    leadership: "Leadership & Accountability",
  })[q?.dim] || "";
}

function renderSubmitting() {
  return `
    <h2>Computing your results&hellip;</h2>
    <p>Scoring across four dimensions and mapping your stage on the Revenue Intelligence Maturity Curve&trade;.</p>
    <p class="muted">This usually takes under three seconds.</p>
  `;
}

/* ============================================================
 * SCORING
 * ============================================================ */
function computeScore() {
  const a = state.answers;
  const qVal = id => Number(a[id]) || 0;
  const revenue   = qVal("q1") + qVal("q2") + qVal("q3");
  const delivery  = qVal("q4") + qVal("q5") + qVal("q6");
  const systems   = qVal("q7") + qVal("q8") + qVal("q9");
  const leadership= qVal("q10") + qVal("q11") + qVal("q12");
  const total = revenue + delivery + systems + leadership;
  const dims = [
    { key: "revenue",    label: "Revenue Engine",            score: revenue },
    { key: "delivery",   label: "Delivery & Operations",     score: delivery },
    { key: "systems",    label: "Systems & Data",            score: systems },
    { key: "leadership", label: "Leadership & Accountability", score: leadership },
  ];
  // Primary leak = lowest dimension. Tie-break order: Delivery > Systems > Leadership > Revenue.
  // (Delivery first because it's the most actionable leak for a $3M-$30M owner-operator;
  //  Revenue last because pipeline-level fixes are usually downstream of operational fixes.)
  const min = Math.min(...dims.map(d => d.score));
  const tieOrder = ["delivery", "systems", "leadership", "revenue"];
  const primary = tieOrder
    .map(k => dims.find(d => d.key === k && d.score === min))
    .find(Boolean) || dims.find(d => d.score === min);
  const stage = stageFor(total);

  // Cost-of-Wall ± 20%
  const band = REVENUE_BANDS.find(b => b.label === a.p5);
  const midpoint = band ? band.midpoint : 5_000_000;
  const central = midpoint * stage.leakageMid;
  const low = Math.round(central * 0.8 / 1000) * 1000;
  const high = Math.round(central * 1.2 / 1000) * 1000;

  // Scale Readiness Score™ — the headline, branded view
  const src = srcScore(total);
  const tier = srcTier(src);

  return { total, dims, primary, stage, costLow: low, costHigh: high, revenueBandLabel: a.p5, src, tier };
}

function fmtMoney(n) {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2).replace(/\.?0+$/, "") + "M";
  if (n >= 1_000)     return "$" + Math.round(n / 1000) + "K";
  return "$" + n;
}

function renderResults() {
  const r = computeScore();
  const wallCallout = r.stage.wallMessage ? `
    <div class="diag-wall-callout">
      You're hitting the Replication Wall&trade;. The business has outgrown what one person can hold. Working harder doesn't get you across it — that's the structural barrier we name and price below.
    </div>` : "";

  const bars = r.dims.map(d => {
    const pct = ((d.score - 3) / 9) * 100;
    const isPri = (d.key === r.primary.key);
    return `
      <div class="diag-bar-row">
        <div class="diag-bar-label">
          <span>${escape(d.label)}${isPri ? ' <span class="pri">— PRIMARY LEAK ZONE</span>' : ''}</span>
          <span class="mono">${d.score}/12</span>
        </div>
        <div class="diag-bar-track"><div class="diag-bar-fill ${isPri ? 'primary' : ''}" style="width:${pct}%"></div></div>
      </div>`;
  }).join("");

  return `
    <div class="diag-result">

      <!-- HEADLINE: Scale Readiness Score™ — the personal, possessive number -->
      <div class="diag-headline">
        <p class="muted" style="font-family: var(--font-mono); font-size: 0.85rem; margin:0; letter-spacing: 0.06em;">YOUR SCALE READINESS SCORE&trade;</p>
        <p class="diag-score-big"><span class="diag-score-num">${r.src}</span><small> / 40</small></p>
        <p class="diag-tier-name">${escape(r.tier.name)}</p>
        <p class="diag-tier-need"><span class="diag-tier-need-label">What&rsquo;s needed:</span> ${escape(r.tier.need)}</p>
      </div>

      <p class="diag-tier-interp">${escape(r.tier.interp)}</p>

      <!-- SECONDARY: RI Maturity Curve stage + cost of the Wall -->
      <div class="diag-secondary">
        <p class="muted" style="font-family: var(--font-mono); font-size: 0.8rem; margin:0; letter-spacing: 0.06em;">REVENUE INTELLIGENCE MATURITY CURVE&trade;</p>
        <p class="diag-stage-line">Stage ${r.stage.n} of 5 &mdash; <strong>${escape(r.stage.name)}</strong></p>
        <p class="diag-stage-tag">&ldquo;${escape(r.stage.tag)}&rdquo;</p>
        <p class="muted" style="margin: var(--gap-sm) 0 0;">Estimated annual cost of the Wall</p>
        <p class="diag-cost">${fmtMoney(r.costLow)} – ${fmtMoney(r.costHigh)}</p>
        <p class="muted" style="font-size: 0.85rem;">Based on Stage ${r.stage.n} leakage applied to your revenue band (${escape(r.revenueBandLabel || "—")}).</p>
      </div>

      ${wallCallout}

      <h3>Where it's leaking</h3>
      <div class="diag-bars">${bars}</div>

      <p class="muted" style="font-size: 0.85rem;">${escape(r.stage.interp)}</p>

      ${r.stage.n <= 2 ? `<img class="diag-wall-img" src="/assets/replicationWall.png" alt="The Replication Wall — a structural barrier between hustle-led growth and systems-led scale.">` : ""}

      <div class="diag-cta-block">
        <h3>Where to go next</h3>
        <p><strong>Start with a Strategy Discovery call.</strong> 30 minutes, free. No commitment, no pitch. We talk through your score, you decide whether the next step makes sense.</p>
        <p><a class="btn" href="${escape(safeUrl(STRATEGY_DISCOVERY_URL))}" target="_blank" rel="noopener noreferrer">Book a Strategy Discovery call &rarr;</a></p>
        ${r.stage.cta.url !== STRATEGY_DISCOVERY_URL ? `
        <hr style="border-top: 1px solid var(--blueprint-line); margin: var(--gap-md) 0;">
        <p class="muted" style="font-size: 0.9rem;">Or, based on your stage, the most efficient next move:</p>
        <p><strong>${escape(r.stage.cta.label)}.</strong> ${escape(r.stage.cta.lead)}</p>
        <p><a class="btn-text" href="${escape(safeUrl(r.stage.cta.url))}" target="_blank" rel="noopener noreferrer">${escape(r.stage.cta.label)} &rarr;</a></p>
        ` : ""}
      </div>

      <p class="muted" style="margin-top: var(--gap-md); font-size: 0.85rem;">A copy of these results is being emailed to ${escape(state.answers.p3 || "you")}. Eugene reads every submission himself; expect a personal follow-up within 24 hours.</p>
      <p style="margin-top: var(--gap-md);"><a class="btn-text" href="/" id="btn-home">Back to home &rarr;</a></p>
    </div>
  `;
}

/* ============================================================
 * EVENTS
 * ============================================================ */
function bindStepEvents() {
  const start = document.getElementById("btn-start");
  if (start) start.addEventListener("click", () => { goTo("identity"); });

  const back = document.getElementById("btn-back");
  if (back) back.addEventListener("click", () => goBack());

  const next = document.getElementById("btn-next");
  if (next) next.addEventListener("click", () => goNext());

  // Radio listeners — capture selection + highlight
  document.querySelectorAll(".diag-options").forEach(ul => {
    const key = ul.dataset.key;
    const isRating = ul.dataset.rating === "1";
    ul.querySelectorAll("input[type=radio]").forEach(input => {
      input.addEventListener("change", e => {
        const val = isRating ? Number(e.target.value) : e.target.value;
        state.answers[key] = val;
        // Update visual selection
        ul.querySelectorAll("label").forEach(l => l.classList.remove("selected"));
        e.target.closest("label").classList.add("selected");
        saveState();
      });
    });
  });

  // Identity inputs — live save
  ["p1","p2","p3","p4"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", e => {
      state.answers[id] = e.target.value;
      saveState();
    });
  });

  // Allow Enter to advance from identity form
  const ident = document.getElementById("p4");
  if (ident) ident.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); goNext(); }
  });
}

function goTo(step) {
  state.step = step;
  saveState();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goBack() {
  const i = STEP_IDS.indexOf(state.step);
  if (i <= 0) return;
  goTo(STEP_IDS[i - 1]);
}

function goNext() {
  const err = validate(state.step);
  if (err) { showError(err); return; }
  const i = STEP_IDS.indexOf(state.step);
  const nextStep = STEP_IDS[i + 1];
  if (nextStep === "submitting") {
    submit();
  } else {
    goTo(nextStep);
  }
}

function validate(step) {
  const a = state.answers;
  if (step === "identity") {
    if (!a.p1.trim()) return "First name is required.";
    if (!a.p2.trim()) return "Last name is required.";
    if (!a.p3.trim()) return "Business email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.p3.trim())) return "That email address doesn't look right.";
    if (!a.p4.trim()) return "Company name is required.";
    return null;
  }
  if (step === "p5") return a.p5 ? null : "Choose a revenue band.";
  if (step === "p6") return a.p6 ? null : "Choose your industry.";
  if (step === "p7") return a.p7 ? null : "Choose your role.";
  if (step.startsWith("q")) return Number(a[step]) >= 1 ? null : "Choose the answer that's closest to true.";
  return null;
}

function showError(msg) {
  const e = document.getElementById("err");
  if (!e) return;
  e.hidden = false;
  e.textContent = msg;
}

/* ============================================================
 * SUBMIT
 * ============================================================ */
async function submit() {
  goTo("submitting");
  const r = computeScore();
  const payload = {
    submitted_at: new Date().toISOString(),
    user_agent: navigator.userAgent,
    p1_first_name: state.answers.p1,
    p2_last_name: state.answers.p2,
    p3_email: state.answers.p3,
    p4_company: state.answers.p4,
    p5_revenue_band: state.answers.p5,
    p6_industry: state.answers.p6,
    p7_role: state.answers.p7,
    q1: state.answers.q1, q2: state.answers.q2, q3: state.answers.q3,
    q4: state.answers.q4, q5: state.answers.q5, q6: state.answers.q6,
    q7: state.answers.q7, q8: state.answers.q8, q9: state.answers.q9,
    q10: state.answers.q10, q11: state.answers.q11, q12: state.answers.q12,
    total_score: r.total,
    src_score: r.src,
    src_tier: r.tier.name,
    dim_revenue: r.dims[0].score,
    dim_delivery: r.dims[1].score,
    dim_systems: r.dims[2].score,
    dim_leadership: r.dims[3].score,
    primary_leak: r.primary.label,
    stage_n: r.stage.n,
    stage_name: r.stage.name,
    cost_low: r.costLow,
    cost_high: r.costHigh,
  };

  try {
    if (APPS_SCRIPT_URL && APPS_SCRIPT_URL !== "REPLACE_ME_AFTER_DEPLOY") {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        // Apps Script Web Apps reject preflight; use simple request shape
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        redirect: "follow",
      });
      // We do not depend on the response — fire-and-trust pattern.
    } else {
      console.warn("[diagnostic] APPS_SCRIPT_URL not configured; submission not sent. Results still render.");
    }
  } catch (err) {
    console.error("[diagnostic] submission failed (results still render):", err);
  }

  // Always render results regardless of POST success
  goTo("results");
}

/* ============================================================
 * BOOT
 * ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  // Reset state on results so reload starts fresh — but only after viewing results once
  if (state.step === "submitting") {
    // Recover: if a refresh landed mid-submit, send the user to results so they see their score
    state.step = "results";
    saveState();
  }
  // Guard against a stale "results" step with incomplete answers (e.g. user opens the page
  // tomorrow with a partially-filled session). Force a restart if scoring would be bogus.
  if (state.step === "results") {
    const r = computeScore();
    if (r.total < 12) {
      clearState();
      state = { step: "welcome", answers: { ...initialAnswers } };
      saveState();
    }
  }
  render();

  // "Back to home" link clears state so a return visit starts fresh
  document.addEventListener("click", e => {
    if (e.target && e.target.id === "btn-home") clearState();
  });
});
