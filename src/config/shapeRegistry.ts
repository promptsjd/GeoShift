import { Point2D, ShapeDefinition } from './types';

/**
 * Helper to compute regular polygon vertices centered at (cx, cy)
 */
function getRegularPolygonPoints(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  rotationRad = -Math.PI / 2
): Point2D[] {
  const points: Point2D[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = rotationRad + (i * 2 * Math.PI) / sides;
    points.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  }
  return points;
}

/**
 * Helper to compute 5-point or N-point star vertices centered at (cx, cy)
 */
function getStarPoints(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  pointsCount = 5,
  rotationRad = -Math.PI / 2
): Point2D[] {
  const vertices: Point2D[] = [];
  const step = Math.PI / pointsCount;
  for (let i = 0; i < pointsCount * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = rotationRad + i * step;
    vertices.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    });
  }
  return vertices;
}

function pointsToSvgPath(points: Point2D[]): string {
  if (points.length === 0) return '';
  return (
    points
      .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`)
      .join(' ') + ' Z'
  );
}

function drawPolygonOnCanvas(ctx: CanvasRenderingContext2D, points: Point2D[]): void {
  if (points.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Dedicated Non-Playable Swatch Shape for the Top Color Selector.
 * Requirement: "The shape of the colors will remain consistent and we will pick a shape that is not in the shape list."
 */
export const COLOR_SWATCH_SHAPE: ShapeDefinition = {
  id: 'rounded-square',
  name: 'Rounded Square (Color Swatch)',
  isPlayable: false,
  enabledByDefault: true,
  drawCanvas: (ctx, cx, cy, radius) => {
    const size = radius * 1.75;
    const half = size / 2;
    const corner = size * 0.22;
    ctx.beginPath();
    ctx.roundRect(cx - half, cy - half, size, size, corner);
    ctx.fill();
  },
  getSvgPath: (size) => {
    const pad = size * 0.12;
    const w = size - pad * 2;
    const r = w * 0.22;
    const x = pad;
    const y = pad;
    return `M ${x + r} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + w - r} Q ${x + w} ${y + w} ${x + w - r} ${y + w} H ${x + r} Q ${x} ${y + w} ${x} ${y + w - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
  },
};

/**
 * Playable Shapes Registry
 * Ordered to match the vertical shape carousel in the specification:
 * Triangle, Diamond, Circle, Pentagon, Star — plus optional expandable shapes.
 */
export const SHAPE_REGISTRY: ShapeDefinition[] = [
  {
    id: 'triangle',
    name: 'Triangle',
    isPlayable: true,
    enabledByDefault: true,
    drawCanvas: (ctx, cx, cy, radius) => {
      // Slightly offset cy downward so the visual centroid feels balanced
      const pts: Point2D[] = [
        { x: cx, y: cy - radius * 0.95 },
        { x: cx + radius * 0.95, y: cy + radius * 0.85 },
        { x: cx - radius * 0.95, y: cy + radius * 0.85 },
      ];
      drawPolygonOnCanvas(ctx, pts);
    },
    getSvgPath: (size) => {
      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.4;
      return pointsToSvgPath([
        { x: cx, y: cy - r * 0.95 },
        { x: cx + r * 0.95, y: cy + r * 0.85 },
        { x: cx - r * 0.95, y: cy + r * 0.85 },
      ]);
    },
  },
  {
    id: 'diamond',
    name: 'Diamond',
    isPlayable: true,
    enabledByDefault: true,
    drawCanvas: (ctx, cx, cy, radius) => {
      const pts: Point2D[] = [
        { x: cx, y: cy - radius * 1.02 },
        { x: cx + radius * 0.72, y: cy },
        { x: cx, y: cy + radius * 1.02 },
        { x: cx - radius * 0.72, y: cy },
      ];
      drawPolygonOnCanvas(ctx, pts);
    },
    getSvgPath: (size) => {
      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.4;
      return pointsToSvgPath([
        { x: cx, y: cy - r * 1.02 },
        { x: cx + r * 0.72, y: cy },
        { x: cx, y: cy + r * 1.02 },
        { x: cx - r * 0.72, y: cy },
      ]);
    },
  },
  {
    id: 'circle',
    name: 'Circle',
    isPlayable: true,
    enabledByDefault: true,
    drawCanvas: (ctx, cx, cy, radius) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.92, 0, Math.PI * 2);
      ctx.fill();
    },
    getSvgPath: (size) => {
      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.38;
      return `M ${cx - r}, ${cy} a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`;
    },
  },
  {
    id: 'pentagon',
    name: 'Pentagon',
    isPlayable: true,
    enabledByDefault: true,
    drawCanvas: (ctx, cx, cy, radius) => {
      const pts = getRegularPolygonPoints(cx, cy + radius * 0.05, radius * 0.96, 5);
      drawPolygonOnCanvas(ctx, pts);
    },
    getSvgPath: (size) => {
      const cx = size / 2;
      const cy = size / 2 + size * 0.02;
      const r = size * 0.4;
      return pointsToSvgPath(getRegularPolygonPoints(cx, cy, r, 5));
    },
  },
  {
    id: 'star',
    name: 'Star',
    isPlayable: true,
    enabledByDefault: true,
    drawCanvas: (ctx, cx, cy, radius) => {
      const pts = getStarPoints(cx, cy + radius * 0.04, radius * 1.04, radius * 0.42, 5);
      drawPolygonOnCanvas(ctx, pts);
    },
    getSvgPath: (size) => {
      const cx = size / 2;
      const cy = size / 2 + size * 0.02;
      const r = size * 0.42;
      return pointsToSvgPath(getStarPoints(cx, cy, r, r * 0.4, 5));
    },
  },
  {
    id: 'hexagon',
    name: 'Hexagon',
    isPlayable: true,
    enabledByDefault: false,
    drawCanvas: (ctx, cx, cy, radius) => {
      const pts = getRegularPolygonPoints(cx, cy, radius * 0.95, 6, 0);
      drawPolygonOnCanvas(ctx, pts);
    },
    getSvgPath: (size) => {
      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.4;
      return pointsToSvgPath(getRegularPolygonPoints(cx, cy, r, 6, 0));
    },
  },
];

export function getActiveShapes(enabledIds?: string[]): ShapeDefinition[] {
  const playable = SHAPE_REGISTRY.filter((s) => s.isPlayable);
  if (enabledIds && enabledIds.length >= 2) {
    const filtered = playable.filter((s) => enabledIds.includes(s.id));
    if (filtered.length >= 2) return filtered;
  }
  return playable.filter((s) => s.enabledByDefault);
}

export function getShapeById(id: string): ShapeDefinition {
  if (id === COLOR_SWATCH_SHAPE.id) return COLOR_SWATCH_SHAPE;
  return SHAPE_REGISTRY.find((s) => s.id === id) || SHAPE_REGISTRY[0];
}
