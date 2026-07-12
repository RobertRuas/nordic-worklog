# Project Overview

<cite>
**Referenced Files in This Document**
- [package.json](file://package.json)
- [README.md](file://README.md)
- [vite.config.js](file://vite.config.js)
- [index.html](file://index.html)
- [src/main.jsx](file://src/main.jsx)
- [src/App.jsx](file://src/App.jsx)
- [src/components/Layout/Layout.jsx](file://src/components/Layout/Layout.jsx)
- [src/components/BottomNav/BottomNav.jsx](file://src/components/BottomNav/BottomNav.jsx)
- [src/context/ThemeContext.jsx](file://src/context/ThemeContext.jsx)
- [src/pages/Home/Home.jsx](file://src/pages/Home/Home.jsx)
- [src/pages/Entradas/Entradas.jsx](file://src/pages/Entradas/Entradas.jsx)
- [src/pages/Projetos/Projetos.jsx](file://src/pages/Projetos/Projetos.jsx)
- [src/pages/Projetos/components/ProjectItem.jsx](file://src/pages/Projetos/components/ProjectItem.jsx)
- [src/pages/Configuracoes/Configuracoes.jsx](file://src/pages/Configuracoes/Configuracoes.jsx)
- [src/pages/Configuracoes/components/ThemeToggle.jsx](file://src/pages/Configuracoes/components/ThemeToggle.jsx)
- [src/pages/Configuracoes/components/ParametrosBox.jsx](file://src/pages/Configuracoes/components/ParametrosBox.jsx)
</cite>

## Table of Contents
1. Introduction
2. Project Structure
3. Core Components
4. Architecture Overview
5. Detailed Component Analysis
6. Dependency Analysis
7. Performance Considerations
8. Troubleshooting Guide
9. Conclusion

## Introduction
Nordic Worklog is a minimal, mobile-first React application designed for personal work tracking and lightweight project management. It provides:
- Work entry tracking (placeholder page ready to be extended)
- Project listing and management (with a sample list and item component)
- A configuration system including theme switching and editable parameters such as hourly rate and default daily hours
- Responsive design with a fixed header and bottom navigation bar

Target audience and use cases:
- Freelancers and consultants who need a simple way to log time entries and keep track of projects
- Small teams or individuals seeking a clean, distraction-free interface for daily work logs
- Developers looking for a minimal React + Vite starter that demonstrates modern patterns like Context-based theming and local state-driven configuration

Technology stack:
- React 19.2.7 and React DOM 19.2.7
- Vite 8.1.1 with the official React plugin
- Modern JavaScript modules (ESM), strict mode rendering, and CSS custom properties for theming
- react-icons for lightweight iconography

Practical examples:
- Switch between light and dark themes from Settings; the preference persists across sessions
- View a sample list of projects and their statuses
- Adjust default parameters such as hourly value and standard daily hours in Settings

**Section sources**
- [package.json:12-23](file://package.json#L12-L23)
- [README.md:1-17](file://README.md#L1-L17)
- [vite.config.js:1-12](file://vite.config.js#L1-L12)
- [index.html:1-14](file://index.html#L1-L14)

## Project Structure
The app follows a feature-oriented layout under src/pages, shared UI components under src/components, and global behavior via context. The root App manages tab-based navigation and renders pages inside a Layout shell with a fixed header and bottom navigation.

```mermaid
graph TB
HTML["index.html"] --> MainJSX["src/main.jsx"]
MainJSX --> ThemeProvider["src/context/ThemeContext.jsx"]
MainJSX --> App["src/App.jsx"]
App --> Layout["src/components/Layout/Layout.jsx"]
Layout --> BottomNav["src/components/BottomNav/BottomNav.jsx"]
App --> Home["src/pages/Home/Home.jsx"]
App --> Entradas["src/pages/Entradas/Entradas.jsx"]
App --> Projetos["src/pages/Projetos/Projetos.jsx"]
Projetos --> ProjectItem["src/pages/Projetos/components/ProjectItem.jsx"]
App --> Configuracoes["src/pages/Configuracoes/Configuracoes.jsx"]
Configuracoes --> ThemeToggle["src/pages/Configuracoes/components/ThemeToggle.jsx"]
Configuracoes --> ParametrosBox["src/pages/Configuracoes/components/ParametrosBox.jsx"]
```

**Diagram sources**
- [index.html:1-14](file://index.html#L1-L14)
- [src/main.jsx:1-15](file://src/main.jsx#L1-L15)
- [src/context/ThemeContext.jsx:1-49](file://src/context/ThemeContext.jsx#L1-L49)
- [src/App.jsx:1-39](file://src/App.jsx#L1-L39)
- [src/components/Layout/Layout.jsx:1-49](file://src/components/Layout/Layout.jsx#L1-L49)
- [src/components/BottomNav/BottomNav.jsx:1-37](file://src/components/BottomNav/BottomNav.jsx#L1-L37)
- [src/pages/Home/Home.jsx:1-19](file://src/pages/Home/Home.jsx#L1-L19)
- [src/pages/Entradas/Entradas.jsx:1-19](file://src/pages/Entradas/Entradas.jsx#L1-L19)
- [src/pages/Projetos/Projetos.jsx:1-31](file://src/pages/Projetos/Projetos.jsx#L1-L31)
- [src/pages/Projetos/components/ProjectItem.jsx:1-49](file://src/pages/Projetos/components/ProjectItem.jsx#L1-L49)
- [src/pages/Configuracoes/Configuracoes.jsx:1-70](file://src/pages/Configuracoes/Configuracoes.jsx#L1-L70)
- [src/pages/Configuracoes/components/ThemeToggle.jsx:1-55](file://src/pages/Configuracoes/components/ThemeToggle.jsx#L1-L55)
- [src/pages/Configuracoes/components/ParametrosBox.jsx:1-85](file://src/pages/Configuracoes/components/ParametrosBox.jsx#L1-L85)

**Section sources**
- [src/App.jsx:1-39](file://src/App.jsx#L1-L39)
- [src/components/Layout/Layout.jsx:1-49](file://src/components/Layout/Layout.jsx#L1-L49)
- [src/components/BottomNav/BottomNav.jsx:1-37](file://src/components/BottomNav/BottomNav.jsx#L1-L37)
- [src/pages/Projetos/Projetos.jsx:1-31](file://src/pages/Projetos/Projetos.jsx#L1-L31)
- [src/pages/Configuracoes/Configuracoes.jsx:1-70](file://src/pages/Configuracoes/Configuracoes.jsx#L1-L70)

## Core Components
- Application shell:
  - Layout provides a fixed header and content area, delegating navigation to BottomNav.
  - BottomNav defines four tabs: Home, Entries, Projects, Settings, and updates the active tab via props.
- Navigation and routing:
  - App maintains activeTab state and conditionally renders the selected page.
- Theming:
  - ThemeContext exposes theme and toggleTheme, persisting the selection to localStorage and applying a class on the document element.
  - ThemeToggle reads and toggles the theme using the provided hook.
- Configuration:
  - Configuracoes groups general options and parameter inputs.
  - ParametrosBox holds local state for hourly rate and default daily hours, demonstrating how user preferences can drive calculations later.
- Projects:
  - Projetos displays a small sample dataset and renders each item via ProjectItem.

Key behaviors:
- Tab navigation is state-driven and does not rely on a router library.
- Theme preference persists across reloads and respects system preference on first load.
- Parameter values are stored locally within the component and can be extended to persist globally.

**Section sources**
- [src/components/Layout/Layout.jsx:1-49](file://src/components/Layout/Layout.jsx#L1-L49)
- [src/components/BottomNav/BottomNav.jsx:1-37](file://src/components/BottomNav/BottomNav.jsx#L1-L37)
- [src/App.jsx:1-39](file://src/App.jsx#L1-L39)
- [src/context/ThemeContext.jsx:1-49](file://src/context/ThemeContext.jsx#L1-L49)
- [src/pages/Configuracoes/components/ThemeToggle.jsx:1-55](file://src/pages/Configuracoes/components/ThemeToggle.jsx#L1-L55)
- [src/pages/Configuracoes/Configuracoes.jsx:1-70](file://src/pages/Configuracoes/Configuracoes.jsx#L1-L70)
- [src/pages/Configuracoes/components/ParametrosBox.jsx:1-85](file://src/pages/Configuracoes/components/ParametrosBox.jsx#L1-L85)
- [src/pages/Projetos/Projetos.jsx:1-31](file://src/pages/Projetos/Projetos.jsx#L1-L31)
- [src/pages/Projetos/components/ProjectItem.jsx:1-49](file://src/pages/Projetos/components/ProjectItem.jsx#L1-L49)

## Architecture Overview
At runtime, the browser loads index.html, which mounts the React tree via main.jsx. The ThemeProvider wraps the entire app, making theme state available everywhere. App controls navigation by maintaining an active tab and rendering the corresponding page inside Layout. Layout composes the header and BottomNav, while pages implement specific features.

```mermaid
sequenceDiagram
participant Browser as "Browser"
participant HTML as "index.html"
participant Main as "src/main.jsx"
participant Theme as "ThemeContext"
participant App as "App"
participant Layout as "Layout"
participant Nav as "BottomNav"
participant Page as "Active Page"
Browser->>HTML : Load page
HTML->>Main : Execute module script
Main->>Theme : Wrap App with ThemeProvider
Main->>App : Render <App />
App->>Layout : Render with activeTab state
Layout->>Nav : Render BottomNav(activeTab, setActiveTab)
Nav-->>App : setActiveTab(newTab)
App->>Page : Render selected page component
```

**Diagram sources**
- [index.html:1-14](file://index.html#L1-L14)
- [src/main.jsx:1-15](file://src/main.jsx#L1-L15)
- [src/context/ThemeContext.jsx:1-49](file://src/context/ThemeContext.jsx#L1-L49)
- [src/App.jsx:1-39](file://src/App.jsx#L1-L39)
- [src/components/Layout/Layout.jsx:1-49](file://src/components/Layout/Layout.jsx#L1-L49)
- [src/components/BottomNav/BottomNav.jsx:1-37](file://src/components/BottomNav/BottomNav.jsx#L1-L37)

## Detailed Component Analysis

### Navigation and Shell
- App manages activeTab and switches between Home, Entries, Projects, and Settings.
- Layout computes the header title based on the active tab and renders children plus BottomNav.
- BottomNav defines the four navigation items and triggers setActiveTab when clicked.

```mermaid
classDiagram
class App {
+state activeTab
+renderPage()
}
class Layout {
+children
+activeTab
+setActiveTab()
+getHeaderTitle()
}
class BottomNav {
+activeTab
+setActiveTab()
+navItems
}
App --> Layout : "wraps"
Layout --> BottomNav : "uses"
```

**Diagram sources**
- [src/App.jsx:1-39](file://src/App.jsx#L1-L39)
- [src/components/Layout/Layout.jsx:1-49](file://src/components/Layout/Layout.jsx#L1-L49)
- [src/components/BottomNav/BottomNav.jsx:1-37](file://src/components/BottomNav/BottomNav.jsx#L1-L37)

**Section sources**
- [src/App.jsx:1-39](file://src/App.jsx#L1-L39)
- [src/components/Layout/Layout.jsx:1-49](file://src/components/Layout/Layout.jsx#L1-L49)
- [src/components/BottomNav/BottomNav.jsx:1-37](file://src/components/BottomNav/BottomNav.jsx#L1-L37)

### Theming System
- ThemeContext initializes theme from localStorage or system preference, applies a class to the document root, and persists changes.
- ThemeToggle consumes the context to switch between light and dark modes.

```mermaid
flowchart TD
Start(["Initialize Theme"]) --> CheckStorage["Read 'theme' from localStorage"]
CheckStorage --> HasSaved{"Saved theme exists?"}
HasSaved --> |Yes| UseSaved["Use saved theme"]
HasSaved --> |No| DetectSystem["Detect prefers-color-scheme"]
DetectSystem --> SetInitial["Set initial theme"]
UseSaved --> ApplyClass["Apply 'dark' class if needed"]
SetInitial --> ApplyClass
ApplyClass --> Persist["Save to localStorage on change"]
Persist --> End(["Ready"])
```

**Diagram sources**
- [src/context/ThemeContext.jsx:1-49](file://src/context/ThemeContext.jsx#L1-L49)
- [src/pages/Configuracoes/components/ThemeToggle.jsx:1-55](file://src/pages/Configuracoes/components/ThemeToggle.jsx#L1-L55)

**Section sources**
- [src/context/ThemeContext.jsx:1-49](file://src/context/ThemeContext.jsx#L1-L49)
- [src/pages/Configuracoes/components/ThemeToggle.jsx:1-55](file://src/pages/Configuracoes/components/ThemeToggle.jsx#L1-L55)

### Configuration and Parameters
- Configuracoes groups general options and parameter settings.
- ParametrosBox stores local state for hourly rate and default daily hours, illustrating where future calculations could consume these values.

```mermaid
flowchart TD
Enter(["Open Settings"]) --> ShowParams["Render ParametrosBox"]
ShowParams --> EditHourly["Edit Hourly Rate"]
ShowParams --> EditDaily["Edit Daily Hours"]
EditHourly --> UpdateState["Update local state"]
EditDaily --> UpdateState
UpdateState --> Ready["Values available for calculations"]
```

**Diagram sources**
- [src/pages/Configuracoes/Configuracoes.jsx:1-70](file://src/pages/Configuracoes/Configuracoes.jsx#L1-L70)
- [src/pages/Configuracoes/components/ParametrosBox.jsx:1-85](file://src/pages/Configuracoes/components/ParametrosBox.jsx#L1-L85)

**Section sources**
- [src/pages/Configuracoes/Configuracoes.jsx:1-70](file://src/pages/Configuracoes/Configuracoes.jsx#L1-L70)
- [src/pages/Configuracoes/components/ParametrosBox.jsx:1-85](file://src/pages/Configuracoes/components/ParametrosBox.jsx#L1-L85)

### Projects Listing
- Projetos renders a small sample dataset and maps it to ProjectItem components.
- ProjectItem displays project name, client, and status badge.

```mermaid
classDiagram
class Projetos {
+listaProjetos
+render()
}
class ProjectItem {
+projeto
+render()
}
Projetos --> ProjectItem : "renders many"
```

**Diagram sources**
- [src/pages/Projetos/Projetos.jsx:1-31](file://src/pages/Projetos/Projetos.jsx#L1-L31)
- [src/pages/Projetos/components/ProjectItem.jsx:1-49](file://src/pages/Projetos/components/ProjectItem.jsx#L1-L49)

**Section sources**
- [src/pages/Projetos/Projetos.jsx:1-31](file://src/pages/Projetos/Projetos.jsx#L1-L31)
- [src/pages/Projetos/components/ProjectItem.jsx:1-49](file://src/pages/Projetos/components/ProjectItem.jsx#L1-L49)

### Conceptual Overview
This section summarizes how Nordic Worklog fits into everyday workflows without analyzing specific files.

```mermaid
flowchart TD
User["User opens app"] --> Navigate["Navigate via bottom bar"]
Navigate --> Track["Log work entries (future)"]
Navigate --> Manage["Manage projects (sample data)"]
Navigate --> Configure["Adjust theme and parameters"]
Configure --> Persist["Preferences saved locally"]
Track --> Summarize["Summarize totals using configured parameters"]
```

[No sources needed since this diagram shows conceptual workflow, not actual code structure]

## Dependency Analysis
External dependencies and build tooling:
- React and ReactDOM provide the UI runtime.
- Vite powers development server, HMR, and production builds.
- The React plugin enables JSX transformation.
- react-icons supplies lightweight icons used in navigation and settings.

```mermaid
graph LR
Pkg["package.json"] --> React["react ^19.2.7"]
Pkg --> ReactDOM["react-dom ^19.2.7"]
Pkg --> ReactIcons["react-icons ^5.7.0"]
Pkg --> Vite["vite ^8.1.1 (dev)"]
Pkg --> Plugin["@vitejs/plugin-react ^6.0.3 (dev)"]
ViteCfg["vite.config.js"] --> Plugin
```

**Diagram sources**
- [package.json:12-23](file://package.json#L12-L23)
- [vite.config.js:1-12](file://vite.config.js#L1-L12)

**Section sources**
- [package.json:1-25](file://package.json#L1-L25)
- [vite.config.js:1-12](file://vite.config.js#L1-L12)

## Performance Considerations
- Keep the navigation logic simple and state-driven to avoid unnecessary re-renders.
- Prefer memoization for expensive computations in future features (e.g., aggregating work entries).
- Use CSS custom properties for theming to minimize style recalculation overhead.
- Leverage Vite’s fast refresh during development for rapid iteration.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Theme not persisting: Ensure localStorage is accessible and that the document root receives the correct class. Verify the provider wraps the app at the root level.
- Incorrect header title: Confirm the activeTab matches the expected keys used in the header mapping.
- BottomNav not updating: Ensure setActiveTab is passed down correctly and that onClick handlers call it with the correct tab id.
- Build errors: Confirm the Vite config includes the React plugin and that the entry point imports the app component.

**Section sources**
- [src/context/ThemeContext.jsx:1-49](file://src/context/ThemeContext.jsx#L1-L49)
- [src/components/Layout/Layout.jsx:1-49](file://src/components/Layout/Layout.jsx#L1-L49)
- [src/components/BottomNav/BottomNav.jsx:1-37](file://src/components/BottomNav/BottomNav.jsx#L1-L37)
- [vite.config.js:1-12](file://vite.config.js#L1-L12)

## Conclusion
Nordic Worklog offers a focused, minimal foundation for personal work tracking and project oversight. Its architecture emphasizes simplicity: state-driven navigation, a reusable layout, and a context-based theming system. The configuration surface allows users to tailor defaults that will power future calculations. With React 19.2.7 and Vite 8.1.1, the project is well-positioned for incremental growth while remaining easy to understand and extend.

[No sources needed since this section summarizes without analyzing specific files]