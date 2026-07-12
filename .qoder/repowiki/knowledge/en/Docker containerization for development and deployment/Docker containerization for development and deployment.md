---
kind: external_dependency
name: Docker containerization for development and deployment
slug: docker
category: external_dependency
category_hints:
    - vendor_identity
scope:
    - '**'
source_files:
    - Dockerfile
    - docker-compose.yml
---

### Nordic Worklog Docker setup
- Base image: `node:20-alpine` (Node.js 20 runtime in Alpine Linux).
- Development compose service `app` maps host port 3002 to container port 3000, mounts the source tree as a volume (`.` → `/app`) so changes are reflected without rebuilds, and runs `npm install && npm run dev`.
- The standalone `Dockerfile` is a didactic build that installs deps, copies sources, exposes 3000, and runs Vite's dev server — intended for production builds or manual `docker build/run` usage.
- Container name convention: `nordic_worklog_container` (from compose).