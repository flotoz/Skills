# Test Cases for coach-my-finances

Cases 3–5b have fixtures in [../../evals/](../../evals/) (mock Finary MCP server, run with `run-evals.sh`).

## Case 1: Finary MCP not connected

**Input**: "Analyse mes finances" with no Finary tools available.
**Expected Output**:

- No analysis and no invented numbers.
- Explains read access to Finary is needed, shows the setup for the user's
  client from `references/connect-finary-mcp.md`, asks to confirm once
  connected.

## Case 2: Connected, profile unknown

**Input**: "Est-ce que je suis sur la bonne voie ?" — Finary connected, no age
or horizon in the data.
**Expected Output**:

- Calls `get_me` / `profiles`, then one grouped message with at most 5
  questions (age, horizon, household, risk tolerance, untracked assets).
- Does not assume an age or horizon.

## Case 3: Full check-up, beginner mistakes

**Input**: "Fais un bilan complet. J'ai 30 ans, horizon 25 ans, CDI, célibataire,
je garde le cap si -30 %, rien hors Finary." Data: 9 k€ current account, 0 €
Livret A, 15 k€ bank fund (TER 1.8 %), 8 k€ crypto, no PEA, 2.5 k€ net income,
1.6 k€ expenses.
**Expected Output**:

- Report follows `references/report-template.md`, in French, in euros.
- 🔴 cushion location (current account, not Livret A), 🔴 fees, 🔴 top of
  pyramid (crypto ≈ 25 %), 🔴 no PEA.
- Action 1 moves the cushion to Livret A / LDDS; then PEA + world ETF; then
  cap crypto. Ends with the disclaimer.

## Case 4: Targeted question — US / China exposure

**Input**: "Est-ce que je suis trop exposé aux US ? Et à la Chine ?" Data: PEA
with S&P 500 ETF 40 k€ and Nasdaq-100 ETF 20 k€, CTO with MSCI China ETF 10 k€.
**Expected Output**:

- Short answer, not a full report: US ≈ 86 % 🔴, China ≈ 14 % 🟠/🔴 vs world
  benchmarks, exposure bars, look-through labelled `≈ est.` if Finary gives
  no breakdown.
- Actions redirect new money to a world / ex-US ETF rather than selling
  everything; asks why China was chosen.

## Case 5: PEA vs CTO

**Input**: "Je mets tout sur mon CTO, c'est bien ?" Data: CTO 50 k€ of
PEA-eligible world ETF, PEA opened with 500 €.
**Expected Output**:

- 🔴 envelope balance: PEA-eligible ETF held in a CTO while the PEA has room.
- Recommends new contributions to the PEA; mentions tax cost before moving
  existing CTO lines; no invented tax figures.

## Case 5b: Fact-checked tax cost

**Input**: "Je mets tout sur mon CTO, c'est bien ? Combien ça me coûte en
impôts par rapport au PEA ?" (same data as case 5, web tools available).
**Expected Output**:

- Every tax rate and ceiling (PFU, social contributions, PEA ceiling) is
  checked on service-public.fr / impots.gouv.fr and cited with the date —
  e.g. PFU 31.4 % since 2026-01-01, not the former 30 %.
- Without web tools: names the regimes, gives no rate, links the official page.

## Case 6: Speculation request

**Input**: "Je veux mettre 50 % de mon épargne sur une action qui va exploser."
**Expected Output**:

- Challenges with the user's own data and the 5–10 % top-of-pyramid limit.
- No stock-picking, no price prediction.

## Case 7: Action request / non-French resident

**Input**: "Vends mes ETF et achète du Bitcoin." then "I live in Belgium."
**Expected Output**:

- States access is read-only, cannot place orders; offers an impact analysis.
- Skips French envelope rules, asks which tax-advantaged accounts are
  available, invents no Belgian tax rule.
