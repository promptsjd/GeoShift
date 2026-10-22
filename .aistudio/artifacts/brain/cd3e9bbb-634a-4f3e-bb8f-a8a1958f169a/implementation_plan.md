# GeoShift — GitHub Pages Automated Build & Relative Asset Deployment

This update resolves the blank page issue on GitHub Pages by configuring relative asset resolution (`./`) in the bundler and adding an automated GitHub Actions build-and-deploy pipeline so the compiled production application is served instead of raw TypeScript source files.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following deployment decisions have been confirmed:

- **Confirmed Decision 1 — Automated GitHub Actions Build Workflow**:
  - Instead of serving raw uncompiled `.tsx` source files from the repository root, a GitHub Actions workflow will automatically install dependencies, compile the production bundle on every push to `main`, and publish the built static output to GitHub Pages.
  - **One-Time GitHub Repo Setting Change**: In your GitHub repository under **Settings → Pages → Build and deployment → Source**, switch from **Deploy from a branch** to **GitHub Actions**.
- **Confirmed Decision 2 — Relative Base Paths (`./`)**:
  - The bundler will emit relative asset URLs (`./assets/...`) and use a relative module entry script (`./src/main.tsx`), ensuring the game loads cleanly whether hosted at `https://<username>.github.io/<repo-name>/` or at a root domain.

---

### 1. Overview & Core Concept

- **What It Does**:
  - Configures the build configuration with `base: './'` so all compiled JavaScript, CSS, and static assets resolve relative to the current page URL.
  - Updates the HTML entry point script tag from an absolute root path to a relative path (`./src/main.tsx`).
  - Adds a pre-configured GitHub Actions Pages workflow that triggers on pushes to `main` (or manual dispatch), compiles the TypeScript/React bundle, and deploys the artifact to GitHub Pages.
- **Target Audience / Persona**: Players accessing the live hosted GeoShift web game via GitHub Pages on desktop and laptop browsers.
- **Key Value**: Eliminates the blank white/dark screen caused by browsers rejecting raw `.tsx` source code and broken root-relative asset URLs on GitHub Pages project URLs.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Developer Push to `main`**:
     - Pushing code to the `main` branch automatically triggers the GitHub Actions build and deployment pipeline.
     - Once the workflow completes (~45 seconds), the live GitHub Pages URL serves the compiled, minified GeoShift application.
  2. **Player Visiting the Live GitHub Pages URL**:
     - The browser loads the compiled `index.html`, fetches the bundled JS and Tailwind CSS via relative paths, and immediately renders the `#07080D` obsidian GeoShift arena, fixed-position color/shape selectors, and interactive title menu.
- **Visual Identity & Theme**:
  - Preserves the complete GeoShift visual design—dark `#07080D` backdrop, `#229954` emerald HUD accents, `Outfit` / `Plus Jakarta Sans` / `JetBrains Mono` typography, and 60fps HTML5 Canvas corridor rendering—without any visual regressions.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Portable Relative Base Path (`base: './'`)**
  - *Chosen Approach*: Configure `base: './'` in the bundler config rather than hardcoding a specific repository name.
  - *Why*: Works seamlessly on any GitHub Pages repository subpath (`/<repo-name>/`), custom domain (`/`), or local preview server without requiring future config edits if the repository is renamed.
  - *Alternatives Considered*: Hardcoding `base: '/repo-name/'` was passed over because it breaks if the repository name changes or if previewed at a root path.
- **Decision 2 — Official GitHub Pages Artifact Action Pipeline**
  - *Chosen Approach*: Use the official `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages` workflow on Node 22.
  - *Why*: Keeps the `main` branch clean of compiled build artifacts while providing automatic deployment on every push.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Deployment Pipeline Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        GITHUB REPOSITORY (main)                         │
│  • Relative HTML Entry (./src/main.tsx)                                 │
│  • Bundler Config (base: './' for portable subpath asset resolution)    │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ Push to main
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     GITHUB ACTIONS BUILD PIPELINE                       │
│  1. Checkout repository & setup Node.js 22 with npm cache               │
│  2. Install dependencies & run production build                         │
│  3. Package compiled dist output as GitHub Pages artifact               │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ Deploy Pages Artifact
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      LIVE GITHUB PAGES ENVIRONMENT                      │
│  • Serves compiled HTML + bundled JS/CSS at /<repo-name>/               │
│  • Renders GeoShift 60fps Canvas Arena & LocalStorage Leaderboard       │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Interactive Component & State Mapping**:
  - **Static Asset & Font Loading**: Google Fonts (`Outfit`, `Plus Jakarta Sans`, `JetBrains Mono`) and bundled JS/CSS load over HTTPS via relative paths, initializing the React root and `localStorage` leaderboard service on GitHub Pages.
