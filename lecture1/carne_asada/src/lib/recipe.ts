/**
 * The marinade exactly as step 1 reads on CS149 Lecture 1, slide 27:
 *
 *   "In a large mixing bowl combine orange juice, olive oil, cilantro, lime
 *    juice, lemon juice, white wine vinegar, cumin, salt and pepper, jalapeno,
 *    and garlic; whisk until well combined."
 *
 * Order here is the order on the slide. Nothing in this list is invented and
 * nothing is added at random — ingredients enter the scene in recipe order.
 */
export type Form = 'pitcher' | 'bottle' | 'citrus' | 'shaker' | 'chile' | 'bulb' | 'herbs';

export interface Ingredient {
  id: string;
  label: string;
  form: Form;
  w: number;
  h: number;
  /** Primary body colour. */
  fill: string;
  /** Secondary: cap, rind, leaf, or label band. */
  accent: string;
}

export const INGREDIENTS: Ingredient[] = [
  { id: 'orange-juice',       label: 'Orange juice',       form: 'pitcher', w: 104, h: 132, fill: '#ff9d1c', accent: '#e8730b' },
  { id: 'olive-oil',          label: 'Olive oil',          form: 'bottle',  w: 46,  h: 116, fill: '#9aa832', accent: '#2f3b16' },
  { id: 'cilantro',           label: 'Cilantro',           form: 'herbs',   w: 84,  h: 62,  fill: '#4c8f34', accent: '#7ec05a' },
  { id: 'lime-juice',         label: 'Lime juice',         form: 'citrus',  w: 58,  h: 58,  fill: '#b7d84a', accent: '#5d8f22' },
  { id: 'lemon-juice',        label: 'Lemon juice',        form: 'citrus',  w: 60,  h: 60,  fill: '#f7d94a', accent: '#c9a316' },
  { id: 'white-wine-vinegar', label: 'White wine vinegar', form: 'bottle',  w: 44,  h: 122, fill: '#e6d9a8', accent: '#6f5a2c' },
  { id: 'cumin',              label: 'Cumin',              form: 'shaker',  w: 40,  h: 62,  fill: '#a4652c', accent: '#d8c4a6' },
  { id: 'salt',               label: 'Salt',               form: 'shaker',  w: 38,  h: 60,  fill: '#f2ece3', accent: '#c9bbaa' },
  { id: 'pepper',             label: 'Pepper',             form: 'shaker',  w: 38,  h: 60,  fill: '#4a3f38', accent: '#c9bbaa' },
  { id: 'jalapeno',           label: 'Jalapeno',           form: 'chile',   w: 74,  h: 30,  fill: '#3f8a2b', accent: '#2c5f1d' },
  { id: 'garlic',             label: 'Garlic',             form: 'bulb',    w: 56,  h: 54,  fill: '#f3ece0', accent: '#cbbda6' },
];

/** Everything after the pitcher; the pitcher is always on the griddle. */
export const MARINADE = INGREDIENTS.filter((i) => i.form !== 'pitcher');

/** Step 6's note, which is why the doneness meter stops where it does. */
export const DONENESS_NOTE =
  'Flank steak tastes best cooked to rare or medium rare because it is a lean cut of steak.';
