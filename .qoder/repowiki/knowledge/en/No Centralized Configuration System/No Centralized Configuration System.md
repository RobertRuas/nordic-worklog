---
kind: configuration_system
name: No Centralized Configuration System
category: configuration_system
scope:
    - '**'
source_files:
    - vite.config.js
    - src/context/ThemeContext.jsx
    - src/pages/Configuracoes/components/ParametrosBox.jsx
---

This repository does not implement a centralized configuration system. The application is a minimal React SPA with no runtime configuration loading, environment variable handling, feature flags, or secrets management.

What exists instead:
- **Build-time config**: `vite.config.js` hardcodes the dev server port (3000) and host (`true`). There are no `.env` files, no Vite `import.meta.env.*` usage, and no build profiles.
- **User preferences only**: The only user-configurable setting is theme (light/dark), persisted via `localStorage` under the key `theme` in `src/context/ThemeContext.jsx`. This is client-side state, not application configuration.
- **Hardcoded defaults**: Work parameters like hourly rate, currency, and daily hours live as local component state in `src/pages/Configuracoes/components/ParametrosBox.jsx` — they are not loaded from any file, env var, or API, nor are they persisted anywhere.
- **No config files**: There are no `.env`, `.yaml`, `.toml`, `.properties`, JSON config files, or dedicated `config/` directory anywhere in the repo.

In short: this project has zero runtime configuration infrastructure. Any future need for environment-specific settings, feature toggles, or persistent user parameters would require introducing a configuration layer from scratch.