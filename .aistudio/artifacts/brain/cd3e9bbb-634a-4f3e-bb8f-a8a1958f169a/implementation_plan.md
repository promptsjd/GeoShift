# GeoShift — Tactile Arcade Studio & Modular Animation Overhaul

An end-to-end visual, typographic, UI window, and physics-driven animation upgrade for **GeoShift** that transforms the flat-vector corridor into a tactile arcade studio experience with configurable per-shape spin/squeeze dynamics and high-contrast framed HUD windows—while keeping all core game rules, controls, and strict separation of concerns intact.

## User Review & Critical Decisions

> [!IMPORTANT]
> All aesthetic, animation, and typographic directions below reflect your confirmed choices and are architected into decoupled configuration registries so every visual and motion parameter can be tuned independently without touching game logic.

- **Confirmed Decision 1 — Tactile Arcade Studio Art Style**: The arena, geometric shapes, and obstacle structures gain dimensional depth with subtle inner/outer bevel highlights, atmospheric corridor lighting, and layered tactile shading rather than flat, unlit vector fills.
- **Confirmed Decision 2 — Per-Shape Configurable Spin & Squash-and-Stretch Engine**: A dedicated animation configuration registry governs each shape's single-jump spin (e.g., 360°), double-jump spin (e.g., 720°), takeoff stretch, mid-air velocity deformation, landing squash-and-rebound, and selector morph pulse.
- **Confirmed Decision 3 — Barlow Condensed Arcade Typography & Framed HUD Windows**: Typography upgrades to `Barlow Condensed` (display headers & arcade titles) paired with `Plus Jakarta Sans` (body prose) and `JetBrains Mono` (tabular numerals), housed inside crisp, high-contrast framed HUD windows and tactile selector tracks.

---

## 1. Overview & Core Concept

- **What It Does**: Elevates every visual surface and motion cue of GeoShift—introducing smooth rotational acrobatics during single and double jumps, elastic squash-and-stretch on takeoff and landing, dimensional bevel rendering on shapes and obstacle monoliths, and a cohesive arcade HUD and modal window system.
- **Target Audience / Persona**: Desktop reflex and arcade players who want crisp visual readability at high speeds alongside rewarding, physical-feeling motion feedback for every jump, land, and shape/color shift.
- **Key Value**: Eliminates stiff, instantaneous visual state changes in favor of fluid 60fps physical animation while maintaining strict separation between configuration data, animation math, physics, and rendering.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Title & Mode Selection Windows**: Players arrive at a high-contrast framed HUD command overlay set in `Barlow Condensed`, featuring dimensional geometric emblems, clear keyboard shortcut badges, and tactile action buttons for **Game** and **Practice** modes.
2. **Tactile Color & Shape Carousels**: Shifting colors (`A`/`D` or `Left`/`Right`) or shapes (`W`/`S` or `Up`/`Down`) triggers a snappy elastic scale-and-settle transition inside recessed arcade selector docks with subtle inner bevels and active reticle frames.
3. **Jump Takeoff, Mid-Air Spin & Landing Squeeze**:
   - **Takeoff**: Pressing `Space` triggers an immediate vertical stretch and horizontal compression (`scaleX < 1, scaleY > 1`) as the shape launches upward.
   - **Mid-Air Rotation**: Polygons (Triangle, Diamond, Pentagon, Star, Hexagon) smoothly rotate through their configured angular target (`360°` on single jump, `720°` on double jump) synchronized with their flight arc so they land cleanly upright, while the Circle emphasizes elastic velocity stretching and subtle inner-highlight rotation.
   - **Landing Impact**: Touching down on the corridor floor triggers a cushioned horizontal widen and vertical squeeze (`scaleX > 1, scaleY < 1`) that springs back to rest using a damped harmonic curve, accompanied by a subtle floor contact ripple.
4. **Gate Passage & Failure Feedback**: Passing a matching gate triggers a multi-ring geometric shockwave and dimensional particle burst; collisions highlight the exact mismatch inside a structured post-run diagnostic frame.

