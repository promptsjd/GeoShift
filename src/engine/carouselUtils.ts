/**
 * Fixed-Position Selector Utilities (With Hard Boundary Stops)
 * Keeps every color and shape in its fixed spatial slot and enlarges the selected item
 * in place, clamping movement at the start (index 0) and end (index length - 1).
 */

export interface SelectorSlot<T> {
  item: T;
  originalIndex: number;
  isActive: boolean;
}

/**
 * Shifts an index by delta (+1 or -1) within [0, length - 1] with hard stops at both ends.
 * Once at index 0, pressing Up/Left (-1) does nothing; once at length - 1, pressing Down/Right (+1) does nothing.
 */
export function shiftClampedIndex(currentIndex: number, delta: number, length: number): number {
  if (length <= 0) return 0;
  return Math.max(0, Math.min(length - 1, currentIndex + delta));
}

/**
 * Returns items in their fixed spatial positions, marking the currently active index.
 */
export function getFixedSelectorSlots<T>(items: T[], activeIndex: number): SelectorSlot<T>[] {
  return items.map((item, idx) => ({
    item,
    originalIndex: idx,
    isActive: idx === activeIndex,
  }));
}
