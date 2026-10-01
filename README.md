# AI-native product

A space for artefacts that show how product management, product development and product building should evolve with AI.

Each artefact is a small, self-contained piece of work: a diagram, a prototype, a model, a working tool. Every one lives in its own folder with the code, a short README, and a log of the session that produced it, so the thinking behind it is as easy to read as the result.

## Artefacts

| Artefact | What it shows | Date |
|---|---|---|
| [PM Agent Pipeline](PM%20Agent%20Pipeline/) | A 15-second looping motion graphic of the agents a product manager sets up and how they pass information to each other, from parallel research to usage analysis, with the three human decisions marked. | 2026-10-01 |

## How an artefact folder is organised

```
<Artefact name>/
  README.md        what it is, how to view it, how it is built
  SESSION_LOG.md   how it was made: brief, decisions, revisions, checks
  <the artefact>   the code or file itself
  verify/          anything used to check it (optional)
```

## Adding the next one

1. Make a folder named after the artefact.
2. Put the code or file in it, with a README that says what it shows in the first two lines.
3. Log the session in `SESSION_LOG.md`. Record what was asked for, what was decided, what was changed after review, and what was checked. Note any assumption that was made on your behalf.
4. Add a row to the table above.
