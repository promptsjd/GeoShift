# GeoShift — Fix GitHub Actions `ERESOLVE` Peer Dependency Conflict

This update fixes the `npm error code ERESOLVE` failure during the GitHub Actions build by aligning the `esbuild` devDependency version with `vite@^8.3.0` (`^0.28.0`) and adding `--legacy-peer-deps` as a safeguard in the GitHub Actions installation step.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Root Cause Identified from GitHub Actions Log:
> - `vite@8.3.5` declares `peerOptional esbuild@"^0.27.0 || ^0.28.0"`, while the project manifest currently specifies `"esbuild": "^0.25.0"`.
> - Upgrading `esbuild` to `"^0.28.0"` and passing `--legacy-peer-deps` in the CI workflow resolves this conflict cleanly.

---

### 1. Overview & Core Concept

- **What It Does**:
  - Updates `esbuild` in the project dependencies from `^0.25.0` to `^0.28.0` to satisfy `vite@^8.3.0` peer requirements.
  - Updates the GitHub Actions workflow install command to `npm install --legacy-peer-deps` so future upstream minor releases never block automated Pages deployments.
- **Target Audience / Persona**: Repository maintainer deploying GeoShift via GitHub Actions to GitHub Pages.
- **Key Value**: Ensures `npm install` and `npm run build` succeed reliably in clean CI environments without peer dependency resolution errors.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  - When changes are pushed to `main`, the **Install dependencies** step in GitHub Actions completes without `ERESOLVE` errors, proceeds through **Build production bundle**, and publishes the live game to GitHub Pages.
- **Visual Identity & Theme**:
  - No visual or gameplay changes; maintains the full GeoShift visual design and 60fps canvas arena.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Align `esbuild` Version + CI Fallback Flag**
  - *Chosen Approach*: Upgrade `esbuild` to `^0.28.0` in the dependency manifest AND use `npm install --legacy-peer-deps` in the workflow.
  - *Why*: Fixing the manifest resolves the root conflict locally and in CI, while `--legacy-peer-deps` protects the CI pipeline against any transitive peer mismatches across future package patch releases.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Dependency Resolution Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DEPENDENCY ALIGNMENT                             │
│  • vite@^8.3.0  ──requires──▶  esbuild@^0.27.0 || ^0.28.0               │
│  • Updated devDependencies: esbuild@^0.28.0                             │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     GITHUB ACTIONS BUILD PIPELINE                       │
│  1. npm install --legacy-peer-deps (clean resolution, zero ERESOLVE)    │
│  2. npm run build (outputs ./dist with relative './' asset paths)       │
│  3. Deploy ./dist artifact to GitHub Pages                              │
└─────────────────────────────────────────────────────────────────────────┘
```
