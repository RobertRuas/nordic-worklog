---
kind: build_system
name: Vite-based SPA Build with Dockerized Dev Environment
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - vite.config.js
    - Dockerfile
    - docker-compose.yml
---

The project uses Vite as its build system for a React single-page application. The build pipeline is minimal and centered around npm scripts that wrap Vite commands.

**Build toolchain**
- Vite 8 with the `@vitejs/plugin-react` plugin handles compilation, HMR, and asset bundling.
- `vite.config.js` sets the dev server to port 3000 and binds to `host: true` so it is reachable from outside the container.
- Four npm scripts are defined in `package.json`: `dev` (Vite dev server), `build` (production bundle via `vite build`), `lint` (oxlint), and `preview` (`vite preview`).
- Linting is delegated to oxlint; there is no separate test runner configured.

**Containerization**
- A multi-stage approach is not used. The `Dockerfile` runs `node:20-alpine`, installs dependencies, copies source, exposes port 3000, and starts `npm run dev` — effectively serving the Vite development server inside the container.
- `docker-compose.yml` defines an `app` service based on `node:20-alpine`, mounts the host tree into `/app`, and runs `npm install && npm run dev` directly (no custom image). Host port 3002 maps to container port 3000.
- There is no production Docker image or Nginx/static-server stage; the same container serves both development and what would be production output.

**Artifacts and distribution**
- `vite build` produces static assets under the default `dist/` directory (not overridden in config).
- No CI/CD configuration files (GitHub Actions, GitLab CI, etc.) exist in the repository root.
- Versioning is tied to the package version field (`0.0.0`) and is not referenced by any build script.

**Conventions developers should follow**
- Use `npm run dev` / `npm run build` / `npm run lint` / `npm run preview` rather than invoking Vite directly.
- When adding environment-specific settings, extend `vite.config.js` (e.g., add `server.proxy` for API calls) instead of relying on `.env` files, since none are configured.
- For production deployment, replace the current dev-serving Dockerfile with a two-stage build that runs `npm run build` and serves the resulting `dist/` via a static HTTP server (e.g., nginx or Caddy); the existing Dockerfile does not produce a deployable artifact.