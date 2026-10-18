# Report Template

Use this structure for a full check-up. Translate labels into the user's
language and use the currency returned by Finary (`k` = thousands). Replace
every `…` with real data or `?`. Drop a section only if it truly does not
apply. Target: readable in under 2 minutes.

````markdown
## 🎯 Verdict
<One sentence: overall state + the single most important thing to do.>

## 🧱 Your pyramid
```
            ▲ TOP        …k   …%   🟢/🟠/🔴   (target ≤ 5–10 %)
           ╱ ╲
          ╱CORE╲         …k   …%   🟢/🟠/🔴   (… % equity, TER ≈ …%)
         ╱──────╲
        ╱CUSHION ╲       …k   … months   🟢/🟠/🔴   (target 3–6)
       ╱──────────╲
      ╱   BUDGET   ╲     savings rate …%   🟢/🟠/🔴   (target ≥ 20 %)
     ╱──────────────╲
     Net worth ≈ …k   ·   Debts ≈ …k
```

## 🌍 Exposure (equities)
```
US        ████████████████░░░░  …%  (world ≈ 62 %)  🟢/🟠/🔴
Europe    ████░░░░░░░░░░░░░░░░  …%  (world ≈ 15 %)  🟢/🟠/🔴
Japan     █░░░░░░░░░░░░░░░░░░░  …%  (world ≈ 5 %)
Emerging  ██░░░░░░░░░░░░░░░░░░  …%  (world ≈ 10 %)  🟢/🟠/🔴
 └ China  █░░░░░░░░░░░░░░░░░░░  …%  (world ≈ 3 %)   🟢/🟠/🔴
```
<One line: largest sector …%, largest single line …%. Mark `≈ est.` when
derived from index look-through.>

## 📊 Scorecard
| Check | You | Target | |
| --- | --- | --- | --- |
| Savings rate | …% | ≥ 20 % | 🟢 |
| Safety cushion | … months | 3–6 | 🟠 |
| PEA before CTO | PEA …k / CTO …k | PEA first | 🔴 |
| Average fund fees | …% | ≤ 0.3 % | 🟢 |
| Equity vs horizon | …% for … yrs | …% | 🟢 |
| Exposure | US …% · China …% | ≈ world | 🟠 |
| Top of pyramid | …% | ≤ 5–10 % | 🟢 |

## ✅ Top 3 actions (in order)
1. **<Action>** — <why, with the number> → <amount / frequency>.
2. …
3. …

## 📈 Compound interest
<From `simulate_compound_interest`: monthly amount, rate assumption,
horizon → projected value. State the assumption (e.g. 6 %/yr nominal, not
guaranteed).>

## ❓ To go further
<2–4 challenge questions that would change the recommendations.>

---
*Educational analysis based on your Finary data, not regulated personalised
investment advice.*
````

## Rules

- Bars: 20 characters = 100 %, rounded to the nearest 5 %.
- Max 3 actions, ordered bottom-up (budget → cushion → envelopes/core →
  exposure → top).
- Each action has a number (amount, %, date) — never a vague "consider
  diversifying".
- ASCII diagrams by default; a Mermaid `pie` is allowed if the client renders
  Mermaid.
- No paragraph longer than two lines; prefer tables and bullets.
