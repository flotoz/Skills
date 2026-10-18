# Report Template

Use this structure every time. Translate labels into the user's language.
Replace every `…` with real data or `?`. Delete a section only if it truly does
not apply to the question. Target: readable in under 2 minutes.

````markdown
## 🎯 Verdict
<One sentence: overall state + the single most important thing to do.>

## 🧱 Your pyramid
```
            ▲ TOP        …k€   …%   🟢/🟠/🔴   (target ≤ 5–10 %)
           ╱ ╲
          ╱CORE╲         …k€   …%   🟢/🟠/🔴   (… % equity, TER ≈ …%)
         ╱──────╲
        ╱ SAFETY ╲       …k€   … months   🟢/🟠/🔴   (target 3–6)
       ╱──────────╲
      ╱   BUDGET   ╲     savings rate …%   🟢/🟠/🔴   (target ≥ 20 %)
     ╱──────────────╲
     Net worth ≈ …k€   ·   Debts ≈ …k€
```

## 📊 Scorecard
| Check | You | Target | |
| --- | --- | --- | --- |
| Savings rate | …% | ≥ 20 % | 🟢 |
| Emergency fund | … months | 3–6 | 🟠 |
| PEA used first | yes/no (…k€) | yes | 🔴 |
| Average fund fees | …% | ≤ 0.3 % | 🟢 |
| Equity vs horizon | …% for … yrs | …% | 🟢 |
| Top layer | …% | ≤ 5–10 % | 🟢 |

## ✅ Top 3 actions (in order)
1. **<Action>** — <why, with the number> → <concrete amount / frequency>.
2. …
3. …

## 📈 Compound interest
<From `simulate_compound_interest`: monthly amount, rate assumption, horizon
→ projected value. State the assumption (e.g. 6 %/yr nominal, not
guaranteed).>

## ❓ To go further
<2–4 challenge questions that would change the recommendations.>

---
*Educational analysis based on your Finary data, not regulated personalised
investment advice.*
````

## Rules

- Max 3 actions, ordered bottom-up in the pyramid (budget → safety → core →
  top).
- Each action has a number (amount, %, date) — no vague "consider
  diversifying".
- Use the ASCII pyramid in plain-text clients; a Mermaid `pie` for allocation
  is allowed if the client renders Mermaid.
- No more than one short paragraph anywhere; prefer tables and bullet points.
