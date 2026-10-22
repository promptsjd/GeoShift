import React from 'react';
import { ColorDefinition, ShapeDefinition } from '../config/types';
import { getFixedSelectorSlots } from '../engine/carouselUtils';

interface ShapeCarouselProps {
  shapes: ShapeDefinition[];
  selectedIndex: number;
  activeColor: ColorDefinition;
  disabled?: boolean;
  onShiftShape: (delta: number) => void;
  onSelectDirectIndex: (index: number) => void;
}

/**
 * Fixed-Position Vertical Shape Strip (Left of Corridor)
 * - Renders all playable shapes in the player's currently selected color.
 * - All shapes remain at their fixed vertical positions.
 * - The selected shape enlarges in place at its own position, with hard stops at top and bottom ends.
 */
export const ShapeCarousel: React.FC<ShapeCarouselProps> = ({
  shapes,
  selectedIndex,
  activeColor,
  disabled = false,
  onSelectDirectIndex,
}) => {
  const slots = getFixedSelectorSlots(shapes, selectedIndex);

  return (
    <div
      className={`flex flex-col items-center justify-center select-none shrink-0 transition-opacity duration-200 ${
        disabled ? 'opacity-25 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Shape Selector Strip"
      aria-disabled={disabled}
    >
      <div className="flex flex-col items-center justify-center gap-1.5 px-3 py-2 min-h-[320px] w-[96px]">
        {slots.map((slot) => {
          const isActive = slot.isActive;
          const size = isActive ? 70 : 40;
          const svgPath = slot.item.getSvgPath(size);

          return (
            <button
              key={slot.item.id}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (disabled) return;
                onSelectDirectIndex(slot.originalIndex);
              }}
              aria-label={`Select shape ${slot.item.name}${isActive ? ' (Active)' : ''}`}
              className="w-[72px] h-[62px] flex items-center justify-center transition-transform duration-150 ease-out cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-400"
            >
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="overflow-visible transition-all duration-150"
              >
                <path
                  d={svgPath}
                  fill={activeColor.hex}
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
};
