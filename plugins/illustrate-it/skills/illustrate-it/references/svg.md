# Hand-Authored SVG

Mermaid stays the default: diffable, linted, themed by GitHub. Draw SVG only for
what Mermaid cannot lay out (a layered stack, an exploded anatomy, a screen
split into zones, a timeline to scale) or on an HTML page that renders it
inline. Worked example: [job-queue-anatomy.svg](job-queue-anatomy.svg).

## Where it renders

| Target              | Rendered as  | Colors                       |
| ------------------- | ------------ | ---------------------------- |
| Markdown `![alt]()` | isolated img | fixed palette chips          |
| HTML, inline `svg`  | page DOM     | `currentColor` follows theme |

An image in Markdown never sees the page theme: one file must read on white and
on every dark page. It does when **all text sits on a filled palette chip** and
only `#64748B` lines and chip strokes touch the page.

## Composition

- One claim per figure; the eye enters at the `entry` or top layer and leaves
  at the outcome, left to right or top to bottom.
- 8px grid: shared baselines, even gaps (24px between layers, 32px between
  chips), same chip size per role (160 × 48), corner radius 8.
- Hierarchy by stroke and weight, not size: the one `focus` chip gets a 4px
  stroke and 600 weight; layer names 600 weight; parts regular.
- Every relationship is an arrow; position alone implies nothing. Main path
  solid, fallback dashed (`stroke-dasharray="4 4"`), orthogonal routes through
  the gaps, never behind a chip.
- Callouts: 12px radius amber circles beside their arrow, numbered in reading
  order, explained in the caption list.
- Balance: no empty half-band; fill it with a part that carries meaning, or
  narrow the canvas.

## Mechanics

- `viewBox="0 0 W H"` sized to the content, no `width`/`height`; CSS
  `max-width: 100%; height: auto`.
- `role="img"`, `<title id>` and `<desc id>` first, both named by
  `aria-labelledby`; `desc` is the takeaway sentence.
- Text 12–14px, system font stack, `text-anchor` alignment, one to three
  words; sentences go in the caption.
- Arrowheads: one `<defs><marker>` with `orient="auto-start-reverse"`, used by
  `marker-end="url(#arrowHead)"`.
- Colors only from [palette.md](palette.md): Tailwind 100 fill, 600 stroke, 900
  text of one role; lines `#64748B`, 2px.
- Transparent background. No `<script>`, `<foreignObject>`, `<image>`, external
  `href`, web fonts or images of text.

## Verify

1. `node <this skill's folder>/scripts/lint-svg.mjs <file.svg>` until
   `SVG VALID`.
2. When a browser or a headless screenshot tool is already available, look
   at it on `#FFFFFF`, `#0D1117` and `#212830` side by side; otherwise say it
   was not rendered.
3. In the Markdown embedding it, the alt text states the takeaway and the
   caption lists the callouts.
