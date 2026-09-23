import { create } from 'zustand';

/**
 * HUD-facing state only. Physics truth lives in the matter-js world; this is
 * sampled from it a few times a second so React never re-renders per frame.
 */
interface GriddleState {
  pieces: number;
  juiceLevel: number;
  avgDoneness: number;
  pouring: boolean;
  /** Marinade ingredients added so far, in recipe order. */
  added: number;
  set: (patch: Partial<Omit<GriddleState, 'set'>>) => void;
}

export const useGriddleStore = create<GriddleState>((set) => ({
  pieces: 0,
  juiceLevel: 1,
  avgDoneness: 0,
  pouring: false,
  added: 0,
  set: (patch) => set(patch),
}));

/** Step 6 stops at medium rare on purpose; past that the note stops applying. */
export function donenessLabel(d: number) {
  if (d < 0.08) return 'Raw';
  if (d < 0.3) return 'Rare';
  if (d < 0.52) return 'Medium rare';
  if (d < 0.74) return 'Medium';
  if (d < 0.93) return 'Medium well';
  return 'Well done';
}
