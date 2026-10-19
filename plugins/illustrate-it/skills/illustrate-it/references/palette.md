# Palette and Accessibility

GitHub draws Mermaid on white (`#FFFFFF`) or on dark (`#0D1117`), and its dark
theme turns edges, edge labels and group titles light. No text grey reaches
4.5:1 on both pages, so **text always sits on its own filled shape**; only
strokes touch the page.

## Rules (WCAG)

| WCAG              | Rule                                      | Checked by |
| ----------------- | ----------------------------------------- | ---------- |
| 1.1.1 alternative | `accTitle` names, `accDescr` the takeaway | lint       |
| 1.4.1 not color   | shape, icon and words on every mark       | squint     |
| 1.4.3 text 4.5:1  | `color` on `fill`                         | lint       |
| 1.4.11 marks 3:1  | `stroke` on white and on dark             | lint       |
| 1.4.11 marks 3:1  | chart series on white, panel and dark     | lint       |
| 1.4.3 text 4.5:1  | sequence fills translucent (alpha ≤ 0.25) | lint       |

The prose sentence before the fence states the same takeaway.

One emoji per node at most, first: screen readers read its name aloud.

## Measured classes

| Class   | Meaning    | Shape     | Icons    | Text | White | Dark |
| ------- | ---------- | --------- | -------- | ---- | ----- | ---- |
| `entry` | who starts | `(["…"])` | 👤 🪝 📝 | 12.7 | 5.4   | 3.5  |
| `step`  | an action  | `("…")`   | ⚙️ 🧪 📦 | 8.2  | 4.1   | 4.6  |
| `gate`  | a decision | `{"…"}`   | 🚦 🔍    | 8.2  | 3.2   | 5.9  |
| `done`  | success    | `(["…"])` | ✅       | 8.3  | 3.3   | 5.7  |
| `stop`  | a failure  | `("…")`   | ⛔ 🔧    | 8.2  | 4.8   | 3.9  |
| `muted` | a fallback | `("…")`   | 🔀 💤 🔔 | 9.5  | 4.8   | 4.0  |

Text = `color` on `fill`; White and Dark = `stroke` on each page.

```text
classDef entry fill:#F3E8FF,stroke:#9333EA,stroke-width:2px,color:#3B0764
classDef step fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0C4A6E
classDef gate fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#78350F
classDef done fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#14532D
classDef stop fill:#FEE2E2,stroke:#DC2626,stroke-width:2px,color:#7F1D1D
classDef muted fill:#F1F5F9,stroke:#64748B,stroke-width:1px,color:#334155
```

Paste only the classes used. Frames never get a fill (titles would vanish in
dark mode): `style phaseName fill:none,stroke:#64748B,stroke-dasharray:4 4`.

## Beyond flowcharts

Measured with `@mermaid-js/mermaid-cli` 12.0.0 (October 2026) on both themes;
re-measure after a Mermaid major release:

| Element         | Use                           | Measured     |
| --------------- | ----------------------------- | ------------ |
| Node text       | palette `color` (!important)  | ≥ 8.2:1 both |
| Sequence `box`  | `rgba(<600 stroke>,0.12)`     | ≥ 9.6:1 both |
| Sequence `rect` | `rgba(<600 stroke>,0.18)`     | ≥ 9.6:1 both |
| Chart series    | `plotColorPalette` `#0284C7`  | 4.1/3.1/4.6  |
| Dark edge label | Mermaid's `#ccc` on `#585858` | 4.43:1       |

Chart series ratios: on white, on the dark chart panel (`#333333`), on dark.

Every type above renders `accTitle` and `accDescr` as SVG `<title>` and
`<desc>` with a `graphics-document` role.

## Backgrounds

| Page                        | Background | What tells a node apart     |
| --------------------------- | ---------- | --------------------------- |
| GitHub light, VS Code light | `#FFFFFF`  | `stroke` ≥ 3.2:1            |
| GitHub dark                 | `#0D1117`  | `fill` ≥ 15:1, stroke ≥ 3.5 |
| GitHub dark dimmed          | `#212830`  | `fill` ≥ 12:1               |
| GitHub high contrast        | `#010409`  | `fill` ≥ 16:1               |
| VS Code dark                | `#1E1E1E`  | `fill` ≥ 13:1               |

On white the pale fill vanishes (1.1:1) and the stroke draws the shape; on
every dark page the fill does. The linter checks strokes on white and
`#0D1117` only; on dimmed, `entry` (2.8:1) and `stop` (3.1:1) strokes rely on
their fill.
Mermaid's default series color is `#ECECFF`, invisible on white: every
`xychart-beta` starts with

```text
%%{init: {"themeVariables": {"xyChart": {"plotColorPalette": "#0284C7"}}}}%%
```

Dark-mode edge labels sit just under 4.5:1 and no color fixes both themes:
keep edge labels to two or three words and put what the reader must not miss
in a node.

## A new color

Use a Tailwind 100 fill, 600 stroke and 900 text of one hue, then lint: it
prints the measured ratio of any pair below its minimum. Red and green are never
the only difference: `done` and `stop` also differ by shape and icon.
