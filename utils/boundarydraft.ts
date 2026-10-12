import { MMKV } from "react-native-mmkv";
import type { LatLng } from "./geometry";

/**
 * Keeps a farm's boundary points on the phone while the farmer is still
 * working on them, so walking to the next corner, locking the phone, a call
 * coming in or the app being closed does not lose the points already marked.
 *
 * It is only a safety net for the boundary: the rest of the farm form is not
 * saved. The draft is deleted as soon as the farm is saved successfully.
 */

const storage = new MMKV({ id: "farm-boundary-drafts" });

export type DraftPoint = LatLng & { accuracy?: number };
export type BoundaryDraft = { points: DraftPoint[]; savedAt: number };

/** One draft for "add a farm", and one per farm being edited. */
export const boundaryDraftKey = (farmId?: number | string | null) =>
  farmId != null && farmId !== "" ? `edit:${farmId}` : "new";

export function loadBoundaryDraft(key: string): BoundaryDraft | null {
  try {
    const raw = storage.getString(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.points)) return null;
    return parsed as BoundaryDraft;
  } catch {
    return null;
  }
}

export function saveBoundaryDraft(key: string, points: DraftPoint[]) {
  try {
    if (points.length === 0) {
      storage.delete(key);
      return;
    }
    const draft: BoundaryDraft = { points, savedAt: Date.now() };
    storage.set(key, JSON.stringify(draft));
  } catch {
    /* a failed backup must never break the form */
  }
}

export function clearBoundaryDraft(key: string) {
  try {
    storage.delete(key);
  } catch {
    /* ignore */
  }
}

/** Same corners (to ~1 cm), ignoring accuracy. */
export function samePoints(a: DraftPoint[], b: DraftPoint[]) {
  if (a.length !== b.length) return false;
  return a.every(
    (p, i) =>
      Math.abs(p.latitude - b[i].latitude) < 1e-7 &&
      Math.abs(p.longitude - b[i].longitude) < 1e-7
  );
}
