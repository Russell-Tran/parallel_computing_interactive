import Matter from 'matter-js';
import { mulberry32 } from '../lib/rand';
import type { Instruction } from '../lib/instructions';
import { INGREDIENTS, type Ingredient } from '../lib/recipe';
import { TOKEN_H, TOKEN_W } from '../render/drawToken';
import { SPIN_RESIST, STAGE } from './world';

export interface Fleck {
  x: number;
  y: number;
  r: number;
  hue: number;
}

export interface MeatMeta {
  kind: 'meat';
  seed: number;
  w: number;
  h: number;
  /** Crust built on each face. Slide 27: "6 to 8 minutes per side." */
  sideA: number;
  sideB: number;
  flecks: Fleck[];
  wobble: number;
}

export interface PitcherMeta {
  kind: 'pitcher';
  level: number;
  w: number;
  h: number;
}

export interface IngredientMeta {
  kind: 'ingredient';
  def: Ingredient;
}

export interface TokenMeta {
  kind: 'token';
  ins: Instruction;
}

export type Meta = MeatMeta | PitcherMeta | IngredientMeta | TokenMeta;
export const metaOf = (b: Matter.Body) => (b.plugin as { meta?: Meta }).meta;

/**
 * Everything in this world is deliberately heavy-feeling: it resists rotation,
 * barely rebounds, and sheds momentum quickly. Raising inertia is what stops
 * the barrel rolls — damping alone just makes things feel like they are
 * falling through syrup.
 */
function giveHeft(body: Matter.Body, resist = SPIN_RESIST): Matter.Body {
  Matter.Body.setInertia(body, body.inertia * resist);
  return body;
}

let seedCounter = 1;

export function createMeatPiece(x: number, y: number): Matter.Body {
  const seed = seedCounter++ * 2654435761;
  const rnd = mulberry32(seed);
  const w = 86 + rnd() * 54;
  const h = 30 + rnd() * 14;

  const body = Matter.Bodies.rectangle(x, y, w, h, {
    chamfer: { radius: Math.min(h / 2 - 2, 12) },
    restitution: 0.07,
    friction: 0.82,
    frictionAir: 0.022,
    density: 0.0024,
    angle: (rnd() - 0.5) * 0.9,
    label: 'meat',
  });

  // Step 7: "garnish with reserved cilantro mixture" — specks fixed in local space.
  const flecks: Fleck[] = [];
  const fleckCount = 7 + Math.floor(rnd() * 7);
  for (let i = 0; i < fleckCount; i++) {
    flecks.push({
      x: (rnd() - 0.5) * (w - 16),
      y: (rnd() - 0.5) * (h - 10),
      r: 1.3 + rnd() * 2.1,
      hue: 78 + rnd() * 46,
    });
  }

  const meta: MeatMeta = { kind: 'meat', seed, w, h, sideA: 0, sideB: 0, flecks, wobble: 0 };
  body.plugin = { meta };
  return giveHeft(body);
}

export function createPitcher(): Matter.Body {
  const def = INGREDIENTS[0];
  const w = def.w;
  const h = def.h;
  const body = Matter.Bodies.rectangle(800, 90, w, h, {
    chamfer: { radius: 14 },
    restitution: 0.03,
    friction: 0.95,
    frictionAir: 0.026,
    // The jug is ~3x the area of a steak; at the old 0.004 it massed ~49 against
    // a piece's ~6.5 and the mouse constraint could barely shift it on a phone.
    density: 0.0012,
    label: 'pitcher',
  });
  const meta: PitcherMeta = { kind: 'pitcher', level: 1, w, h };
  body.plugin = { meta };
  return giveHeft(body);
}

/**
 * One body per marinade ingredient. Shape follows the ingredient's form so a
 * lime rolls and a bottle topples; nothing here is randomised.
 */
export function createIngredient(def: Ingredient, x: number, y: number): Matter.Body {
  const round = def.form === 'citrus' || def.form === 'bulb';
  const opts: Matter.IBodyDefinition = {
    restitution: round ? 0.16 : 0.05,
    friction: 0.74,
    frictionAir: 0.024,
    density: 0.0019,
    label: 'ingredient',
  };
  const body = giveHeft(round
    ? Matter.Bodies.circle(x, y, def.w / 2, opts)
    : Matter.Bodies.rectangle(x, y, def.w, def.h, { ...opts, chamfer: { radius: 8 } }));

  const meta: IngredientMeta = { kind: 'ingredient', def };
  body.plugin = { meta };
  return body;
}

/** Local-space spout position, rotated into world space. */
export function spoutPoint(jug: Matter.Body, meta: PitcherMeta) {
  const lx = meta.w / 2 + 10;
  const ly = -meta.h / 2 - 8;
  const cos = Math.cos(jug.angle);
  const sin = Math.sin(jug.angle);
  return {
    x: jug.position.x + lx * cos - ly * sin,
    y: jug.position.y + lx * sin + ly * cos,
  };
}

/** Instruction tokens are solid slabs: they land and stay put, like the rest. */
export function createInstructionToken(ins: Instruction, x: number, y: number): Matter.Body {
  const body = Matter.Bodies.rectangle(x, y, TOKEN_W, TOKEN_H, {
    chamfer: { radius: 8 },
    restitution: 0.1,
    friction: 0.72,
    // Livelier than the food: the linked script should visibly flex.
    frictionAir: 0.016,
    density: 0.0017,
    angle: 0,
    label: 'token',
  });
  const meta: TokenMeta = { kind: 'token', ins };
  body.plugin = { meta };
  return giveHeft(body, 1.9);
}

const COOK_RATE = 0.0022;

/**
 * A piece only browns while it is actually resting on the iron, and only on
 * the face that is touching it — so flipping a steak matters.
 */
export function cookStep(body: Matter.Body, meta: MeatMeta) {
  const settled = body.speed < 0.7 && Math.abs(body.angularVelocity) < 0.05;
  const onIron = body.position.y > STAGE.floorY - meta.h * 1.4;
  meta.wobble *= 0.9;
  if (!settled || !onIron) return;

  // Local +y points screen-down when cos(angle) > 0, so face A is down.
  if (Math.cos(body.angle) > 0) meta.sideA = Math.min(1, meta.sideA + COOK_RATE);
  else meta.sideB = Math.min(1, meta.sideB + COOK_RATE);
}

export const doneness = (m: MeatMeta) => (m.sideA + m.sideB) / 2;
