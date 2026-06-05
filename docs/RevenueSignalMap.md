# The Revenue Signal Map (RSM)

> **Canonical alignment for the atScale diagnostic.** One position on the journey,
> described at four altitudes. This is the single source of truth: the diagnostic
> code (`js/diagnostic.js`) derives everything from it, so the score, the journey
> phase, the RIM stage, and the cost-of-Wall can never contradict each other.

## The one-sentence pitch (internal / sales-call spine)

> *"Mrs. Customer — your revenue and operations signals put you in **this tier**, at
> **this phase** of the journey, which on the Revenue Intelligence Maturity Curve is
> **this stage**. Here's the exact part of the Foundation First get-well plan you start
> with."*

This is the **internal engine** and the **Strategy Discovery call script**. It is
**not** the free-readout headline — see "Disclosure discipline" below.

## The canonical table

| Scale Readiness Score (tier) | ORIA phase (journey) | RIM stage (mile-marker) | Foundation First (get-well) | vs. the Wall |
|---|---|---|---|---|
| **The Grind** · 10–19 | Operations → Replication | **1 — Reactive Chaos** (25–35% leak) | **Survive** | approaching it |
| **The Plateau** · 20–27 | Replication (stuck) | **2 — Dashboard Theater** (15–20% leak) | **Systematize** | **AT the Wall** |
| **The Inflection** · 28–34 | Intelligence | **3 — Revenue Operating System** (<5% leak) | **Scale** | just crossed |
| **The Machine** · 35–40 | Intelligence → Automation | **4–5 — Intelligent Acceleration / Autonomous Scale** (<2% / <1%) | **Scale** | well past |

**The Replication Wall** sits between **The Plateau and The Inflection** = between
**RIM Stage 2 and Stage 3** = between **Replication and Intelligence** (ORIA). That
single chokepoint is the emotional center of the whole diagnostic, and The Plateau
is the highest-volume buyer who lives there.

## How the four framings relate

- **ORIA** (Operations → Replication → Intelligence → Automation) = the *journey* — the road.
- **The Replication Wall** = the *one chokepoint* on that road.
- **RIM Curve** (5 stages, with leakage %) = the *mile-markers* — where you are, and what it costs.
- **Scale Readiness Score tier** (Grind / Plateau / Inflection / Machine) = the *plain-language verdict* — the headline number a buyer quotes.

They are not four separate models. They are one position at four zoom levels.

## Scoring mechanics (as implemented)

- Raw diagnostic total: **12–48** (4 dimensions × 3 questions × 1–4 points).
- Projected to the **Scale Readiness Score (10–40)**: `round(((total − 12) / 36) × 30 + 10)`.
- **Tier** = which SRC band the score lands in.
- **RIM stage** = `stageForSrc(score)` — *derived from the tier*, not from the raw total.
  This is the alignment fix: before, the tier and stage used independent breakpoints,
  so an 18/40 could read "The Grind" **and** "Stage 2 — Dashboard Theater" at once.
  Now Grind→Stage 1, Plateau→Stage 2, Inflection→Stage 3, Machine→Stage 4 (5 at 40/40).
- **Cost-of-Wall** = revenue-band midpoint × the stage's leakage midpoint, ±20%.

## Disclosure discipline (why the customer does NOT see all four at once)

The four-framing narrative is **authority in a human conversation** and **jargon-soup on
a free auto-readout.** A $3–30M owner-operator wants: (1) what's broken, in dollars,
(2) am I normal, (3) the one next move. Every named framework is a toll paid before they
can act.

So the diagnostic **results page** uses progressive disclosure:

1. **Headline** — Scale Readiness Score + tier + the dollar leak. *(the number they quote)*
2. **One plain translation line** — the tier interp, in owner-language.
3. **The Revenue Signal Map strip** — one coherent row (Tier · Journey · Stage · Plan + cost)
   for the buyer who wants the system. Subordinate to the headline. Not four callouts.
4. **Where it's leaking** + the single next CTA.

Keep "Revenue Signal Map" as the **internal name** and the **Discovery-call spine**.
Do **not** stamp it as another customer-facing ™ unless it replaces an existing term —
the brand already carries ~6.

## Change log

- 2026-06-05 — Created. Realigned `stageForSrc` so RIM stage derives from the SRC tier
  (kills the Grind↔Stage-2 straddle); added ORIA phase, Foundation First step, and Wall
  position to each tier; replaced the standalone RIM-Curve results block with the unified
  Revenue Signal Map strip.
