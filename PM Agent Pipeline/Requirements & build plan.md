# Requirements & build plan: PM Agent Pipeline

Date: 2026-10-01

This is the plan as approved before the build started, kept unchanged below the divider. An earlier version, which proposed a click-through stage rail with a free-running animation, was rejected. The author replaced it with the constraints that this version reflects: one file, inline SVG, a pure function of `t`, no timers or CSS keyframes, a looping timeline that starts with the research agents waking, and a per-second render check before finishing.

## Where the build departed from this plan

| Plan | What was built | Why |
|---|---|---|
| 10-second loop | 15-second loop | Author asked for slower motion. The story is still written on a 10-unit clock and played over 15 seconds. |
| One dashed frame around the parallel research group, one around Execution | Three phase containers (Discovery, Execution, Launch) with the parallel group as a dotted box inside Discovery. Testing moved into Execution | Author's review |
| No customer-conversations loop | A "customer conversations" chip in stage 3 with an arrow back into the Customer signal agent | Author's review |
| Stage rail shows "Execution" for stage 6 | Rail shows "Build" for stage 6, so it does not clash with the Execution container | Naming |
| Contact sheets at desktop width, then phone and dark theme | Done, but after the 15-second change only the light desktop sheet was re-run | Time |

See [SESSION_LOG.md](SESSION_LOG.md) for the full account.

---

# Plan: PM Agent Pipeline, a 10-second looping motion graphic

## Context
The user wants a live motion graphic showing how product managers should now build products with AI: a chain of specialised agents, which run in parallel, where humans gate the work, and what each stage hands to the next. They supplied a 10-stage sequence and a reference graphic (cream tiles, terracotta accent, navy inset panels, mono captions, particle flow and morphing motion).

Hard constraints from the user:
- One HTML file, inline SVG, no libraries, a 10-second loop.
- Colours: Claude orange `#D97757`, navy `#0F1B2E`. Font: DM Sans.
- The motion starts with Col A (Customer signal, Competitor research, Market research) being activated (blink / colour change), then follows the sequence.
- Every element is a pure function of `t` in [0, 10]. No timers, no CSS keyframes. Frame 0 equals frame 10. Any frame can be drawn on demand.
- Before finishing: render one moment per second across the loop, side by side, and fix what is wrong.

## Architecture: `render(t)` is the only thing that draws
- A single function `render(t)` takes t in seconds, sets every attribute of every element (opacity, fill, stroke, transform, dash offset, text) from t alone, and keeps no state between calls. It is exposed as `window.renderAt(t)` so any frame can be drawn on demand (and so the verification step can call it).
- The only clock is one `requestAnimationFrame` loop that computes `t = ((now - t0) / 1000) % 10` and calls `render(t)`. It carries no animation logic and no setTimeout or setInterval. No CSS `animation` or `transition` anywhere.
- Loop closure by construction:
  - Every activity envelope is a smoothstep window that is exactly 0 at t = 0 and t = 10.
  - Periodic motion (blink, particle travel, glow pulse) uses integer cycles per 10 s: `sin(2π·n·t/10)` and `fract(n·t/10 + phase)`.
  - The feedback arrow (usage analysis back to Col A) arrives at the end of the loop and fades out as Col A's activation fades in from a clean rest state at t = 0. So `render(0)` and `render(10)` are identical.
- Controls are also pure: a scrubber sets t and a play/pause toggles the rAF clock. Stage-rail clicks seek to that stage's start time. The detail panel text, rail highlight and counter are derived from t as well (crossfade weights computed from t, not CSS transitions).
- Respect `prefers-reduced-motion`: start paused at a representative frame (about t = 1) and let the scrubber drive it.

## Timeline (seconds), sequential after the initial parallel burst
| t | Stage | What moves |
|---|---|---|
| 0.15-1.2 | 1 Research | Col A's three agents wake at once: ring blink plus fill sweeps from navy to orange, status chip flips idle → running. Dots stream out of each along its own colour-weighted path. |
| 1.2-2.0 | 2 Pattern agent | Three streams converge on the hub, hub fills and pulses, pattern chips ("new usage pattern", "new product problem") appear. |
| 2.0-3.0 | 3 Fan-out | Hub splits into two paths: Customer engagement (user list + draft outreach chip) and Product problems (ranked backlog chip, top item continues to prototype). |
| 3.0-3.8 | 4 Prototype agent | One card morphs into five prototype cards. |
| 3.8-4.8 | 5 Human review | Dots queue at the gate, a tick lands, one card is selected and becomes the final prototype. Gate drawn distinctly (cream pill, person glyph). |
| 4.8-6.6 | 6 Execution | PRD/Ticket, GTM plan (to human sign-off), roadmap update after sign-off, Builder; sub-steps in that order. |
| 6.6-7.4 | 7 Testing agent | Checklist ticks (code, design, solves the problem). |
| 7.4-8.0 | 8 Human launch decision | Gate holds, then releases; "live" chip. |
| 8.0-8.7 | 9 EVAL agent | Live functionality checked against eval criteria. |
| 8.7-9.5 | 10 Usage analysis | Small usage chart draws itself, report chip appears. |
| 9.5-10 | Loop back | Feedback arrow carries "usage insights" back to Col A, everything eases to rest so t = 10 matches t = 0. |

