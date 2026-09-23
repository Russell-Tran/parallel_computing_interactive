import { STAGE } from '../physics/world';

/**
 * Pooled orange-juice particles.
 *
 * This is deliberately NOT a fluid simulation. A few hundred ballistic dots
 * with gravity and a fade read as "pouring" and cost nothing; SPH would cost
 * an afternoon and look worse at this scale.
 */
export interface Drop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  alive: boolean;
}

export interface Puddle {
  x: number;
  r: number;
}

const GRAVITY = 0.45;
const MAX_DROPS = 320;
const MAX_PUDDLES = 46;

export class JuiceSystem {
  drops: Drop[] = [];
  puddles: Puddle[] = [];
  private cursor = 0;

  constructor() {
    for (let i = 0; i < MAX_DROPS; i++) {
      this.drops.push({ x: 0, y: 0, vx: 0, vy: 0, r: 0, life: 0, alive: false });
    }
  }

  /** Spawn from the jug spout, aimed along the pour direction. */
  emit(x: number, y: number, dirX: number, strength: number) {
    const count = 1 + Math.floor(strength * 2);
    for (let i = 0; i < count; i++) {
      const d = this.drops[this.cursor];
      this.cursor = (this.cursor + 1) % MAX_DROPS;
      d.x = x + (Math.random() - 0.5) * 6;
      d.y = y + (Math.random() - 0.5) * 6;
      d.vx = dirX * (1.1 + Math.random() * 1.4) * strength;
      d.vy = -0.4 + Math.random() * 1.2;
      d.r = 2.2 + Math.random() * 3.2;
      d.life = 1;
      d.alive = true;
    }
  }

  step() {
    for (const d of this.drops) {
      if (!d.alive) continue;
      d.vy += GRAVITY;
      d.x += d.vx;
      d.y += d.vy;
      if (d.y >= STAGE.floorY) {
        d.alive = false;
        this.land(d.x, d.r);
      } else if (d.x < -40 || d.x > STAGE.width + 40) {
        d.alive = false;
      }
    }
  }

  /** Landed drops merge into the nearest puddle instead of stacking forever. */
  private land(x: number, r: number) {
    const clampedX = Math.max(STAGE.griddleX, Math.min(STAGE.griddleX + STAGE.griddleW, x));
    for (const p of this.puddles) {
      if (Math.abs(p.x - clampedX) < 26) {
        p.r = Math.min(52, p.r + r * 0.22);
        p.x += (clampedX - p.x) * 0.06;
        return;
      }
    }
    if (this.puddles.length < MAX_PUDDLES) {
      this.puddles.push({ x: clampedX, r: r * 1.6 });
    }
  }

  /** The griddle is hot: puddles cook off over time. */
  evaporate() {
    for (let i = this.puddles.length - 1; i >= 0; i--) {
      this.puddles[i].r -= 0.045;
      if (this.puddles[i].r <= 0.6) this.puddles.splice(i, 1);
    }
  }

  clear() {
    for (const d of this.drops) d.alive = false;
    this.puddles.length = 0;
  }
}
