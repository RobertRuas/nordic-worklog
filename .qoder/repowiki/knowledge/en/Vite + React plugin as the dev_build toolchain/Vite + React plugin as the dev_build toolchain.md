---
kind: external_dependency
name: Vite + React plugin as the dev/build toolchain
slug: vite
category: external_dependency
category_hints:
    - framework_behavior
scope:
    - '**'
source_files:
    - package.json
    - vite.config.js
---

### Vite configuration shape
- Dev server runs on port 3000 with `host: true` (binds all interfaces, required for Docker port mapping).
- Uses `@vitejs/plugin-react` (Oxc-based) — no TypeScript compiler; linting is delegated to Oxlint via the `lint` script.
- Build pipeline: `vite build` produces static assets consumed by any HTTP server (the project itself does not ship a production server; the Dockerfile intentionally runs `npm run dev`).
- Scripts exposed: `dev`, `build`, `lint`, `preview`.