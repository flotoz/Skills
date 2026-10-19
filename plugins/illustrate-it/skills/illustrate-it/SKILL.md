---
name: illustrate-it
description: >-
  Draws one verified, accessible illustration from the real code, docs or
  data: workflow, mechanism, anatomy, layout, architecture, data flow,
  lifecycle or chart, in Mermaid or SVG readable on light and dark themes.
  Use when the user asks to show, draw, map, diagram, chart or visualize how
  something works or what it is made of (schéma, diagramme, dessine-moi,
  graphique), even if they do not say "diagram".
effort: low
disable-model-invocation: false
user-invocable: true
---

# Illustrate It

One question in, one illustration out. Every box, part or point maps to
something real: a file, a symbol, a step, a command, a measured value. An
illustration that invents a box or a number lies, and a reader cannot tell.

Answer in the user's language; keep code identifiers as they are.

## Hard rules

- **Read-only.** Never edit code or docs to make a picture fit. Write the
  illustration to a file only when the user asks.
- **No invented value.** A chart value without a named source (file, query,
  run, the user's message) is not drawn; a node without a source is removed
  or marked `?` under _Unverified_.
- **No decorative art.** Logos, mascots, banners and "nice pictures" are not
  this job: say so and offer a diagram of what the subject does instead.
- **Install nothing** without asking. The linters need Node.js only; if it is
  missing, check by hand and say the lint was not run.

## Inputs

`/illustrate-it <subject>`: a workflow, a feature, an engine, a folder, a use
case, a spec, a pull request or a data set. No subject: illustrate the change
in progress (`git diff --stat` against the default branch).

**Ask before drawing** when a doubt would change the picture. Ask one question
at a time, offering two to four readings with your pick first:

- the subject has several readings (which flow, which screen, which version);
- the kind is unclear (how it runs, what it is made of, how a number moves);
- the reader is unknown (a developer wants files, a product owner wants steps);
- a chart lacks its data source, period or unit;
- the destination is unclear (an answer in chat, or a doc to edit).

No doubt, no question. Called by another skill or with no user to answer: ask
nothing, take your recommended reading and say so in the caption.

## Process

Copy this checklist and tick it:

```text
- [ ] 1. Locate the sources
- [ ] 2. Pick the kind and type
- [ ] 3. Decide what to draw
- [ ] 4. Draft the nodes and edges
- [ ] 5. Verify: truth, lint, render, squint
- [ ] 6. Output and caption
```

### 1. Locate the sources

Read only what the subject forces: its entry point, then callers and callees up
to two levels. For a doc or a spec, read it and the files it links. For a
chart, read the query, file or run producing each value. Stop at framework
wiring (DI, middleware, build config) unless it is the subject.

### 2. Pick the kind and type

| The question is…                           | Kind      | Type              |
| ------------------------------------------ | --------- | ----------------- |
| What happens, in which order, who decides  | workflow  | `flowchart LR/TD` |
| What drives it, what turns, what comes out | mechanism | `flowchart LR`    |
| Which parts it has, what each one does     | anatomy   | `flowchart TD`    |
| Which layers stack, what sits where        | layout    | SVG               |
| Who talks to whom, with which message      | exchange  | `sequenceDiagram` |
| Which states an item moves through         | lifecycle | `stateDiagram-v2` |
| What is made of what, in the code          | structure | `classDiagram`    |
| Which data is stored and linked            | data      | `erDiagram`       |
| How a number evolves or compares           | chart     | `xychart-beta`    |

When two fit, choose the one answering the user's literal question. "How
does it run" on something that loops (a worker, a scheduler, an engine, a
game loop, a sync) is a mechanism, not a workflow: draw the loop and its
tempo, not every branch of the code. For a mechanism, an anatomy, a layout, a
chart or a data recap, read its pattern in
[illustration-kinds.md](references/illustration-kinds.md) before drafting.

### 3. Decide what to draw

- **The mechanism, not its name**: a box labelled `cache` says less than the
  path a request takes through it and the arrow that vanishes without it. Show
  the boundary crossed, the hop added, the data moved; drop the rest.
- **Comparing options**: draw the difference, before and after side by side,
  with the one edge each option adds or removes highlighted. Boxes per option,
  unconnected to the system, are a list, not a comparison.
- **Stakes set the size**: a one-hop question is three boxes; a rerouted write
  needs the queue, the writer, the reader and the ordering arrow.
- **Boldness in one place**: at most one `focus` node or edge, the thing the
  illustration is about; everything else stays quiet.
- If one sentence says it faster, write the sentence and draw nothing; if a
  table of three numbers says it, write the table, not a chart.

### 4. Draft

Write it as code. Read [diagram-style.md](references/diagram-style.md) and
[palette.md](references/palette.md) (mandatory): `accTitle` and `accDescr`,
camelCase domain ids, nodes then edges then classes, the measured palette, at
most 15 nodes. Read [svg.md](references/svg.md) only when Mermaid cannot lay the
subject out.

- Labels use the code's or the doc's own words, never synonyms.
- Decisions are diamonds asking a question; their edges say `yes`/`no`.
- Edge labels say what flows (`job id`, `result`), not `calls`; loops show
  their cap (`error, max 3`).

### 5. Verify

1. **Truth**: name each node's source (`path:line`, doc section, command) and
   each chart value's (query, file, run). Apply the hard rule on invented
   values.
2. **Lint**: save the draft to a temporary `.md` file and run
   `node <this skill's folder>/scripts/lint-diagrams.mjs <file.md>` until it
   prints `DIAGRAMS VALID` (accessible name, measured WCAG contrast on white
   and dark, frames, sequence fills, chart colors, ids, size, label and line
   length). A hand-drawn SVG passes `scripts/lint-svg.mjs <file.svg>` until
   `SVG VALID`. No Node.js: check the same rules against
   [palette.md](references/palette.md) by hand and say so in the caption.
3. **Render** when a renderer is already available (an inline visual tool,
   `mmdc`, an IDE preview), on a white and a dark background, and look at both.
   A parse error, a crossing edge, a faint series or an unreadable label sends
   you back to step 4. No renderer: say the picture was not rendered.
4. **Squint test**: the main path reads in one glance; the illustration still
   makes sense in grayscale.

### 6. Output

In this order:

````markdown
**<Subject>** — <the takeaway, in one sentence>

```mermaid
<diagram>
```

- Sources: <path:line or doc section per cluster, query per data series>
- Unverified: <nodes marked ?, or none>
- Checks: <lint result, rendered or not>
- Zoom: <clusters worth a detailed illustration, or none>
````

When the runtime renders visuals inline (a widget or artifact tool), also show
the illustration there; the Mermaid block stays the portable source. When the
user asks for it in a doc, put it right under the heading of the section it
answers, after the prose sentence stating the takeaway.

## Rules

- No decorative nodes (`Start`, `End`) unless the flow has several exits.
- An anatomy or a mechanism shows parts and forces, never a drawing of the
  object for its own sake.
- The caption never claims more than the illustration shows, nor a check that
  was not run.