### Visual Identity & Theme
- **Aesthetic Direction**: **Tactile Arcade Studio** — precision-machined geometric tokens moving through a deep atmospheric corridor framed by high-contrast structural HUD panels.
- **Color Palette & Mood (60-30-10 Discipline)**:
  - **60% Dominant Canvas (`--background`)**: Deep obsidian studio void (`#07080D`) framing an atmospheric indigo-slate playfield (`#1B1947` to `#262260` vertical depth gradient with subtle perspective floor plane and structural grid hairlines).
  - **30% Structural Surfaces (`--surface`)**: High-contrast gunmetal HUD panels (`#0F131F`) with crisp outer architectural borders (`#26304A`), bevel top-edge highlights (`rgba(255,255,255,0.08)`), and recessed selector wells (`#090C15`).
  - **10% Focal Accents (`--primary` / `--accent`)**: High-luminance emerald (`#10B981`) for primary launch actions and score readouts, electric cyan (`#38BDF8`) for active focus frames and speed milestones, and amber/crimson for proximity pause and collision diagnostics.
- **Typography & Hierarchy (2+1 Font Rule)**:
  - **Display & Arcade Headers**: `Barlow Condensed` (SemiBold 600 / Bold 700) with tight tracking and balanced headlines for HUD counters, modal headers, and mode titles.
  - **Body & Instructions**: `Plus Jakarta Sans` (Regular 400 / SemiBold 600) for crisp legibility across rules, descriptions, and controls.
  - **Telemetry & Scores**: `JetBrains Mono` (`tabular-nums`) for zero-jitter score counters, speed tiers, and leaderboard tables.
- **Component Styling & Layout**:
  - **Framed HUD Windows**: All overlays (Title Menu, Practice Selector, Practice Complete, Pause, Game Over, Rules & Controls, Leaderboard) share a unified architectural frame pattern with chamfered/structured header bars, hairline dividers, and tactile button elevation.
  - **Dimensional Canvas Shapes**: Every shape rendered on canvas and in SVG selectors receives a configurable multi-layer treatment: base saturated fill, subtle top-left directional specular bevel, inner core contour, and crisp outer stroke.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dedicated Animation Config & Pure Evaluator Engine**
  - *Chosen Approach*: Extract all animation parameters (spin degrees per single/double jump, squash/stretch ratios, spring damping, shift pop duration, bevel lighting intensities, corridor atmosphere settings) into a standalone configuration module paired with a pure animation evaluator.
  - *Why*: Directly fulfills the requirement for strict separation of concerns with zero hardcoded magic numbers inside the canvas renderer or physics loop, making future tuning effortless.
  - *Alternatives Considered*: Embedding rotation and scale formulas directly inside `GameArenaCanvas` or `stepPlayerPhysics`—rejected because it couples visual flair to collision physics and makes per-shape customization brittle.
- **Decision 2: Flight-Synchronized Angular Interpolation + Spring Landing Solver**
  - *Chosen Approach*: Drive rotation progress from normalized airborne flight progress (with smooth ease-out angular velocity) and drive squash-and-stretch from a combination of vertical velocity deformation and time-since-takeoff / time-since-landing damped springs.
  - *Why*: Ensures a triangle or star always completes its exact 360° or 720° rotation right as it lands, never getting stuck upside-down on the floor, while keeping collision hitboxes 100% deterministic and unaffected by visual squeeze.
  - *Alternatives Considered*: Fixed degrees-per-second angular velocity—rejected because variable double-jump heights would cause shapes to land at arbitrary tilted angles.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                     DECLARATIVE CONFIGURATION LAYER                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │  Shape & Color   │  │ Physics & Tier   │  │ Visual & Animation       │  │
│  │   Registries     │  │   Registries     │  │ Config Registry (NEW)    │  │
│  │ (Bevel & Paths)  │  │ (Flight Timing)  │  │ (Per-Shape Spin/Squeeze) │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────────┬─────────────┘  │
└───────────┼─────────────────────┼─────────────────────────┼────────────────┘
            │                     │                         │
            ▼                     ▼                         ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                        PURE GAME & ANIMATION ENGINE                        │
