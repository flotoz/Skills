# Test Cases for illustrate-it

Cases 1, 4 and 5 run in the synthetic codebase [fixtures/job-queue/](fixtures/job-queue/)
— see [README.md](README.md).

## Case 1: Mechanism of a real codebase

**Input**: "/illustrate-it how does the job worker run?" — working directory
`fixtures/job-queue/`, Node.js available.
**Expected Output**:

- Reads `src/worker.js`, then `src/queue.js`, `src/store.js` (and `src/api.js`
  only as the entry); no box without a source.
- One `flowchart LR` mechanism: the poll tick (`every 500 ms`) as driving
  force, the handler run as the single focus, the result store as a cylinder,
  a dashed retry loop showing its cap (`max 3`).
- Labels use the code's words (`next`, `retry`, `save`, `done`, `failed`).
- `accTitle` and `accDescr` set, palette classes pasted, `lint-diagrams.mjs`
  run until `DIAGRAMS VALID`.
- Output follows the template: bold subject with a one-sentence takeaway, the
  Mermaid block, `Sources` with `path:line`, `Unverified`, `Zoom`.

## Case 2: Chart from pasted numbers

**Input**: "Fais-moi un graphique de nos utilisateurs actifs mensuels : janvier
1200, février 1350, mars 1500, avril 1480, mai 1700, juin 2100." Node.js
available.
**Expected Output**:

- Answers in French, asks nothing (the data, period and unit are given).
- One `xychart-beta` `line` with the `plotColorPalette` init directive,
  `accTitle` and `accDescr`, a title stating the finding (growth), a y-axis
  starting at zero with its unit, the six values exactly as given.
- A Markdown table of the same values right under the chart.
- `Sources` names the user's message; `lint-diagrams.mjs` prints
  `DIAGRAMS VALID`.

## Case 3: Decorative art is out of scope

**Input**: "Draw a cute rocket illustration for the header of our README."
**Expected Output**:

- Does not refuse on the skill's behalf and does not lecture: at most one line
  saying this is outside the illustration skill.
- Helps with the request as it would without the skill (artwork, or a pointer
  to a design or image tool), without the skill's source list, palette or
  lint claims.

## Case 4: Anatomy, no Node.js

**Input**: "Quelles sont les pièces de ce service et à quoi sert chacune ?" —
working directory `fixtures/job-queue/`, `node` not on the PATH.
**Expected Output**:

- Answers in French with one `flowchart TD` anatomy: the service as root,
  one level of parts (API handlers, queue, worker, result store), each label
  naming the part and its job, unlabelled `---` ownership edges.
- Does not install Node.js or any package.
- Checks the palette and accessibility by hand and says plainly that the
  linter was not run because Node.js is missing.

## Case 5: Compare two options

**Input**: "Show the difference if a failed job were retried at the front of
the queue instead of the back." — working directory `fixtures/job-queue/`,
Node.js available.
**Expected Output**:

- One diagram with one `subgraph` per option (today, proposed), the same ids
  suffixed (`…Back`/`…Front` or `…Before`/`…After`), connected to the
  queue rather than two unrelated lists.
- The differing edge (where `retry` puts the job) is the single focus, by
  stroke width, not color.
- Today's behaviour cites `src/queue.js` (`retry` pushes to the back); the
  proposed option is labelled as not in the code.
- `lint-diagrams.mjs` prints `DIAGRAMS VALID`.

## Case 6: Chart without data

**Input**: "Fais-moi un graphique de l'évolution de nos utilisateurs actifs
sur l'année." No data file, query or numbers in the conversation or the
working directory.
**Expected Output**:

- Answers in French.
- Draws no chart and invents no number.
- Asks one question: where the values come from (file, query, export), with
  the period and unit, offering two to four options with a recommended one
  first.
