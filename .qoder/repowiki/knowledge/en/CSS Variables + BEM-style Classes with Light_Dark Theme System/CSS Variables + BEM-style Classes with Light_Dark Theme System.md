---
kind: frontend_style
name: CSS Variables + BEM-style Classes with Light/Dark Theme System
category: frontend_style
scope:
    - '**'
source_files:
    - src/index.css
    - src/context/ThemeContext.jsx
    - src/components/Layout/Layout.css
    - src/components/BottomNav/BottomNav.css
    - src/pages/Configuracoes/components/ThemeToggle.jsx
---

The frontend styling of Nordic Worklog follows a minimal, CSS-variable-driven approach built around a light/dark theme system. There is no CSS-in-JS library, Tailwind, or component UI kit — instead the app relies on vanilla CSS files colocated next to their components and a global stylesheet that defines design tokens.

### What system/approach is used
- **CSS custom properties (variables)** for all colors, typography, spacing, and transitions, defined in `src/index.css` under `:root` and `:root.dark`.
- **BEM-like class naming** (`app-layout`, `app-header`, `header-container`, `card`, `bottom-nav`, `bottom-nav-item`, etc.) scoped per component file.
- **React Context** (`ThemeContext`) toggles a `dark` class on `<html>` to switch themes; components consume it via a `useTheme()` hook.
- **Inline styles** are used sparingly inside small interactive pieces (e.g., `ThemeToggle.jsx` toggle knob) rather than as a primary strategy.
- **Google Fonts**: Outfit is imported globally and set as the default font family via CSS variables.
- **Mobile-first safe-area support** using `env(safe-area-inset-bottom)` for iPhone notch/home-bar compatibility.

### Key files and packages
- `src/index.css` — global reset, CSS variable tokens, base body/root rules, shared `.fade-in` animation.
- `src/context/ThemeContext.jsx` — theme state, persistence to `localStorage`, system preference detection, `ThemeProvider` / `useTheme` hook.
- `src/components/Layout/Layout.css` — fixed header, scrollable content area, reusable `.card` utility.
- `src/components/BottomNav/BottomNav.css` — fixed bottom tab bar, active-state accent color, micro-interaction transforms.
- `src/pages/Configuracoes/components/ThemeToggle.jsx` — example of inline-styled toggle consuming `useTheme()`.

### Architecture and conventions
- **Design tokens live in one place**: every color, font, transition duration, and safe-area inset is declared as a CSS variable so both themes share identical layout logic.
- **Theme switching is DOM-class based**, not prop-based: adding/removing `dark` on `document.documentElement` lets pure CSS selectors (`:root.dark`) handle all visual changes without JS re-renders.
- **Component-scoped CSS files** keep styles co-located with JSX; there is no shared CSS module or utility framework.
- **Global utilities** like `.card`, `.card-title`, and `.fade-in` are intended to be reused across pages for consistent card and animation patterns.
- **Typography scale** is intentionally small and muted (0.7–0.95 rem range, secondary text at ~71% opacity) to match the minimalist Nordic aesthetic.

### Rules developers should follow
- Always use the provided CSS variables (`--bg-primary`, `--text-secondary`, `--accent-color`, `--border-color`, `--transition-speed`, `--safe-area-bottom`) instead of hard-coded hex values.
- Keep new component styles in a sibling `.css` file and follow the existing BEM-like naming convention (`component-name`, `component-element`, `component-element--modifier`).
- Do not create additional theme classes; toggle between `light` and `dark` only through the `useTheme()` hook and let the `dark` class on `<html>` drive visuals.
- Reuse `.card` and `.card-title` for consistent card surfaces rather than inventing new container styles.
- Respect the max-width `600px` centering pattern used by header/content/bottom-nav containers to maintain the mobile-first narrow-column look on larger screens.
- Use `var(--transition-speed)` for any new transitions to keep motion consistent across the app.