│  ┌────────────────────────┐  ┌───────────────────┐  ┌───────────────────┐  │
│  │   Physics & Obstacle   │  │ Collision & Gate  │  │ Animation Engine  │  │
│  │        Engine          │  │     Evaluator     │  │ (Spin, Squash,    │  │
│  │ (Position & Velocity)  │  │ (Hitbox Invariant)│  │  Shift & Ripples) │  │
│  └───────────┬────────────┘  └─────────┬─────────┘  └─────────┬─────────┘  │
└──────────────┼─────────────────────────┼──────────────────────┼────────────┘
               │                         │                      │
               ▼                         ▼                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                    TACTILE ARCADE STUDIO UI & RENDERING                    │
│  ┌────────────────────────┐  ┌───────────────────┐  ┌───────────────────┐  │
│  │ Framed HUD TopBar &    │  │ Tactile Color &   │  │ Dimensional       │  │
│  │ High-Contrast Windows  │  │ Shape Carousels   │  │ Corridor Canvas   │  │
│  │ (Barlow Condensed UI)  │  │ (Spring Reticles) │  │ (Bevels & Trails) │  │
│  └────────────────────────┘  └───────────────────┘  └───────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State
- **Per-Shape Motion Profile (`ShapeAnimationProfile`)**:
  - `singleJumpRotations`: Number of full 360° turns during a single jump (e.g., `1` for Triangle, Diamond, Pentagon, Star; `0` or subtle highlight spin for Circle).
  - `doubleJumpRotations`: Number of full 360° turns during a double jump (e.g., `2` for full 720° aerial spin).
  - `takeoffStretch`: `{ scaleX, scaleY, durationMs }` applied when initiating a jump.
  - `landingSquash`: `{ scaleX, scaleY, durationMs, damping, frequency }` applied upon floor touchdown.
  - `airborneVelocityStretchFactor`: Subtle vertical elongation proportional to vertical speed (`|velocityY|`).
  - `shiftPulseScale`: Elastic pop factor when switching to a new shape or color.
- **Player Visual State (`PlayerVisualState`)**:
  - Tracks `rotationRad`, `scaleX`, `scaleY`, `lastLandedTimeMs`, `lastShiftTimeMs`, `takeoffStartAngleRad`, and `targetLandingAngleRad` cleanly alongside physical coordinates without mutating collision radius.
- **Tactile Theme & Arena Visual Config (`ArenaVisualConfig`)**:
  - Configurable corridor depth gradient stops, floor track thickness, subtle structural grid spacing, obstacle pillar bevel thickness, and gate-clear shockwave ring parameters.

### Interactive Component & State Mapping
- **Jump & Landing Lifecycle (`App` ↔ `physicsEngine` ↔ `animationEngine`)**:
  - When `triggerPlayerJump` fires on `Space`, the animation state records `lastJumpTimeMs`, current rotation angle, and target spin angle (`+360°` for jump 1, `+720°` for jump 2) based on the active shape's profile.
  - Each 60fps frame, `stepPlayerPhysics` updates vertical position and detects floor touchdown (`wasAirborne -> isGrounded`), stamping `lastLandedTimeMs` and spawning a subtle floor landing dust/ripple effect.
  - The pure `computePlayerTransform` function evaluates current `scaleX`, `scaleY`, and `rotationRad` from the active shape's profile and timestamps.
- **Color & Shape Selector Docks (`ColorCarousel` & `ShapeCarousel`)**:
  - Encased in structured arcade HUD docks with directional key cap hints (`A`/`D`, `W`/`S`), active slot reticle framing, dimensional SVG bevel overlays, and smooth CSS transform transitions.
- **Framed HUD Windows (`ArenaOverlays`, `HowToPlayModal`, `LeaderboardModal`, `TopBar`)**:
  - Upgraded to the `Barlow Condensed` + `Plus Jakarta Sans` typographic hierarchy with structured header bars, crisp 1px architectural borders, high-contrast status readouts, and instant keyboard/click responsiveness.
