# PM Agent Pipeline

A 15-second looping motion graphic showing how a product manager can run product work through a chain of agents: which ones run in parallel, where people decide, and what each stage hands to the next.

Live version: https://claude.ai/artifact/XyrjZxPgego174XPnYJTrw

## The idea

Ten stages, three phases, fourteen agents and three human decisions.

| Phase | Stage | Who | What it does |
|---|---|---|---|
| Discovery | 1 Research | 3 agents in parallel | Customer signal, competitor research and market research start together. Internal tools and the web feed them. |
| Discovery | 2 Patterns | Pattern agent | Finds new usage patterns and product problems across the three streams and routes each one. |
| Discovery | 3 Follow-ups | 2 agents in parallel | Customer engagement lists who to speak to and drafts outreach. Product problems defines, ranks and adds to the backlog. |
| Discovery | 4 Prototypes | Prototype agent | Produces five prototypes for each top-priority problem. |
| Discovery | 5 Review | **Human** | The PM reviews and edits. The team makes the product-sense and technology calls, including evals, and settles on one prototype. |
| Execution | 6 Build | 4 agents, 1 **human** sign-off | PRD / ticket, GTM plan (for human sign-off), roadmap update after sign-off, and the Builder agent. |
| Execution | 7 Testing | Testing agent | Checks the build against code and design criteria, and against the problem as defined. |
| Launch | 8 Decision | **Human** | Go or no-go. |
| Launch | 9 EVAL | EVAL agent | Checks the live feature against the eval criteria. |
| Launch | 10 Usage | Usage analysis agent | Tracks volume, time and the way the feature is used, and reports it with insights. |

Two loops close the cycle. Usage analysis feeds the Customer signal agent. The customer conversations the PM has in stage 3 also feed the Customer signal agent.

## View it

Open `pm-agent-pipeline.html` in a browser. It is one file with inline SVG and no libraries. DM Sans loads from Google Fonts and falls back to the system sans-serif if it cannot.

Controls: play and pause, a scrubber, a clickable stage rail, and the left and right arrow keys to step between stages. Dragging the scrubber or choosing a stage pauses the loop.

## How it is built

- `render(t)` is the only function that draws. It sets every attribute of every element from `t` alone and keeps no state between calls, so any frame can be drawn on demand with `window.renderAt(t)`.
- There are no timers and no CSS animations. A single `requestAnimationFrame` loop supplies `t` and does nothing else.
- The loop closes by construction. Every effect is zero at the start and end of the loop, and periodic motion uses whole numbers of cycles, so frame 0 and frame 15 are identical.
- The story is written on a 10-unit clock and played over 15 seconds (`STORY` and `LOOP` near the top of the script). To change the pace, change `LOOP`.

To edit the content, look at the data tables at the top of the script: `STAGES` (card text), `NODES` (boxes and their timing), `EDGES` (connectors and when information flows along them) and `FRAMES` (the phase containers).

## Checking it

`verify/render-contact-sheet.js` renders one frame per second across the loop with Playwright and Chromium, builds side-by-side contact sheets, and checks that frame 0 equals the end-of-loop frame (DOM and screenshot bytes) and that frames render the same in any order.

```
cd verify
node render-contact-sheet.js 1240 light desktop
node render-contact-sheet.js 1240 dark desktop
node render-contact-sheet.js 400 light phone
```

Output goes to `verify/out/`, which is git-ignored.

## Known limits

- On a phone the whole diagram scales to fit the width, so text inside the boxes is small. The card under the diagram carries the readable detail.
- The checks above ran in a sandbox where Google Fonts was blocked, so they used a wider fallback font. Labels have slack for that, but the live font has not been compared frame by frame.
- Dark theme was checked at desktop width only. Phone was checked in the light theme only.

See [SESSION_LOG.md](SESSION_LOG.md) for how it was made.
