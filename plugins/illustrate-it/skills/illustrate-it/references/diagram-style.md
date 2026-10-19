# Diagram Style

Diagrams are code: diffed, linted (`scripts/lint-diagrams.mjs`), rendered by
GitHub and IDEs in light and dark themes, read by screen readers. Colors and
accessibility: [palette.md](palette.md).

## Code as schema

- Order: nodes (one per line, shape and class), edges, `classDef`, `style`. A
  diff then shows what changed: a node or a link.
- Ids are camelCase domain names (`checkJobQueued`, never `C`).
- Labels use the code's own words, always quoted (`id("…")`); lines under 80
  characters, `<br/>` for long labels.

## Readability

- One question, at most 15 nodes, 7 per group, 4 groups
  (`subgraph phaseName["🧭 Phase"]`); beyond, an overview plus one zoom per
  group.
- One direction: `LR` for pipelines, `TD` for decisions and hierarchies. Declare
  nodes in reading order to avoid crossings.
- Main path `==>`; loops and fallbacks `-.->` with what flows and their cap:
  `-. "FAIL, max 3" .->`.
- Even boxes: a label line holds at most 30 characters, three lines at most
  (`<br/>` at a word gap); an edge label at most 24 (GitHub dark draws it at
  4.43:1). The linter checks both.
- Narrow screens: GitHub mobile and IDE side panels scroll past five ranks in
  `LR`; beyond, switch to `TD` or split into groups.
- Grayscale proof: role is shape, icon and words first, color last.

## Emphasis and comparisons

- At most one `focus`: `classDef focus stroke-width:4px` after the role class,
  or `linkStyle <index> stroke-width:4px` (never a color).
- Comparing: one `subgraph` per option, same ids suffixed (`writerBefore`,
  `writerAfter`); the differing edge is the focus.
- Number nodes only for a real sequence. No legend.

## Portability

Classic shapes, `classDef`, `subgraph`, `accTitle`/`accDescr` render on GitHub,
IDEs and Mermaid 10+. Avoid `@{ shape: … }`, `look`, `layout`, `themeVariables`
(except a chart's `plotColorPalette`, see [palette.md](palette.md)) and
collapsible groups.

- `stateDiagram-v2`: name each state `state "⏳ Waiting" as waitingJob`, same
  `classDef`, then `class waitingJob,runningJob step`.
- `sequenceDiagram`: `autonumber`, one `box rgba(…,0.12) 📱 Client` per side,
  the critical exchange in `rect rgba(…,0.18)`. Opaque fills hide the light
  message text of dark mode; the linter rejects any alpha above 0.25.

## Template

```text
flowchart LR
    accTitle: Short name
    accDescr: The takeaway in one sentence.
    startEvent(["👤 Who starts"]):::entry
    checkRule{"🚦 Question?"}:::gate
    doAction("⚙️ Action"):::step
    successEnd(["✅ Outcome"]):::done
    startEvent ==> checkRule
    checkRule == yes ==> doAction ==> successEnd
    checkRule -. no .-> startEvent
    classDef entry fill:#F3E8FF,stroke:#9333EA,stroke-width:2px,color:#3B0764
```
