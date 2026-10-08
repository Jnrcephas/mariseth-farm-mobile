/**
 * Small, dependency-free geometry helpers for farm boundaries.
 *
 * Farms are small (metres to a few kilometres across), so instead of full
 * spherical geometry we project the points onto a flat plane in metres
 * around the polygon's own centre (an "equirectangular" projection) and do
 * the maths there. At farm scale the error is far smaller than the GPS error
 * itself.
 */

export type LatLng = { latitude: number; longitude: number };

const EARTH_RADIUS_M = 6371000;
const toRad = (deg: number) => (deg * Math.PI) / 180;

const SQ_M_PER_HECTARE = 10000;
const SQ_M_PER_ACRE = 4046.8564224;

type XY = { x: number; y: number };

/** Lat/lng -> flat x/y in metres, relative to the polygon's centre. */
function projectToMetres(points: LatLng[]): XY[] {
  if (points.length === 0) return [];
  const lat0 =
    points.reduce((sum, p) => sum + p.latitude, 0) / points.length;
  const lng0 =
    points.reduce((sum, p) => sum + p.longitude, 0) / points.length;
  const cosLat0 = Math.cos(toRad(lat0));

  return points.map((p) => ({
    x: toRad(p.longitude - lng0) * cosLat0 * EARTH_RADIUS_M,
    y: toRad(p.latitude - lat0) * EARTH_RADIUS_M,
  }));
}

/**
 * Area enclosed by the points (shoelace formula), in square metres.
 * Returns 0 for fewer than 3 points. For a self-crossing shape the number
 * is not meaningful - check `hasSelfIntersection` first.
 */
export function polygonAreaSqMetres(points: LatLng[]): number {
  if (points.length < 3) return 0;
  const xy = projectToMetres(points);
  let sum = 0;
  for (let i = 0; i < xy.length; i++) {
    const a = xy[i];
    const b = xy[(i + 1) % xy.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

export const sqMetresToHectares = (sqm: number) => sqm / SQ_M_PER_HECTARE;
export const sqMetresToAcres = (sqm: number) => sqm / SQ_M_PER_ACRE;

/** Cross product sign of (b - a) x (c - a): >0 left turn, <0 right, 0 collinear. */
function orientation(a: XY, b: XY, c: XY) {
  const value = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  if (Math.abs(value) < 1e-9) return 0;
  return value > 0 ? 1 : -1;
}

function onSegment(a: XY, b: XY, c: XY) {
  // Assumes a, b, c are collinear: is c within the box spanned by a and b?
  return (
    Math.min(a.x, b.x) <= c.x &&
    c.x <= Math.max(a.x, b.x) &&
    Math.min(a.y, b.y) <= c.y &&
    c.y <= Math.max(a.y, b.y)
  );
}

function segmentsIntersect(p1: XY, p2: XY, p3: XY, p4: XY) {
  const o1 = orientation(p1, p2, p3);
  const o2 = orientation(p1, p2, p4);
  const o3 = orientation(p3, p4, p1);
  const o4 = orientation(p3, p4, p2);

  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && onSegment(p1, p2, p3)) return true;
  if (o2 === 0 && onSegment(p1, p2, p4)) return true;
  if (o3 === 0 && onSegment(p3, p4, p1)) return true;
  if (o4 === 0 && onSegment(p3, p4, p2)) return true;
  return false;
}

/**
 * True when any two edges of the closed shape cross each other (a "bow-tie"
 * or figure-8). Edges that merely share a corner with their neighbour are
 * fine. A triangle can never cross itself, so fewer than 4 points is false.
 */
export function hasSelfIntersection(points: LatLng[]): boolean {
  const n = points.length;
  if (n < 4) return false;
  const xy = projectToMetres(points);

  for (let i = 0; i < n; i++) {
    const a1 = xy[i];
    const a2 = xy[(i + 1) % n];
    for (let j = i + 1; j < n; j++) {
      // Skip edges that touch edge i at a shared corner.
      const isNeighbour = j === i + 1 || (i === 0 && j === n - 1);
      if (isNeighbour) continue;
      const b1 = xy[j];
      const b2 = xy[(j + 1) % n];
      if (segmentsIntersect(a1, a2, b1, b2)) return true;
    }
  }
  return false;
}

/** "1.23" - up to 2 decimals, no trailing zeros, never "0.00" for tiny areas. */
export function formatNumber(value: number): string {
  if (value === 0) return "0";
  if (value < 0.01) return "<0.01";
  return String(Math.round(value * 100) / 100);
}
