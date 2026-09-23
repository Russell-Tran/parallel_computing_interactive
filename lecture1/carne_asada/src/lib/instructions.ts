/**
 * The seven instructions from CS149 Lecture 1, slide 27 — verbatim.
 *
 * `deps` is what the recipe genuinely requires, not what the numbering implies.
 * Step 4 is the interesting one: preheating the grill depends on nothing, so it
 * is the only instruction in the whole program that can be issued concurrently.
 * `minutes` is the wall-clock cost of the step, which is what makes the point:
 * step 3 alone is 73% of the program.
 */
export interface Instruction {
  id: number;
  short: string;
  text: string;
  minutes: number;
  deps: number[];
  phase: 'marinade' | 'heat' | 'cook' | 'serve';
}

export const INSTRUCTIONS: Instruction[] = [
  {
    id: 1,
    short: 'Combine the marinade',
    text: 'In a large mixing bowl combine orange juice, olive oil, cilantro, lime juice, lemon juice, white wine vinegar, cumin, salt and pepper, jalapeno, and garlic; whisk until well combined.',
    minutes: 5,
    deps: [],
    phase: 'marinade',
  },
  {
    id: 2,
    short: 'Reserve ⅓ cup',
    text: 'Reserve ⅓ cup of the marinade; cover the rest and refrigerate.',
    minutes: 2,
    deps: [1],
    phase: 'marinade',
  },
  {
    id: 3,
    short: 'Marinate the steak',
    text: 'Combine remaining marinade and steak in a large resealable freezer bag; seal and refrigerate for at least 2 hours, or overnight.',
    minutes: 120,
    deps: [2],
    phase: 'marinade',
  },
  {
    id: 4,
    short: 'Preheat grill to HIGH',
    text: 'Preheat grill to HIGH heat.',
    minutes: 10,
    deps: [],
    phase: 'heat',
  },
  {
    id: 5,
    short: 'Pat the steak dry',
    text: 'Remove steak from marinade and lightly pat dry with paper towels.',
    minutes: 2,
    deps: [3],
    phase: 'cook',
  },
  {
    id: 6,
    short: 'Grill, 6–8 min per side',
    text: "Add steak to the preheated grill and cook for another 6 to 8 minutes per side, or until desired doneness. Note that flank steak tastes best when cooked to rare or medium rare because it's a lean cut of steak.",
    minutes: 14,
    deps: [4, 5],
    phase: 'cook',
  },
  {
    id: 7,
    short: 'Rest, slice, serve',
    text: 'Remove from heat and let rest for 10 minutes. Thinly slice steak against the grain, garnish with reserved cilantro mixture, and serve.',
    minutes: 12,
    deps: [6],
    phase: 'serve',
  },
];

export const byId = (id: number) => INSTRUCTIONS.find((i) => i.id === id)!;

export const SEQUENTIAL_MINUTES = INSTRUCTIONS.reduce((n, i) => n + i.minutes, 0);

export interface Schedule {
  /** Finish time per instruction id, in minutes. */
  finish: Map<number, number>;
  makespan: number;
  /** True when the placed order can never satisfy its own dependencies. */
  stalled: boolean;
  stalledOn: number[];
}

/**
 * Two in-order lanes, each running its list top to bottom. An instruction
 * issues when its lane reaches it AND every dependency has retired — the same
 * rule a scoreboard uses to decide whether an instruction can be dispatched.
 */
export function schedule(lanes: number[][]): Schedule {
  const finish = new Map<number, number>();
  const cursor = lanes.map(() => 0);
  const laneTime = lanes.map(() => 0);
  const remaining = lanes.reduce((n, l) => n + l.length, 0);
  let done = 0;

  for (;;) {
    let progressed = false;
    for (let l = 0; l < lanes.length; l++) {
      const id = lanes[l][cursor[l]];
      if (id === undefined) continue;
      const deps = byId(id).deps;
      if (!deps.every((d) => finish.has(d))) continue;
      const ready = Math.max(laneTime[l], ...deps.map((d) => finish.get(d)!), 0);
      const end = ready + byId(id).minutes;
      finish.set(id, end);
      laneTime[l] = end;
      cursor[l]++;
      done++;
      progressed = true;
    }
    if (!progressed) break;
  }

  const stalledOn = lanes.flatMap((lane, l) => lane.slice(cursor[l]));
  return {
    finish,
    makespan: Math.max(0, ...laneTime),
    stalled: done < remaining,
    stalledOn,
  };
}

export const fmt = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`);
