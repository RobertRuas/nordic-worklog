---
kind: external_dependency
name: react-icons icon library for UI icons
slug: react-icons
category: external_dependency
category_hints:
    - client_constraint
scope:
    - '**'
source_files:
    - package.json
    - src/components/BottomNav/BottomNav.jsx
---

### Icon set used across the app
- Only dependency declared in `package.json`; imported from `react-icons` throughout components (e.g. BottomNav uses it for navigation icons).
- Per project design rules, icons should be sourced exclusively from this library rather than custom SVGs when an appropriate icon exists.