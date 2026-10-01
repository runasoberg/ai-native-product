# Session log: PM Agent Pipeline

Date: 2026-10-01
Session: https://claude.ai/code/session_01VR6QghEWgrJ1WbZ7JqapK4
Outcome: a published artefact, version 3, at https://claude.ai/artifact/XyrjZxPgego174XPnYJTrw

## The brief

Build an artefact that shows how product managers should now use AI to develop products. High level, showing the agents to create and how to orchestrate them so they take information from each other. A live diagram using motion graphics that moves the viewer through the stages and shows how information flows between them. The visual style came from an attached reference graphic: cream tiles, a terracotta accent, navy inset panels, mono captions and soft rounded cards, with motion such as particle flow and morphing shapes. The reference image is not stored in this repo.

The stage sequence was written out by the author in ten steps: parallel research agents, a pattern agent, follow-up agents, a prototype agent, a human review, an execution stage with four agents, a testing agent, a human launch decision, an EVAL agent and usage analysis.

## Constraints added after the first plan

The first plan was rejected and replaced with these requirements:

- One HTML file, inline SVG, no libraries.
- Claude orange `#D97757`, navy `#0F1B2E`, DM Sans.
- The motion starts with the three research agents being activated, then follows the sequence.
- Every element is a pure function of `t`. No timers, no CSS keyframes. The first and last frame of the loop are identical, and any frame can be drawn on demand.
- Before finishing, render one moment per second across the loop, side by side, and fix what is wrong.

## What was built

A diagram on a navy panel with a cream page around it. Agents are navy boxes that turn orange while running and take an orange outline when done. Human decisions are cream pills with a person icon, a ring that sweeps round while they decide, and a tick when done. Dots travel along connectors to show information moving. Output chips pop in at the points where an agent hands something over. A card under the diagram lists what the active stage reads, produces and hands on.

## Revisions

| Version | Change | Why |
|---|---|---|
| 1 | First publish: 10-second loop, one dashed frame around Execution, and a feedback arrow from usage analysis to the Customer signal agent | The brief |
| 2 | Three phase containers: Discovery (stages 1 to 5), Execution (6 and 7, so Testing moves in), Launch (8 to 10). The step 3 chip became "customer conversations" with a feedback arrow into the Customer signal agent | Author's review |
| 3 | Loop lengthened from 10 to 15 seconds | Author asked for slower motion |

## Decisions and assumptions

- **Stage grouping.** The author asked for stages 1 to 6 as Discovery while keeping stage 6 as Execution. This was read as 1 to 5, and the author confirmed.
- **Usage feedback loop.** The arrow from usage analysis back to the Customer signal agent was added to make the loop meaningful. It was not in the original sequence.
- **Stage timings.** The split of time between stages was chosen during the build. Execution has the longest slot.
- **Pace.** The story is written on a 10-unit clock and played over 15 seconds, so slowing it down meant changing one constant, not retiming every stage.
- **Cream page ground and mono captions.** Taken from the reference graphic. The two hex values and DM Sans were specified by the author.

## Checks

Run with Playwright and Chromium, one frame per second across the loop (15 frames for the final version) plus checks:

- Frame 0 equals the end-of-loop frame in the DOM and in the screenshot bytes. Also equal to a frame two loops later.
- A frame rendered after other frames matches the same frame rendered first.
- No horizontal overflow at 400 px and 1240 px.
- Play, pause and the scrubber behave as expected, and the clock holds still while paused.

Problems found in the per-second sweeps and fixed:

- Text became unreadable part-way through the orange-to-done colour change (Builder at 7 s and EVAL at 9 s in the first loop).
- Several labels were tight against or clipped by their boxes, including "Roadmap update" and "GTM sign-off".
- An arrow pointed at an empty slot while its output chip was hidden. The chips now show faintly at rest.
- The detail card faded too far at stage boundaries.
- On a phone, an 860 px minimum width hid most of the diagram off-screen. The diagram now scales to fit.
- The play and pause icons both showed, because SVG elements ignore the `hidden` property.
- The rail labels broke mid-word on a phone.

## Not checked, or limited

- Google Fonts was blocked in the sandbox, so the sweeps used a fallback font. The live font was not compared frame by frame.
- Dark theme was swept at desktop width only. Phone was swept in the light theme only. For the 15-second version, only the light desktop sweep was re-run.
- On a phone, text inside the boxes is small.
- The session was not subscribed to watch the published artefact for comments or republishing.
