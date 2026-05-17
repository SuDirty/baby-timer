export const DEFAULT_MINUTES = 10;
export const MIN_MINUTES = 1;
export const MAX_MINUTES = 180;
export const IDLE_TIMEOUT_MS = 30000;

export const SVG_CENTER = { x: 160, y: 160 };
export const BASE_RADIUS = 120;
export const RING_GAP = 18;
export const OUTER_STROKE_WIDTH = 12;
export const SECOND_RING_RADIUS = 75;
export const SECOND_RING_STROKE_WIDTH = 6;

export const HOUR_COLORS = ['#FCD34D', '#F472B6', '#60A5FA', '#34D399', '#A78BFA'];

export const clampMinutes = (value) => {
  const minutes = Number.parseInt(value, 10);
  if (!Number.isFinite(minutes)) return DEFAULT_MINUTES;
  return Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, minutes));
};
