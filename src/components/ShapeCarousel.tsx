import React from 'react';
import { ColorDefinition, ShapeDefinition } from '../config/types';
import { getFixedSelectorSlots } from '../engine/carouselUtils';
import { TactileShapeSvg } from './TactileUI';

interface ShapeCarouselProps {
  shapes: ShapeDefinition[];
  selectedIndex: number;
  activeColor: ColorDefinition;
  disabled?: boolean;
  onShiftShape: (delta: number) => void;
  onSelectDirectIndex: (index: number) => void;
}

/**
 * Tactile Arcade Studio Vertical Shape Selector Dock (Left of Corridor)
 * - Renders all playable shapes in the player's currently selected color via `TactileShapeSvg`
 *   so every shape displays its outer stroke and inner concentric facet.
 * - Framed inside a dual-layer faceted dock.
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
      <div className="relative rounded-2xl bg-[#0B0F1A] border-2 border-[#384766] p-1.5 shadow-[0_14px_30px_-8px_rgba(0,0,0,0.8)]">
        <div className="relative rounded-xl bg-[#141A2C] border border-[#4F638C]/40 flex flex-col items-center justify-center gap-2 p-2 min-h-[340px] w-[86px]">
          {slots.map((slot) => {
            const isActive = slot.isActive;
            const size = isActive ? 54 : 36;

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
                className={`relative w-[68px] h-[60px] rounded-xl flex items-center justify-center transition-all duration-150 ease-out cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-400 ${
                  isActive
                    ? 'hud-slot-active scale-105'
                    : 'hover:bg-slate-800/45 border border-transparent opacity-85 hover:opacity-100'
                }`}
              >
                <TactileShapeSvg
                  shape={slot.item}
                  color={activeColor}
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
