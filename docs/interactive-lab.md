# Interactive Lab / 互动实验室

Routes: `/lab`, `/en/lab`. Entry points are in the main navigation, home page, and footer.

## What is implemented

- Connect Four: immutable board engine; deterministic, bounded minimax with alpha–beta pruning; 2/4/5-ply difficulty; Web Worker for AI computation; lightweight 2-ply fallback; undo/reset; same-device two-player mode.
- Neural Canvas: a genuine 2 → 8 → 1 network, tanh hidden layer, sigmoid output, binary cross entropy, batch gradient descent/backpropagation. Editable 2D samples, XOR/ring presets, loss curve, pause/reset. Runs in bounded batches on the main thread. The displayed fit is measured on training data, not held-out accuracy.
- Daily Maze: UTC date seed, deterministic DFS-generated 17 × 13 maze, keyboard/touch controls, move counting, actual A* exploration order and shortest path. Viewing the solution marks the attempt as assisted.

## Sharing and privacy

`/lab?board=4433#connect-four` carries a Connect Four move sequence (columns 1–7). Import replays and validates every move and switches to two-player mode. Position codes use `C4:4433`. Moves after a win, full-column moves, invalid characters and overlong inputs are rejected without changing the current board.

`/lab?maze=friend-02#pathfinder` carries a maze seed (1–32 ASCII letters, digits, hyphens). A link shares a snapshot or puzzle; there are no WebSockets, live rooms, accounts, leaderboard writes, visitor uploads, analytics, external AI calls, or API keys. Progress is ephemeral. The clipboard is only used after the visitor clicks the share button, with a visible manual-copy fallback.

Localhost links cannot be used by friends on other computers. Public sharing requires deploying the existing static build to a reachable domain; this feature does not itself deploy the website. Real-time multiplayer and an LLM assistant would need a separately approved backend/provider, security/rate limits, privacy policy and operating budget. Never put provider secrets in client-side code.

## Maintenance and verification

Pure engines are in `lib/lab/`, views in `components/lab/`, and the worker in `workers/connect-four.ts`. Lab CSS is imported only by the lab route. Home page entry points do not import the game engines. All timers and workers are cleaned up on unmount. SVG diagrams and icon additions extend the local code-native visual system; no remote assets are needed.

Run `npm run test:lab`, `npm run typecheck`, `npm run generate`, and `npm run check:static`. Engine tests include tactical moves, replay rejection, training-loss convergence, and A* shortest-path comparison against BFS on 40 seeds. Browser smoke tests should cover worker replies, undo during calculation, invalid shared inputs, keyboard movement, clipboard fallback, theme/language changes and small screens. Node >= 22.13 is required; tests explicitly enable native TypeScript stripping.
