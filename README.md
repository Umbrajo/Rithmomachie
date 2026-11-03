# Rithmomachia · The battle of numbers

Buildless browser app: `dist/index.html`, `engine.js`, `app.js`, `i18n.js`, `worker.js`, `style.css`. Publish `dist/`. No dependencies, remote AI service, analytics or account beyond Sites hosting. Local storage retains game and custom position.

The Rules dialog documents the educational variant, inspired by Peter Mebben: orthogonal circles, diagonal triangles, orthogonal/diagonal squares; equality, sum/difference ambush, endpoint-inclusive assault, orthogonal siege; layered pyramids. Automatic newly created captures and explicit stationary captures. No reentry, flying moves or greater triumphs. Classical setup reproduces the supplied reference image on a 16-column × 8-row horizontal board (a 90° rotation of the supplied image). Compact three-rank and open horizontal alternatives are retained. Enemy camps and advancement use the long board axis. All seven locales include rules, lessons, validation and assistant text; English is the default, Arabic uses RTL controls with a left-to-right board.

Win modes: enemy pyramid plus a three-piece nonconstant progression in its last four files; enemy pyramid alone; five whole captures. No legal action loses. AI runs in a Worker: random, bounded greedy, and bounded beam minimax depths 2/3/4. Root ties and near-equal moves are randomized with a progressively narrower tolerance; immediate winning moves remain mandatory. A modal setup gate blocks the board until explicit Start game, including on load, reset, mode/settings changes and imported positions. Hardness is relative, not a perfect-play guarantee. Threat highlighting examines an immediate capture and legal next-turn moves capable of capturing the selected piece; no long-term guarantee. The assistant is a local position-aware strategic coach with topic matching, not a remote conversational LLM.

Positions use standard JSON with an explicit versioned application schema (not a universal Rithmomachia interchange standard):

```json
{"format":"rithmomachia-position","version":1,"ruleset":"mebben-educational-v1","board":{"width":16,"height":8},"firstPlayer":1,"pieces":[{"side":0,"type":"P","value":91,"x":1,"y":2,"layers":[1,4,9,16,25,36]},{"side":1,"type":"P","value":190,"x":14,"y":3,"layers":[16,25,36,49,64]}]}
```

Coordinates are zero-based JSON x/y, a1 in the UI. Side 0 white, 1 black. C circle, T triangle, S square, P pyramid. Bounds 6–20 columns and 6–16 rows. Exactly one pyramid per side required to play an edited position. A pyramid's `value` must equal the sum of its unique positive integer layers. Normal layer shapes: white C1/4,T9/16,S25/36; black C16,T25/36,S49/64. Import validates dimensions, types, numbers and unique squares before applying. Files over 1MB are rejected.

Validation: `node test-engine.cjs`. Browser QA covers tutorial capture, undo, solo start/reset waiting, AI turn, editor placement/resize and locale switching.
