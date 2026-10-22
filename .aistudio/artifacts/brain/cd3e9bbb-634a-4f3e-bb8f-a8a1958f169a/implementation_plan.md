# GeoShift — Retro 8-Bit Arcade Sound Effects & Top Bar Audio Toggle

This update adds lightweight, zero-latency 8-bit arcade sound effects using the browser's native Web Audio API for **Shape/Color Shift**, **Jump / Double Jump**, and **Game Over**, paired with a persistent **Mute/Unmute** toggle in the top navigation bar.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Confirmed Sound & UI Decisions from Phase 1:
> - **Confirmed Decision 1 (Target Events)**: Sound effects play strictly on **Shape/Color Shift** (a single shared sound for both shape and color switches), **Jump / Double Jump**, and **Game Over**.
> - **Confirmed Decision 2 (Audio Style)**: Crisp retro **8-bit arcade beeps** synthesized directly via Web Audio API oscillators (zero external audio files or loading delays).
> - **Confirmed Decision 3 (Top Bar Control)**: A **Mute/Unmute toggle** (`Sound: On` / `Sound: Off`) integrated into the Top Bar navigation zone and persisted in `localStorage`.

---

### 1. Overview & Core Concept

- **What It Does**:
  - **Shared Shift Beep (Shape & Color)**: Plays a short, snappy 8-bit square-wave blip (~45ms) whenever the player shifts to a new shape or color via keyboard (`W`/`S`/`↑`/`↓` or `A`/`D`/`←`/`→`) or direct carousel click (only when the index actually changes, not when clamped at an end stop).
  - **Jump & Double-Jump Rising Beep**: Plays a classic 8-bit upward frequency sweep on single jump, and a slightly higher-pitched upward sweep on mid-air double jump so the player gets immediate tactile confirmation of their elevation tier.
  - **Game Over Descending Tone**: Plays a short, recognizable 3-note descending 8-bit arcade cadence when a run ends on an obstacle collision.
  - **Top Bar Mute Toggle**: Adds a single-line `Sound: On` / `Sound: Off` control in the top navigation bar (and supports pressing `M` as a convenient keyboard shortcut) with automatic `localStorage` persistence.
- **Target Audience / Persona**: Desktop players looking for crisp, immediate auditory feedback during high-speed shape, color, and jump coordination without visual or audio clutter.
- **Key Value**: Enhances tactile responsiveness and rhythm—especially when pressing shape and color keys simultaneously—while keeping the app lightweight and self-contained.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Shifting Shape or Color**: Pressing `W`/`S`/`↑`/`↓` or `A`/`D`/`←`/`→` (or clicking a carousel item) triggers a crisp 8-bit blip when the selection moves to a new slot. If the player is already at the first or last slot (hard stop), no sound plays.
  2. **Jumping**: Pressing `Space` on the floor plays a rising 8-bit jump tone; pressing `Space` again in mid-air plays a higher-pitched double-jump tone.
  3. **Game Over**: Colliding with a wall in Game mode triggers the descending 8-bit Game Over cadence.
  4. **Toggling Audio**: Clicking `Sound: On` / `Sound: Off` in the top navigation bar immediately mutes or unmutes all game audio and remembers the preference across browser sessions.
- **Visual Identity & Theme**:
  - *Top Bar Contract Compliance*: Preserves the strict 3-zone Top Bar layout (`GeoShift` wordmark on the left, concise single-line text links in the center nav zone including `Sound: On` / `Sound: Off`, and the single primary action button on the right).
  - *Zero-Latency Feedback*: All sounds are synthesized in memory using a shared `AudioContext` that automatically unlocks on the first key press or click.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Native Web Audio API Synthesizer vs. External Audio Files**
  - *Chosen Approach*: Pure Web Audio API oscillator synthesis (`square` and `triangle` waveforms with exponential frequency and gain ramps).
  - *Why*: Eliminates network requests, decoding latency, and overlapping audio element issues during rapid simultaneous key presses, while delivering authentic 8-bit chiptune character.
- **Decision 2 — Clamped Boundary Silence**
  - *Chosen Approach*: Only trigger the Shift sound when `nextIndex !== prevIndex`.
  - *Why*: Provides subtle auditory feedback that the player has reached the top/bottom or left/right boundary of the selector strip.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Audio Flow Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     USER INPUT & GAME LOOP EVENTS                       │
│  • Shift Color / Shape (Keyboard or Carousel Click, when index moves)   │
│  • Jump / Double Jump (Spacebar when grounded or jumpsUsed === 1)       │
│  • Collision Failure (Game Over transition in 60fps loop)               │
│  • Top Bar Mute Toggle (Click "Sound: On / Off" or press KeyM)          │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      8-BIT WEB AUDIO SYNTHESIZER                        │
│  • Shared singleton AudioContext (auto-resumed on user interaction)     │
│  • Mute State Manager (synced with localStorage)                        │
│  ├─ playShiftSound()    ──▶ Short 8-bit square-wave blip (520Hz→680Hz)  │
│  ├─ playJumpSound(tier) ──▶ Rising 8-bit sweep (1st jump vs 2nd jump)   │
│  └─ playGameOverSound() ──▶ 3-step descending 8-bit arcade cadence      │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Interactive Component & State Mapping**:
  - **TopBar**: Displays `Sound: On` / `Sound: Off` in Zone 2 alongside `Arena`, `Rules & Controls`, and `Leaderboard`, invoking `onToggleMute` on click.
  - **App Controller**: Holds `isMuted` state initialized from `localStorage`, triggers `playShiftSound()` when `colorIndex` or `shapeIndex` changes, triggers `playJumpSound(jumpsUsed)` when `triggerPlayerJump` increments `jumpsUsed`, and triggers `playGameOverSound()` when transitioning to `GAME_OVER`.
