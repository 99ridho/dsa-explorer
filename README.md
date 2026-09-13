# DSA Interactive Explorer

Step-by-step visualizer for the data structures and algorithms in Weeks 1–15 of *Algoritma dan Struktur Data* (Universitas Negeri Jakarta): analysis of algorithms, arrays, queue, stack, sorting, linked list, searching, binary search tree, B-tree, binary heap, hash table, graph. Every operation animates against its pseudocode with play/pause/step/scrub controls, alongside the course's real-world usage and core material for that topic.

See `SPEC.md` for the full specification and `CLAUDE.md` for the codebase guide.

## Develop

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # vitest
npm run test:e2e   # playwright layout checks (once: npx playwright install chromium)
npm run build      # tsc -b && vite build, outputs dist/
```

## Deploy

```sh
docker build -t dsa-explorer .
docker run -p 8080:80 dsa-explorer
```

Pushes to `main` build and publish `ghcr.io/<owner>/dsa-explorer` via GitHub Actions.

Reference: Sedgewick, R. & Wayne, K., *Algorithms, 4th Edition*.
