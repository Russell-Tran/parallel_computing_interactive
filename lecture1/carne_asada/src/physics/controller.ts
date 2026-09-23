import Matter from 'matter-js';
import { JuiceSystem } from '../lib/particles';
import { useGriddleStore } from '../store/useGriddleStore';
import { drawBackdrop, drawGriddle } from '../render/drawGriddle';
import { drawDrops, drawJuice } from '../render/drawJuice';
import { drawIngredient } from '../render/drawIngredient';
import { drawPitcher } from '../render/drawPitcher';
import { drawMeat, drawSizzle } from '../render/drawMeat';
import { INSTRUCTIONS } from '../lib/instructions';
import { MARINADE } from '../lib/recipe';
import { drawJoints } from '../render/drawJoints';
import { TOKEN_H, TOKEN_W, drawToken } from '../render/drawToken';
import { JointSet } from './joints';
import {
  cookStep, createIngredient, createInstructionToken, createMeatPiece, createPitcher, doneness,
  metaOf, spoutPoint,
  type IngredientMeta, type MeatMeta, type PitcherMeta, type TokenMeta,
} from './bodies';
import {
  createWorld, currentDpr, MAX_SPEED, MAX_SPIN, STAGE, syncMouseScale, type World,
} from './world';

/** Tip past this and the jug starts pouring. */
const POUR_ANGLE = 0.72;

/**
 * Owns the render loop. Physics mutates 60x/second; React is told about it
 * roughly 8x/second, and only about the handful of numbers the HUD shows.
 */
