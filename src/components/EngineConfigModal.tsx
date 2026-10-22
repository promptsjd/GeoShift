import React from 'react';
import { COLOR_REGISTRY } from '../config/colorRegistry';
import { COLOR_SWATCH_SHAPE, SHAPE_REGISTRY } from '../config/shapeRegistry';

interface EngineConfigModalProps {
  enabledColorIds: string[];
  enabledShapeIds: string[];
  showJumpGuides: boolean;
  onToggleColorId: (id: string) => void;
  onToggleShapeId: (id: string) => void;
  onToggleJumpGuides: () => void;
  onResetDefaults: () => void;
  onClose: () => void;
}

/**
 * Modular Registry Inspector & Customizer
 * Demonstrates strict separation of concerns: adding or toggling shapes or colors
 * updates the carousels, spawner, practice modes, and collision engine automatically.
 */
export const EngineConfigModal: React.FC<EngineConfigModalProps> = ({
  enabledColorIds,
  enabledShapeIds,
  showJumpGuides,
  onToggleColorId,
  onToggleShapeId,
  onToggleJumpGuides,
  onResetDefaults,
  onClose,
}) => {
  const playableShapes = SHAPE_REGISTRY.filter((s) => s.isPlayable);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-xs p-6">
      <div className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 font-display">
              Modular Engine Registry
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Toggle active colors and playable shapes dynamically—no hardcoded dependencies.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onResetDefaults}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Reset Defaults
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-slate-100 hover:bg-white rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Done
            </button>
          </div>
        </div>

        <div className="space-y-8 mt-6">
          {/* 1. Active Colors Registry */}
          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">
                01. Color Registry (Minimum 2 Active · Uses Dedicated {COLOR_SWATCH_SHAPE.name})
              </h3>
              <span className="text-xs text-slate-400 font-mono-tabular">
                {enabledColorIds.length} active
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              {COLOR_REGISTRY.map((color) => {
                const active = enabledColorIds.includes(color.id);
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => onToggleColorId(color.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      active
                        ? 'bg-slate-800/90 border-slate-600 text-slate-100'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <svg width={24} height={24} viewBox="0 0 24 24" className="shrink-0">
                      <path
                        d={COLOR_SWATCH_SHAPE.getSvgPath(24)}
                        fill={color.hex}
                      />
                    </svg>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">
                        {color.name}
                      </div>
                      <div className="text-[11px] font-mono-tabular text-slate-400">
                        {active ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. Playable Shapes Registry */}
          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">
                02. Playable Shape Registry (Minimum 2 Active)
              </h3>
              <span className="text-xs text-slate-400 font-mono-tabular">
                {enabledShapeIds.length} active
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {playableShapes.map((shape) => {
                const active = enabledShapeIds.includes(shape.id);
                return (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() => onToggleShapeId(shape.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      active
                        ? 'bg-slate-800/90 border-slate-600 text-slate-100'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <svg width={28} height={28} viewBox="0 0 28 28" className="shrink-0">
                      <path
                        d={shape.getSvgPath(28)}
                        fill={active ? '#38BDF8' : '#475569'}
                      />
                    </svg>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">
                        {shape.name}
                      </div>
                      <div className="text-[11px] font-mono-tabular text-slate-400">
                        {active ? 'Enabled' : 'Optional Expansion'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. Visual Trajectory Aid */}
          <section className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                03. Jump Take-Off Floor Markers
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Displays a subtle floor chevron ahead of Middle and Top obstacles indicating where to initiate your jump arc.
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleJumpGuides}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                showJumpGuides
                  ? 'bg-sky-400 text-slate-950'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {showJumpGuides ? 'Guides Shown' : 'Guides Hidden'}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
