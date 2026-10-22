import React from 'react';
import { COLOR_SWATCH_SHAPE } from '../config/shapeRegistry';
import { ColorDefinition } from '../config/types';
import { getFixedSelectorSlots } from '../engine/carouselUtils';

interface ColorCarouselProps {
  colors: ColorDefinition[];
  selectedIndex: number;
  disabled?: boolean;
  onShiftColor: (delta: number) => void;
  onSelectDirectIndex: (index: number) => void;
}

/**
 * Fixed-Position Horizontal Color Strip
 * - Uses the dedicated non-playable shape (`COLOR_SWATCH_SHAPE` = Rounded Square).
 * - All colors stay at their fixed horizontal positions.
 * - The selected color enlarges in place at its own position, with hard stops at left and right ends.
 */
export const ColorCarousel: React.FC<ColorCarouselProps> = ({
  colors,
  selectedIndex,
  disabled = false,
  onSelectDirectIndex,
}) => {
  const slots = getFixedSelectorSlots(colors, selectedIndex);
  const swatchPathActive = COLOR_SWATCH_SHAPE.getSvgPath(58);
  const swatchPathInactive = COLOR_SWATCH_SHAPE.getSvgPath(38);

  return (
    <div
      className={`flex items-center justify-center select-none transition-opacity duration-200 ${
        disabled ? 'opacity-25 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Color Selector Strip"
      aria-disabled={disabled}
    >
      <div className="flex items-center justify-center gap-2.5 px-4 py-2 min-w-[280px]">
        {slots.map((slot) => {
          const isActive = slot.isActive;
          const size = isActive ? 58 : 38;
          const path = isActive ? swatchPathActive : swatchPathInactive;

          return (
            <button
              key={slot.item.id}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (disabled) return;
                onSelectDirectIndex(slot.originalIndex);
              }}
              aria-label={`Select color ${slot.item.name}${isActive ? ' (Active)' : ''}`}
              className="w-[58px] h-[58px] flex items-center justify-center transition-transform duration-150 ease-out cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-400"
            >
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="overflow-visible transition-all duration-150"
              >
                <path d={path} fill={slot.item.hex} />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
};
