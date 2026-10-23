import React from 'react';
import { COLOR_REGISTRY, getColorById } from '../config/colorRegistry';
import { COLOR_SWATCH_SHAPE, SHAPE_REGISTRY } from '../config/shapeRegistry';
import {
  FacetedButton,
  FacetedWindow,
  TactileShapeSvg,
} from './TactileUI';

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
  const cyanColor = getColorById('cyan');
  const mutedColor = {
    id: 'muted',
    name: 'Muted',
    hex: '#334155',
    strokeHex: '#64748B',
    innerFacetHex: '#94A3B8',
    innerFacetAlpha: 0.35,
    enabledByDefault: false,
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/84 backdrop-blur-xs p-6">
      <FacetedWindow maxWidthClass="max-w-3xl" className="max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/15">
          <div>
            <h2 className="text-3xl font-bold text-white font-display tracking-wider">
              Modular Engine Registry
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Toggle active colors and playable shapes dynamically—no hardcoded dependencies.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <FacetedButton
              variant="slate"
              size="sm"
              onClick={onResetDefaults}
              className="text-base font-bold whitespace-nowrap shrink-0"
            >
              Reset Defaults
            </FacetedButton>
            <FacetedButton
              variant="emerald"
              size="sm"
              onClick={onClose}
              className="text-base font-bold whitespace-nowrap shrink-0"
            >
              Done
            </FacetedButton>
          </div>
        </div>

        <div className="space-y-6 mt-5">
          {/* 1. Active Colors Registry */}
          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-display tracking-wide text-white">
                01. Color Registry (Minimum 2 Active)
              </h3>
              <span className="text-xs text-slate-300 font-mono-tabular">
                {enabledColorIds.length} active
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              {COLOR_REGISTRY.map((color) => {
                const active = enabledColorIds.includes(color.id);
                return (
                  <FacetedButton
                    key={color.id}
                    variant={active ? 'indigo' : 'slate'}
                    size="sm"
                    onClick={() => onToggleColorId(color.id)}
                  >
                    <div className="w-full flex items-center gap-3 text-left">
                      <TactileShapeSvg
                        shape={COLOR_SWATCH_SHAPE}
                        color={color}
                        size={28}
                        isActive={active}
                      />
                      <div className="min-w-0">
                        <div className="text-base font-bold font-display truncate">
                          {color.name}
                        </div>
                        <div className="text-[11px] font-mono-tabular text-slate-300">
                          {active ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                    </div>
                  </FacetedButton>
                );
              })}
            </div>
          </section>

          {/* 2. Playable Shapes Registry */}
          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-display tracking-wide text-white">
                02. Playable Shape Registry (Minimum 2 Active)
              </h3>
              <span className="text-xs text-slate-300 font-mono-tabular">
                {enabledShapeIds.length} active
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {playableShapes.map((shape) => {
                const active = enabledShapeIds.includes(shape.id);
                return (
                  <FacetedButton
                    key={shape.id}
                    variant={active ? 'indigo' : 'slate'}
                    size="sm"
                    onClick={() => onToggleShapeId(shape.id)}
                  >
                    <div className="w-full flex items-center gap-3 text-left">
                      <TactileShapeSvg
                        shape={shape}
                        color={active ? cyanColor : mutedColor}
                        size={30}
                        isActive={active}
                      />
                      <div className="min-w-0">
                        <div className="text-base font-bold font-display truncate">
                          {shape.name}
                        </div>
                        <div className="text-[11px] font-mono-tabular text-slate-300">
                          {active ? 'Enabled' : 'Optional'}
                        </div>
                      </div>
                    </div>
                  </FacetedButton>
                );
              })}
            </div>
          </section>

          {/* 3. Visual Trajectory Aid */}
          <section className="flex items-center justify-between pt-4 border-t border-white/15">
            <div>
              <h3 className="text-xl font-bold font-display tracking-wide text-white">
                03. Jump Take-Off Floor Markers
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Displays a subtle floor chevron ahead of Middle and Top obstacles indicating where to initiate your jump arc.
              </p>
            </div>
            <FacetedButton
              variant={showJumpGuides ? 'cyan' : 'slate'}
              size="sm"
              onClick={onToggleJumpGuides}
              className="text-base font-bold whitespace-nowrap shrink-0"
            >
              {showJumpGuides ? 'Guides Shown' : 'Guides Hidden'}
            </FacetedButton>
          </section>
        </div>
      </FacetedWindow>
    </div>
  );
};
