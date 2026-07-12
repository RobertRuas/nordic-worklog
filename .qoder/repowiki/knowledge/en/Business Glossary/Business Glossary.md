---
kind: business_term
name: Business Glossary
category: business_term
scope:
    - '**'
---

### Nordic Worklog
- Definition：The internal name of this React/Vite single-page application — a minimalist work-log tracker whose purpose is to record time entries and manage projects, with a native-app-like bottom navigation bar. It is frontend-only at present; a backend is planned but not yet implemented.
- Aliases：worklog、NW

### Entradas
- Definition：The 'Entries' page/tab where time-entry records will be listed and managed. Currently a placeholder view with no data layer.
- Aliases：entradas、entries

### Projetos
- Definition：The 'Projects' page/tab displaying a list of past/current projects the user has worked on, with future management capabilities. Currently renders only a simple list.
- Aliases：projetos、projects

### Configurações
- Definition：The 'Settings' page/tab providing app-level options such as theme toggle (light/dark), export functionality, account settings, and a Parameters box (e.g. hourly rate).
- Aliases：configurações、settings

### activeTab
- Definition：The local state key ('home', 'entradas', 'projetos', 'configuracoes') used by App.jsx to switch between the four top-level pages via a bottom navigation bar instead of a router.
- Aliases：tab、aba
