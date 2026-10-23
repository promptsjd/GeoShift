import React from 'react';
import { ColorDefinition, ShapeDefinition } from '../config/types';
import {
  ARENA_VISUAL_CONFIG,
  FacetButtonVariant,
  UI_FACET_VARIANTS,
} from '../config/visualConfig';

/**
 * 1. Unified SVG Shape & Color Swatch Renderer with Inner Facet
 * Guarantees that every shape and color swatch in the carousels, Rules & Controls,
 * Practice Mode cards, and Title Menu displays the exact same outer rim + inner facet
 * geometry as the corridor canvas.
 */
interface TactileShapeSvgProps {
  shape: ShapeDefinition;
  color: ColorDefinition;
  size: number;
  isActive?: boolean;
  className?: string;
}

export const TactileShapeSvg: React.FC<TactileShapeSvgProps> = ({
  shape,
  color,
  size,
  isActive = true,
  className = '',
}) => {
  const path = shape.getSvgPath(size);
  const scale = ARENA_VISUAL_CONFIG.shapeInnerBevelScale; // 0.62
  // Center at (size/2, size/2) with top-left specular bias (-0.036 * size)
  const translate = size * ((1 - scale) / 2 - 0.036);
  const facetAlpha = isActive
    ? color.innerFacetAlpha
    : color.innerFacetAlpha * 0.85;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`overflow-visible shrink-0 ${className}`}
    >
      {/* Outer Shape Body + Rim Stroke */}
      <path
        d={path}
        fill={color.hex}
        stroke={color.strokeHex}
        strokeWidth={isActive ? 2.2 : 1.5}
        strokeLinejoin="round"
      />
      {/* Inner Concentric Facet (Shifted Top-Left like Canvas) */}
      <path
        d={path}
        fill={color.innerFacetHex}
        fillOpacity={facetAlpha}
        transform={`translate(${translate.toFixed(2)}, ${translate.toFixed(2)}) scale(${scale})`}
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * 2. Tactile Inner-Facet Button
 * Brings the game's signature 2-layer inner-facet aesthetic to every interactive button
 * and mode selector card across the application.
 */
interface FacetedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: FacetButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const FacetedButton: React.FC<FacetedButtonProps> = ({
  variant = 'slate',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...rest
}) => {
  const palette = UI_FACET_VARIANTS[variant];

  const sizePadding =
    size === 'lg'
      ? 'px-6 py-4 rounded-xl'
      : size === 'sm'
      ? 'px-3.5 py-1.5 rounded-lg'
      : 'px-4 py-2.5 rounded-xl';

  const innerInset =
    size === 'lg'
      ? 'top-[4px] left-[4px] right-[9px] bottom-[9px] rounded-lg'
      : size === 'sm'
      ? 'top-[2.5px] left-[2.5px] right-[5.5px] bottom-[5.5px] rounded-md'
      : 'top-[3px] left-[3px] right-[7px] bottom-[7px] rounded-lg';

  return (
    <button
      type="button"
      style={{
        backgroundColor: palette.outerBg,
        borderColor: palette.outerBorder,
        color: palette.textHex,
      }}
      className={`relative group overflow-hidden border-2 font-display tracking-wide transition-transform duration-150 ease-out active:scale-[0.98] hover:brightness-110 cursor-pointer select-none shadow-[0_10px_24px_-6px_rgba(0,0,0,0.75)] focus-visible:outline-2 focus-visible:outline-sky-400 ${sizePadding} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...rest}
    >
      {/* Signature Offset Inner Facet Layer */}
      <span
        aria-hidden="true"
        style={{
          backgroundColor: palette.innerFacetBg,
          opacity: palette.innerFacetAlpha,
        }}
        className={`pointer-events-none absolute ${innerInset} transition-opacity duration-150 group-hover:opacity-45`}
      />
      {/* Content Layer */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};

/**
 * 3. Tactile Inner-Facet Window Frame
 * Houses all overlays and modals inside an outer structural monolith shell
 * with a distinct offset inner-facet chamber.
 */
interface FacetedWindowProps {
  children: React.ReactNode;
  maxWidthClass?: string;
  className?: string;
}

export const FacetedWindow: React.FC<FacetedWindowProps> = ({
  children,
  maxWidthClass = 'max-w-lg',
  className = '',
}) => {
  return (
    <div
      className={`relative w-full ${maxWidthClass} rounded-2xl bg-[#0B0F1A] border-2 border-[#384766] p-2.5 shadow-[0_28px_64px_-12px_rgba(0,0,0,0.9)] ${className}`}
    >
      {/* Offset Inner Facet Chamber */}
      <div className="relative rounded-xl bg-[#151B2E] border border-[#4F638C]/45 p-6 shadow-inner overflow-hidden">
        {/* Subtle inner top-left facet plate */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-2 left-2 right-4 bottom-4 rounded-lg bg-[#242E4C]/35 border border-white/5"
        />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
};

/**
 * 4. Tactile Inner-Facet Keycap Badge (for Rules & Controls and Prompts)
 */
interface FacetedKeycapProps {
  label: string;
}

export const FacetedKeycap: React.FC<FacetedKeycapProps> = ({ label }) => {
  return (
    <kbd className="relative inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-[#111827] border-2 border-[#475569] font-display text-sm font-bold tracking-wider text-white shadow-[0_3px_0_0_#06080E]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-[2px] left-[2px] right-[5px] bottom-[5px] rounded bg-[#64748B]/35"
      />
      <span className="relative z-10 whitespace-nowrap">{label}</span>
    </kbd>
  );
};

/**
 * 5. Geometric Triad Lives Indicator (Triangle in Cyan, Circle in Green, Star in Yellow)
 * Uses the exact 3 shapes and 3 colors from the Main Menu emblem.
 * Dims each shape progressively as the player loses lives.
 */
interface GeometricLivesTriadProps {
  livesRemaining: number;
  maxLives?: number;
  triadShapes: Array<{
    id: string;
    shape: ShapeDefinition;
    color: ColorDefinition;
  }>;
  size?: number;
}

export const GeometricLivesTriad: React.FC<GeometricLivesTriadProps> = ({
  livesRemaining,
  maxLives = 3,
  triadShapes,
  size = 24,
}) => {
  return (
    <div
      className="inline-flex items-center gap-2.5"
      aria-label={`Lives remaining: ${livesRemaining} of ${maxLives}`}
    >
      {triadShapes.slice(0, maxLives).map((item, idx) => {
        const isAlive = idx < livesRemaining;
        return (
          <div
            key={item.id}
            className={`transition-all duration-200 flex items-center justify-center ${
              isAlive
                ? 'opacity-100 scale-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.22)]'
                : 'opacity-20 grayscale scale-85'
            }`}
            title={isAlive ? `Life ${idx + 1}: Active` : `Life ${idx + 1}: Lost`}
          >
            <TactileShapeSvg
              shape={item.shape}
              color={item.color}
              size={idx === 1 ? Math.round(size * 1.15) : size}
              isActive={isAlive}
            />
          </div>
        );
      })}
    </div>
  );
};
