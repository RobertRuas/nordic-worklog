---
kind: error_handling
name: Minimal React Error Handling — Context Guard Only
category: error_handling
scope:
    - '**'
source_files:
    - src/context/ThemeContext.jsx
---

This repository is a small React SPA with no dedicated error-handling system. The only explicit error logic is a single guard in the theme context hook.

**What is used**
- Plain `throw new Error(...)` inside the custom `useTheme` hook to enforce that it is called within a `ThemeProvider`. This is a development-time contract check, not runtime error recovery.
- No `try/catch` blocks, no Promise `.catch()` handlers, no global error boundary (`React.ErrorBoundary`), no middleware, no sentinel errors, and no structured error types anywhere in the codebase.

**Key files**
- `src/context/ThemeContext.jsx` — the sole place where an error is thrown (line 45).
- `src/main.jsx`, `src/App.jsx` — application bootstrap; neither wraps rendering in error boundaries nor installs global unhandled-rejection/uncaught-error listeners.

**Architecture and conventions**
- There is no centralized error module, no error-code enumeration, and no convention for propagating or presenting user-facing messages.
- All pages and components are synchronous renderers driven by local state; there are no async data-fetching paths shown, so there is no opportunity for network error handling to be visible here.

**Rules developers should follow**
- Currently none are codified. As a practical baseline: wrap async operations in `try/catch` (or Promise `.catch`) and surface failures via UI state rather than letting them bubble as unhandled exceptions. Consider adding a top-level `ErrorBoundary` component if you want to avoid full-page crashes.