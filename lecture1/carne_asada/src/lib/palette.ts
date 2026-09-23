import { clamp, lerp } from './rand';

/** Cast iron, because the meat has to read as hot against something. */
export const IRON = '#211d1c';
export const IRON_EDGE = '#3a3331';
export const IRON_RIDGE = '#151212';

/** Interior of the steak, raw -> medium rare -> overcooked-and-sad. */
const RAW: [number, number, number] = [226, 92, 112];
const MEDIUM: [number, number, number] = [176, 58, 62];
const WELL: [number, number, number] = [110, 62, 42];

/** Crust colour, builds as each side spends time face-down on the iron. */
const PALE: [number, number, number] = [178, 108, 74];
const SEARED: [number, number, number] = [74, 42, 28];

const mix = (a: [number, number, number], b: [number, number, number], t: number) =>
  `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;

export function interiorColor(doneness: number) {
  const d = clamp(doneness, 0, 1);
  return d < 0.5 ? mix(RAW, MEDIUM, d / 0.5) : mix(MEDIUM, WELL, (d - 0.5) / 0.5);
}

export function crustColor(sideDoneness: number) {
  return mix(PALE, SEARED, clamp(sideDoneness, 0, 1));
}

export const JUICE = '#ff9d1c';
export const JUICE_LIGHT = '#ffc95e';
export const JUICE_DEEP = '#e8730b';