Exact windows are tuneable constants in one `STAGES` table that also holds each stage's name, kind (agent / human / parallel), reads, produces and hands-to text taken from the user's brief.

## Layout and visual system
- Tokens on `:root`: orange `#D97757`, navy `#0F1B2E`, plus derived navy tints for lines and cards, cream ground `#F3EEE6` and card `#FBF8F3` from the reference, ink and muted text. DM Sans (Google Fonts, with a system fallback stack) for everything; the mono captions the reference uses are a system monospace stack (no second webfont).
- Light page: cream with the diagram in a rounded navy inset panel, as in the reference. Dark page theme: deeper navy ground, same panel, via the standard `prefers-color-scheme` plus `[data-theme]` token pattern.
- Page order: title and one-line thesis, play/pause plus scrubber plus 1-10 stage rail, the navy SVG stage, a cream detail card for the active stage (Reads / Produces / Hands to), and a small legend (agent, human gate, parallel group, feedback loop).
- Diagram: inline SVG, `viewBox` about 1200x600, two rows (research to review on row 1, execution to measurement on row 2) joined by a curved connector, with the feedback arrow from Usage analysis to Col A. Parallel group framed with a dashed outline. Human gates drawn as cream pills with a person glyph; agents as navy nodes that turn orange when active.
- Phone: SVG sits in its own `overflow-x: auto` container with a minimum width; the detail card stacks below; 16px side gutters.
- Complete at rest: the first frame shown is a real mid-loop frame (about t = 1.1), so thumbnails and shared links show a populated diagram. The page is never blank before the first rAF.

## Implementation steps
1. Write the file to the scratchpad dir (`pm-agent-pipeline.html`): tokens and layout CSS, SVG skeleton built from a data model (nodes, edges, positions), the `STAGES` table, easing helpers (`smoothstep`, `fract`, `lerp`), then `render(t)` split into small pure helpers per element group.
2. Wire the rAF clock, scrubber, play/pause, rail, keyboard (space, arrows).
3. Verification (below), fix, repeat until clean.
4. Publish with the Artifact tool (`icon: "flow"`, one-sentence description) and give the user the link.

## Verification (before publishing)
1. Launch the pre-installed Chromium through Playwright (`executablePath: '/opt/pw-browsers/chromium'`, no browser download) against the local file, with the rAF clock stopped.
2. For t = 0, 1, 2, ... 9 call `window.renderAt(t)` and screenshot the diagram plus detail card at desktop width. Stitch the ten frames side by side into one contact sheet (Python PIL, or a throwaway local HTML grid) in the scratchpad dir, and view it with the Read tool.
3. Inspect each frame for: overlapping or clipped text, nodes that do not light at the right moment, particles off their paths, stage text not matching the highlighted node, low contrast, anything illegible at thumbnail size. Fix and re-render the sheet.
4. Prove the loop: `renderAt(0)` and `renderAt(10)` must produce identical SVG serialisation and identical screenshot bytes. Also check `renderAt(9.99)` against `renderAt(0)` for visible continuity, and that calling frames out of order gives the same output as in order (purity).
5. Repeat the contact sheet once at phone width (about 400px) and once with the dark page theme.
6. Note: DM Sans comes from Google Fonts, which the sandbox proxy may not reach. If so, the render check uses the fallback face, so text widths could differ slightly on the live page. Give label boxes some slack and say so in the final message.

## Assumptions to flag to the user afterwards
- Stage time budgets are mine (execution gets the longest slot, 1.8 s); easy to rebalance in the `STAGES` table.
- The feedback arrow from Usage analysis to Customer signal agent is my addition, to make the loop meaningful.
- Cream ground and mono caption style come from the reference graphic; the two hexes and DM Sans are as specified.
