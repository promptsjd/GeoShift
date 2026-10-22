# GeoShift — Fixed-Position Shape & Color Selectors with Hard Stops

This update replaces the rotating loop behavior of the **Color** and **Shape** selectors with **fixed-position strips and hard boundary stops**, improving spatial muscle memory and peripheral readability during high-speed runs and Practice modes.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following selector interaction decision has been confirmed:

- **Confirmed Decision — Fixed Positions with Hard Stops, Enlarging in Place**:
  - **Fixed Spatial Order**: Every shape in the left vertical bar and every color in the top horizontal bar stays permanently in its own slot rather than rotating toward the center.
  - **In-Place Active Scaling**: Whichever shape or color is currently selected enlarges at its own fixed position (`70px` vs. `40px` for shapes; `58px` vs. `38px` for colors) within a stable fixed-dimension slot container so neighboring items never shift or jitter.
  - **Hard Boundary Stops (No Loop)**: Pressing `Up`/`W` at the top shape (`index 0`) or `Down`/`S` at the bottom shape (`index N - 1`) stops at the boundary without wrapping around. Pressing `Left`/`A` at the leftmost color (`index 0`) or `Right`/`D` at the rightmost color (`index N - 1`) similarly stops at the boundary.

---

### 1. Overview & Core Concept

- **What It Does**:
  - Anchors each shape and color to a permanent visual coordinate on screen.
  - Clamps index navigation to `[0, length - 1]` so players can build reliable muscle memory and rapidly tap toward either end of the strip without overshooting or wrapping to the opposite side.
- **Target Audience / Persona**: Desktop and laptop players building fast, repeatable spatial reflexes across both **Practice** modes (**Shape**, **Color**, **Jump**, **Full**) and the main **Game**.
- **Key Value**: Eliminates distracting list rotation in peripheral vision while preserving strict separation of concerns in the selector utility layer.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Top Horizontal Color Strip**:
     - Renders all active colors in their fixed horizontal order using the dedicated non-playable **Rounded Square** swatch shape.
     - The selected color renders enlarged (`58px`) in its own slot while unselected colors remain at `38px`.
     - Pressing `←`/`A` moves selection left until reaching the first color, where further `←`/`A` presses do nothing. Pressing `→`/`D` moves selection right until reaching the last color, where further `→`/`D` presses do nothing.
  2. **Left Vertical Shape Strip**:
     - Renders all active playable shapes (Triangle at top, then Diamond, Circle, Pentagon, Star at bottom) in their fixed vertical order, tinted in the player's currently selected color.
     - The selected shape renders enlarged (`70px`) in its own slot while unselected shapes remain at `40px`.
     - Pressing `↑`/`W` moves selection up until reaching the top shape; pressing `↓`/`S` moves selection down until reaching the bottom shape.
- **Visual Identity & Theme**:
  - Each item slot reserves a consistent bounding box so scaling the active shape or color in place feels crisp and never pushes adjacent items out of alignment.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Isolated Clamped Index Utility (`shiftClampedIndex`)**
  - *Chosen Approach*: Update the selector utility module to provide a clamped index function `Math.max(0, Math.min(length - 1, currentIndex + delta))` alongside ordered slot mapping where `isSelected = (index === selectedIndex)`.
  - *Why*: Because selector state logic is already decoupled from physics, obstacle spawning, and collision evaluation, changing from circular modulo arithmetic to clamped linear indexing requires zero changes to the game engine or Practice modes.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     SELECTOR UTILITY LAYER                              │
│  • shiftClampedIndex(currentIndex, delta, length) -> [0 .. length - 1]  │
│  • getFixedSelectorSlots(items, activeIndex) -> Fixed slots in place    │
└───────────────────┬─────────────────────────────────┬───────────────────┘
                    │                                 │
                    ▼                                 ▼
┌───────────────────────────────────────┐ ┌───────────────────────────────┐
│ Top Horizontal Color Strip            │ │ Left Vertical Shape Strip     │
│ • Fixed order: [0 .. N-1]             │ │ • Fixed order: [0 .. M-1]     │
│ • Active color enlarges in its own    │ │ • Active shape enlarges in    │
│   slot (58px vs 38px)                 │ │   its own slot (70px vs 40px) │
│ • Hard stops at Left (0) & Right (N-1)│ │ • Hard stops at Top & Bottom  │
└───────────────────────────────────────┘ └───────────────────────────────┘
```

- **Interactive Component & State Mapping**:
  - **Keyboard Input (`←`/`→`, `A`/`D`, `↑`/`↓`, `W`/`S`)**: Invokes `shiftClampedIndex(currentIndex, ±1, length)`. When `currentIndex` is already `0` and `delta` is `-1` (or `length - 1` and `delta` is `+1`), the index remains unchanged.
  - **Direct Click Affordance**: Clicking any shape or color slot directly selects that fixed index (`onSelectDirectIndex(slot.originalIndex)`).
