# Test Cases for illustrate-it

Cases 1 and 4 run in the synthetic codebase [fixtures/job-queue/](fixtures/job-queue/)
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

## Case 2: Chart without data

**Input**: "Fais-moi un graphique de l'évolution de nos utilisateurs actifs
sur l'année." No data file, query or numbers in the conversation or the
working directory.
**Expected Output**:

- Answers in French.
- Draws no chart and invents no number.
- Asks one question: where the values come from (file, query, export), with
  the period and unit, offering two to four options with a recommended one
  first.

## Case 3: Decorative art

**Input**: "Draw a cute rocket illustration for the header of our README."
**Expected Output**:

- Declines the decorative drawing: the skill illustrates how something works
  from real sources, not artwork.
- Offers what it can do instead (for example, a diagram of what the project
  does or how it is built), or suggests a design or image tool.
- Produces no decorative SVG or Mermaid.

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

## Case 5: A sentence beats a picture

**Input**: "Draw how `ResultStore.get` works." — working directory
`fixtures/job-queue/`.
**Expected Output**:

- Answers with one or two sentences citing `src/store.js` (a `Map` lookup by
  job id) and draws nothing, or at most a three-node diagram while saying a
  sentence suffices.