export class GriddleController {
  private world: World;
  private juice = new JuiceSystem();
  private joints: JointSet;
  private meat: Matter.Body[] = [];
  private ingredients: Matter.Body[] = [];
  /** Next ingredient to add, in slide-27 order — never random. */
  private nextIngredient = 0;
  private tokens: Matter.Body[] = [];
  private pitcher: Matter.Body;
  private raf = 0;
  private lastSync = 0;
  private t = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private ctx: CanvasRenderingContext2D,
  ) {
    this.world = createWorld(canvas);
    this.joints = new JointSet(this.world.engine.world);
    this.pitcher = createPitcher();
    Matter.Composite.add(this.world.engine.world, this.pitcher);

    // Squash the piece on a hard landing. Collisions do not create joints:
    // the only things attached are the instruction blocks, linked on purpose.
    Matter.Events.on(this.world.engine, 'collisionStart', (e) => {
      for (const pair of e.pairs) {
        for (const b of [pair.bodyA, pair.bodyB]) {
          const m = metaOf(b);
          if (m?.kind === 'meat') m.wobble = Math.min(0.12, m.wobble + b.speed * 0.008);
        }
      }
    });

    // Opening layout is laid out by hand so nothing starts inside anything
    // else — overlapping spawns weld instantly once sticking is on.
    this.dropInstructionSet();
    // Step 1's first three: olive oil, cilantro, lime juice.
    [400, 520, 640].forEach((x) => this.addIngredient(x, 260));
    [470, 640, 810].forEach((x) => this.addPiece(x, 370));
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  /** Single entry point for adding a dynamic body. */
  private spawn(body: Matter.Body) {
    Matter.Composite.add(this.world.engine.world, body);
    return body;
  }

  addPiece(x?: number, y?: number) {
    const px = x ?? STAGE.griddleX + 90 + Math.random() * (STAGE.griddleW - 260);
    const py = y ?? 30 + Math.random() * 40;
    const body = createMeatPiece(px, py);
    this.meat.push(body);
    this.spawn(body);
  }

  /** Adds the next marinade ingredient in recipe order, then stops. */
  addIngredient(x?: number, y?: number): boolean {
    if (this.nextIngredient >= MARINADE.length) return false;
    const def = MARINADE[this.nextIngredient++];
    const slot = this.nextIngredient - 1;
    x = x ?? STAGE.griddleX + 110 + ((slot * 137) % (STAGE.griddleW - 300));
    const body = createIngredient(def, x, y ?? 70);
    this.ingredients.push(body);
    this.spawn(body);
    return true;
  }

  /** All seven instructions, dropped onto the griddle as physical objects. */
  /**
   * The program drops as one script: seven blocks already stacked in order and
   * linked at the notch, the way they would sit in a Scratch editor.
   */
  dropInstructionSet() {
    this.joints.clear();
    for (const b of this.tokens) Matter.Composite.remove(this.world.engine.world, b);

    const x = 230;
    const top = 62;
    this.tokens = INSTRUCTIONS.map((ins, i) =>
      this.spawn(createInstructionToken(ins, x, top + i * TOKEN_H)),
    );

    // Seam sits at the notch, left of centre — so the script hangs from its
    // left edge and swings, exactly like dragging a real Scratch stack.
    const notchX = -TOKEN_W / 2 + 29;
    for (let i = 0; i < this.tokens.length - 1; i++) {
      this.joints.link(
        this.tokens[i],
        this.tokens[i + 1],
        { x: notchX, y: TOKEN_H / 2 },
        { x: notchX, y: -TOKEN_H / 2 },
        52,
      );
    }
  }

  refillPitcher() {
    (metaOf(this.pitcher) as PitcherMeta).level = 1;
    Matter.Body.setAngle(this.pitcher, 0);
    Matter.Body.setAngularVelocity(this.pitcher, 0);
    Matter.Body.setPosition(this.pitcher, { x: 800, y: 90 });
    Matter.Body.setVelocity(this.pitcher, { x: 0, y: 0 });
  }

  clear() {
    for (const b of [...this.meat, ...this.ingredients]) {
      Matter.Composite.remove(this.world.engine.world, b);
    }
    this.meat.length = 0;
    this.ingredients.length = 0;
    this.nextIngredient = 0;
    this.juice.clear();
  }

  /** A shove, not a launch — everything should land back on the iron. */
  toss() {
    for (const b of [...this.meat, ...this.ingredients, ...this.tokens]) {
      Matter.Body.setVelocity(b, { x: (Math.random() - 0.5) * 5, y: -7.5 - Math.random() * 2.5 });
      Matter.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.1);
    }
  }

  private get dynamic(): Matter.Body[] {
    return [...this.meat, ...this.ingredients, ...this.tokens, this.pitcher];
  }

  /**
   * Hard caps on speed and spin, applied every frame. The mouse constraint can
   * impart an enormous impulse on a fast flick, and a body moving faster than
   * its own width per step can tunnel straight through a wall; clamping is what
   * actually guarantees nothing leaves the stage.
   */
  private settle() {
    for (const b of this.dynamic) {
      const speed = Math.hypot(b.velocity.x, b.velocity.y);
      if (speed > MAX_SPEED) {
        const k = MAX_SPEED / speed;
        Matter.Body.setVelocity(b, { x: b.velocity.x * k, y: b.velocity.y * k });
      }
      if (Math.abs(b.angularVelocity) > MAX_SPIN) {
        Matter.Body.setAngularVelocity(b, Math.sign(b.angularVelocity) * MAX_SPIN);
      }

      // Last resort: if anything is outside the stage anyway, drop it back in.
      const out =
        b.position.x < STAGE.griddleX - 60 ||
        b.position.x > STAGE.griddleX + STAGE.griddleW + 60 ||
        b.position.y > STAGE.height + 120 ||
        b.position.y < -400;
      if (out) {
        this.joints.forget(b);
        Matter.Body.setPosition(b, { x: STAGE.width / 2, y: 40 });
        Matter.Body.setVelocity(b, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(b, 0);
      }
    }
  }

  resize() {
    const dpr = currentDpr();
    this.canvas.width = STAGE.width * dpr;
    this.canvas.height = STAGE.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    syncMouseScale(this.world.mouse);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    Matter.Engine.clear(this.world.engine);
  }

  private loop(now: number) {
    try {
      this.step(now);
    } catch (err) {
      // A throw used to escape the rAF callback before it could reschedule,
      // which killed the canvas permanently. Log and keep the loop alive.
      console.error('[griddle] frame failed', err);
    }
    this.raf = requestAnimationFrame(this.loop);
  }

  private step(now: number) {
    this.t = now;
    const engine = this.world.engine;
    Matter.Engine.update(engine, 1000 / 60);
    this.settle();

    const pitcherMeta = metaOf(this.pitcher) as PitcherMeta;
    const tilt = Math.abs(this.pitcher.angle);
    const pouring = tilt > POUR_ANGLE && pitcherMeta.level > 0.001;
    if (pouring) {
      const strength = Math.min(1, (tilt - POUR_ANGLE) / 0.9);
      const spout = spoutPoint(this.pitcher, pitcherMeta);
      this.juice.emit(spout.x, spout.y, Math.sign(Math.sin(this.pitcher.angle)) || 1, strength);
      pitcherMeta.level = Math.max(0, pitcherMeta.level - 0.0022 * (0.5 + strength));
    }

    this.juice.step();
    this.juice.evaporate();

    let totalDone = 0;
    for (const b of this.meat) {
      const m = metaOf(b) as MeatMeta;
      cookStep(b, m);
      totalDone += doneness(m);
    }

    this.draw();

    if (now - this.lastSync > 120) {
      this.lastSync = now;
      useGriddleStore.getState().set({
        pieces: this.meat.length,
        juiceLevel: pitcherMeta.level,
        avgDoneness: this.meat.length ? totalDone / this.meat.length : 0,
        pouring,
        added: this.nextIngredient,
      });
    }
  }

  private draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, STAGE.width, STAGE.height);
    drawBackdrop(ctx, this.t);
    drawGriddle(ctx);
    drawJuice(ctx, this.juice);

    for (const b of this.ingredients) drawIngredient(ctx, b, (metaOf(b) as IngredientMeta).def);
    drawJoints(ctx, this.joints.list());
    for (const b of this.tokens) drawToken(ctx, b, (metaOf(b) as TokenMeta).ins);
    for (const b of this.meat) drawMeat(ctx, b, metaOf(b) as MeatMeta, this.t);
    drawPitcher(ctx, this.pitcher, metaOf(this.pitcher) as PitcherMeta);
    drawDrops(ctx, this.juice);
    for (const b of this.meat) drawSizzle(ctx, b, metaOf(b) as MeatMeta, this.t);
  }
}
