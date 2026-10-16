export function msToKmh(ms: number): number {
  return Math.round(ms * 3.6);
}

export function kmhToMs(kmh: number): number {
  return kmh / 3.6;
}

export function isValidSpeed(speedMs: number | null): boolean {
  if (speedMs === null || speedMs === undefined) return false;
  if (speedMs < 0) return false;
  if (!Number.isFinite(speedMs)) return false;
  return true;
}
