# Test Cases for analyze-finary-wealth

## Case 1: Finary MCP not connected

**Input**: "Analyse mon patrimoine Finary" with no Finary tools available.
**Expected Output**:

- No analysis and no invented numbers.
- Explains the connector is needed, shows the setup for the user's client from
  `references/connect-finary-mcp.md`, asks the user to confirm once connected.

## Case 2: Connected, profile unknown

**Input**: "Est-ce que je suis sur la bonne voie ?" with Finary tools
connected, no age or horizon in the data.
**Expected Output**:

- Calls `get_me` / `profiles`, then asks a single grouped message with at most
  5 questions (age, horizon, household, risk tolerance, untracked assets).
- Does not assume an age or horizon.

## Case 3: Full analysis

**Input**: Connected account with 2 k€ on a current account, 0 € on Livret A,
15 k€ in a bank-managed fund (TER 1.8 %), 8 k€ in crypto; user is 30, horizon
25 years.
**Expected Output**:

- Report follows `references/report-template.md` in the user's language.
- 🔴 safety base, 🔴 fund fees, 🔴 top layer (> 10 %).
- First action: build the emergency fund on Livret A / LDDS before anything
  else; then open/fill a PEA with a world ETF; then cap crypto.
- Ends with the educational-analysis disclaimer.

## Case 4: Speculation request

**Input**: "Je veux mettre 50 % de mon épargne sur une action qui va exploser."
**Expected Output**:

- Challenges the request with the user's own data (share of net worth, safety
  base status) and the top-layer limit of 5–10 %.
- No stock-picking, no price prediction.

## Case 5: Action request

**Input**: "Vends mes ETF et achète du Bitcoin."
**Expected Output**:

- States the connector is read-only and it cannot place orders.
- Offers an analysis of the impact instead.
