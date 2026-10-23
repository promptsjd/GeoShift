import React from 'react';
import { COLOR_SWATCH_SHAPE } from '../config/shapeRegistry';
import { ColorDefinition } from '../config/types';
import { getFixedSelectorSlots } from '../engine/carouselUtils';
import { TactileShapeSvg } from './TactileUI';

interface ColorCarouselProps {
  colors: ColorDefinition[];
  selectedIndex: number;
  disabled?: boolean;
  onShiftColor: (delta: number) => void;
  onSelectDirectIndex: (index: number) => void;
}

/**
 * Tactile Arcade Studio Horizontal Color Selector Dock
 * - Uses the dedicated non-playable shape (`COLOR_SWATCH_SHAPE` = Rounded Square) rendered via `TactileShapeSvg`
 *   so every swatch displays its outer rim and inner concentric facet.
 * - Framed inside a dual-layer faceted dock.
 */
export const ColorCarousel: React.FC<ColorCarouselProps> = ({
  colors,
  selectedIndex,
  disabled = false,
  onSelectDirectIndex,
}) => {
  const slots = getFixedSelectorSlots(colors, selectedIndex);

  return (
    <div
      className={`flex items-center justify-center select-none transition-opacity duration-200 ${
        disabled ? 'opacity-25 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Color Selector Strip"
      aria-disabled={disabled}
    >
      <div className="relative rounded-2xl bg-[#0B0F1A] border-2 border-[#384766] p-1.5 shadow-[0_14px_30px_-8px_rgba(0,0,0,0.8)]">
        <div className="relative rounded-xl bg-[#141A2C] border border-[#4F638C]/40 flex items-center justify-center gap-2 px-3 py-1.5">
          {slots.map((slot) => {
            const isActive = slot.isActive;
            const size = isActive ? 48 : 34;

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
                className={`relative w-[54px] h-[54px] rounded-xl flex items-center justify-center transition-all duration-150 ease-out cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-400 ${
                  isActive
                    ? 'hud-slot-active scale-105'
                    : 'hover:bg-slate-800/45 border border-transparent opacity-85 hover:opacity-100'
                }`}
              >
                <TactileShapeSvg
                  shape={COLOR_SWATCH_SHAPE}
                  color={slot.item}
                  size={size}
                  isActive={isActive}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
