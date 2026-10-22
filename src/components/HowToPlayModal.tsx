import React from 'react';
import { COLOR_REGISTRY } from '../config/colorRegistry';
import { COLOR_SWATCH_SHAPE, SHAPE_REGISTRY } from '../config/shapeRegistry';

interface HowToPlayModalProps {
  onClose: () => void;
  onStartGame: () => void;
}

/**
 * Visual, At-a-Glance Rules & Controls Modal
 * Uses actual vector shapes, color swatches, and wall silhouettes on the
 * signature deep indigo-slate surface (#242058) so players understand the
 * controls in a single glance.
 */
export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  onClose,
  onStartGame,
}) => {
  const defaultShapes = SHAPE_REGISTRY.filter(
    (s) => s.isPlayable && s.enabledByDefault
  );
  const defaultColors = COLOR_REGISTRY.filter((c) => c.enabledByDefault);
  const emeraldHex =
    defaultColors.find((c) => c.id === 'green')?.hex || '#166E3D';

  const swatchCenterPath = COLOR_SWATCH_SHAPE.getSvgPath(50);
  const swatchSidePath = COLOR_SWATCH_SHAPE.getSvgPath(34);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/82 backdrop-blur-xs p-6">
      <div className="w-full max-w-4xl rounded-2xl bg-[#242058] border border-slate-700/70 p-8 shadow-2xl text-slate-100">
        {/* Header & 1-Line Gameplay Summary */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white font-display">
              How to Play
            </h2>
            <p className="text-sm text-slate-200/90 mt-1.5">
              Match the approaching gate’s shape, color, and jump height before reaching the wall.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-[#07080D]/60 hover:bg-[#07080D] border border-slate-700/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Close
          </button>
        </div>

        {/* 3-Column Visual Diagram: Shape | Color | Jump */}
        <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 my-8 pt-6 border-t border-white/10">
          {/* Column 1: Switch Shape */}
          <div className="md:col-span-4 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-white font-display mb-4">
              Shape
            </h3>

            <div className="flex items-center gap-5">
              {/* Vertical stack of the 5 playable shapes in Emerald Green */}
              <div className="flex flex-col items-center gap-2.5">
                {defaultShapes.map((shape) => {
                  const isCircle = shape.id === 'circle';
                  const size = isCircle ? 58 : 34;
                  return (
                    <svg
                      key={shape.id}
                      width={size}
                      height={size}
                      viewBox={`0 0 ${size} ${size}`}
                      className="overflow-visible"
                    >
                      <path
                        d={shape.getSvgPath(size)}
                        fill={emeraldHex}
                        strokeLinejoin="round"
                      />
                    </svg>
                  );
                })}
              </div>

              {/* Symbolic Key Prompts */}
              <div className="flex flex-col gap-3 text-xs font-mono-tabular text-slate-100">
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 rounded bg-[#07080D]/80 border border-white/15 font-semibold">
                    W
                  </kbd>
                  <span className="text-slate-400">/</span>
                  <kbd className="px-2 py-1 rounded bg-[#07080D]/80 border border-white/15 font-semibold">
                    ↑
                  </kbd>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 rounded bg-[#07080D]/80 border border-white/15 font-semibold">
                    S
                  </kbd>
                  <span className="text-slate-400">/</span>
                  <kbd className="px-2 py-1 rounded bg-[#07080D]/80 border border-white/15 font-semibold">
                    ↓
                  </kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Switch Color */}
          <div className="md:col-span-4 flex flex-col items-center md:border-x md:border-white/15 md:px-6 py-4">
            <h3 className="text-lg font-semibold text-white font-display mb-6">
              Color
            </h3>

            {/* Horizontal row of the 5 color swatches */}
            <div className="flex items-center justify-center gap-2.5">
              {defaultColors.map((color) => {
                const isGreen = color.id === 'green';
                const size = isGreen ? 50 : 34;
                const path = isGreen ? swatchCenterPath : swatchSidePath;
                return (
                  <svg
                    key={color.id}
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="overflow-visible shrink-0"
                  >
                    <path d={path} fill={color.hex} />
                  </svg>
                );
              })}
            </div>

            {/* Symbolic Key Prompts */}
            <div className="flex items-center justify-between w-full max-w-[230px] mt-5 text-xs font-mono-tabular text-slate-100">
              <div className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 rounded bg-[#07080D]/80 border border-white/15 font-semibold">
                  A
                </kbd>
                <span className="text-slate-400">/</span>
                <kbd className="px-2 py-1 rounded bg-[#07080D]/80 border border-white/15 font-semibold">
                  ←
                </kbd>
              </div>

              <div className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 rounded bg-[#07080D]/80 border border-white/15 font-semibold">
                  D
                </kbd>
                <span className="text-slate-400">/</span>
                <kbd className="px-2 py-1 rounded bg-[#07080D]/80 border border-white/15 font-semibold">
                  →
                </kbd>
              </div>
            </div>
          </div>

          {/* Column 3: Jump & Double Jump */}
          <div className="md:col-span-4 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-white font-display mb-4">
              Jump
            </h3>

            <div className="flex items-end justify-center gap-7">
              {/* Single Jump Wall */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-[#07080D] border border-white/15" />
                <div className="mt-3 text-center">
                  <kbd className="px-2.5 py-1 text-xs font-mono-tabular font-semibold rounded bg-[#07080D]/80 border border-white/15 text-slate-100">
                    Space
                  </kbd>
                  <div className="text-xs text-slate-200 mt-1.5 font-medium">
                    Jump
                  </div>
                </div>
              </div>

              {/* Double Jump Wall */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-28 bg-[#07080D] border border-white/15" />
                <div className="mt-3 text-center">
                  <kbd className="px-2.5 py-1 text-xs font-mono-tabular font-semibold rounded bg-[#07080D]/80 border border-white/15 text-slate-100">
                    2× Space
                  </kbd>
                  <div className="text-xs text-slate-200 mt-1.5 font-medium">
                    Double Jump
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartGame();
            }}
            className="px-5 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};
