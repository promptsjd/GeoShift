import React from 'react';
import { COLOR_REGISTRY, getColorById } from '../config/colorRegistry';
import {
  COLOR_SWATCH_SHAPE,
  SHAPE_REGISTRY,
} from '../config/shapeRegistry';
import {
  FacetedButton,
  FacetedKeycap,
  FacetedWindow,
  TactileShapeSvg,
} from './TactileUI';

interface HowToPlayModalProps {
  onClose: () => void;
  onStartGame: () => void;
}

/**
 * Tactile Arcade Studio Rules & Controls Modal
 * Uses `TactileShapeSvg` for every shape and color swatch so all 5 colors
 * and all 5 shapes display crisp outer borders and inner concentric facets.
 */
export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  onClose,
  onStartGame,
}) => {
  const defaultShapes = SHAPE_REGISTRY.filter(
    (s) => s.isPlayable && s.enabledByDefault
  );
  const defaultColors = COLOR_REGISTRY.filter((c) => c.enabledByDefault);
  const emeraldColor = getColorById('green');

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/84 backdrop-blur-xs p-6">
      <FacetedWindow maxWidthClass="max-w-4xl">
        {/* Header & 1-Line Gameplay Summary */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/15">
          <div>
            <h2 className="text-4xl font-bold tracking-wider text-white font-display">
              Rules & Controls
            </h2>
            <p className="text-sm text-slate-200 mt-1">
              Match the approaching gate’s shape, color, and jump height before reaching the wall.
            </p>
          </div>

          <FacetedButton
            variant="slate"
            size="sm"
            onClick={onClose}
            className="text-base font-bold whitespace-nowrap shrink-0"
          >
            Close
          </FacetedButton>
        </div>

        {/* 3-Column Visual Diagram: Shape | Color | Jump (Top-Aligned Headings on Same Horizontal Line) */}
        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch gap-6 my-6">
          {/* Column 1: Switch Shape */}
          <div className="md:col-span-4 flex flex-col items-center">
            <h3 className="text-2xl font-bold text-white font-display tracking-wider mb-5">
              Shape
            </h3>

            <div className="flex-1 flex items-center justify-center gap-5">
              {/* Vertical stack of the 5 playable shapes in Emerald Green with inner facets */}
              <div className="relative rounded-2xl bg-[#0B0F1A] border-2 border-[#384766] p-1.5">
                <div className="rounded-xl bg-[#141A2C] border border-[#4F638C]/40 p-2 flex flex-col items-center gap-2">
                  {defaultShapes.map((shape) => {
                    const isCircle = shape.id === 'circle';
                    const size = isCircle ? 50 : 34;
                    return (
                      <div
                        key={shape.id}
                        className={`p-1.5 rounded-lg flex items-center justify-center ${
                          isCircle ? 'hud-slot-active' : 'opacity-90'
                        }`}
                      >
                        <TactileShapeSvg
                          shape={shape}
                          color={emeraldColor}
                          size={size}
                          isActive={isCircle}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Symbolic Key Prompts */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1.5">
                  <FacetedKeycap label="W" />
                  <span className="text-slate-400 font-bold">/</span>
                  <FacetedKeycap label="↑" />
                </div>
                <div className="flex items-center gap-1.5">
                  <FacetedKeycap label="S" />
                  <span className="text-slate-400 font-bold">/</span>
                  <FacetedKeycap label="↓" />
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Switch Color (All 5 Swatches Rendered with Inner Facets) */}
          <div className="md:col-span-4 flex flex-col items-center md:border-x md:border-white/15 md:px-6">
            <h3 className="text-2xl font-bold text-white font-display tracking-wider mb-5">
              Color
            </h3>

            <div className="flex-1 flex flex-col items-center justify-center w-full">
              {/* Horizontal row of the 5 color swatches with inner facets */}
              <div className="relative rounded-2xl bg-[#0B0F1A] border-2 border-[#384766] p-1.5">
                <div className="rounded-xl bg-[#141A2C] border border-[#4F638C]/40 p-2 flex items-center justify-center gap-2">
                  {defaultColors.map((color) => {
                    const isGreen = color.id === 'green';
                    const size = isGreen ? 48 : 36;
                    return (
                      <div
                        key={color.id}
                        className={`p-1 rounded-lg flex items-center justify-center ${
                          isGreen ? 'hud-slot-active' : 'opacity-95'
                        }`}
                      >
                        <TactileShapeSvg
                          shape={COLOR_SWATCH_SHAPE}
                          color={color}
                          size={size}
                          isActive={isGreen}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Symbolic Key Prompts */}
              <div className="flex items-center justify-between w-full max-w-[230px] mt-5">
                <div className="flex items-center gap-1.5">
                  <FacetedKeycap label="A" />
                  <span className="text-slate-400 font-bold">/</span>
                  <FacetedKeycap label="←" />
                </div>

                <div className="flex items-center gap-1.5">
                  <FacetedKeycap label="D" />
                  <span className="text-slate-400 font-bold">/</span>
                  <FacetedKeycap label="→" />
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Jump & Double Jump */}
          <div className="md:col-span-4 flex flex-col items-center">
            <h3 className="text-2xl font-bold text-white font-display tracking-wider mb-5">
              Jump
            </h3>

            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-end justify-center gap-7">
                {/* Single Jump Wall */}
                <div className="flex flex-col items-center">
                  <div className="relative w-14 h-14 rounded-md bg-[#080B12] border-2 border-[#384766] p-1.5 shadow-lg">
                    <div className="w-full h-full rounded-xs bg-[#182238] border border-white/10" />
                  </div>
                  <div className="mt-3 text-center">
                    <FacetedKeycap label="Space" />
                    <div className="text-sm font-display font-bold tracking-wide text-slate-200 mt-1.5">
                      Jump
                    </div>
                  </div>
                </div>

                {/* Double Jump Wall */}
                <div className="flex flex-col items-center">
                  <div className="relative w-14 h-28 rounded-md bg-[#080B12] border-2 border-[#384766] p-1.5 shadow-lg">
                    <div className="w-full h-full rounded-xs bg-[#182238] border border-white/10" />
                  </div>
                  <div className="mt-3 text-center">
                    <FacetedKeycap label="2× Space" />
                    <div className="text-sm font-display font-bold tracking-wide text-slate-200 mt-1.5">
                      Double Jump
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="pt-4 border-t border-white/15 flex justify-end">
          <FacetedButton
            variant="emerald"
            size="md"
            onClick={() => {
              onClose();
              onStartGame();
            }}
            className="text-lg font-bold whitespace-nowrap shrink-0"
          >
            Start Game
          </FacetedButton>
        </div>
      </FacetedWindow>
    </div>
  );
};
