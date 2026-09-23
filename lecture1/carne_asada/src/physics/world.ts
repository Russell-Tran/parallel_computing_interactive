import Matter from 'matter-js';

/**
 * Fixed logical stage. The canvas is scaled to fit its container in CSS, so
 * physics never has to be recomputed on resize — only the transform changes.
 */
export const STAGE = {
  width: 960,
  height: 600,
  griddleX: 70,
  griddleW: 820,
  /** Top surface of the griddle: where meat rests and juice pools. */
  floorY: 486,
};

/** One source of truth for device pixel ratio: the backing store and the
 *  mouse mapping must agree, or presses land in the wrong place. */
export const currentDpr = () => Math.min(window.devicePixelRatio || 1, 2);

/** Nothing in this world may exceed these. Keeps a hard fling on screen. */
export const MAX_SPEED = 19;
export const MAX_SPIN = 0.22;

/** Multiplier on every dynamic body's inertia: resistance to barrel rolling. */
export const SPIN_RESIST = 4.5;

export interface World {
  engine: Matter.Engine;
  mouse: Matter.Mouse;
  mouseConstraint: Matter.MouseConstraint;
}

export function createWorld(canvas: HTMLCanvasElement): World {
  const engine = Matter.Engine.create({ gravity: { x: 0, y: 1.35, scale: 0.001 } });
  // More solver passes: heavy things resting in a pile jitter less.
  engine.positionIterations = 8;
  engine.velocityIterations = 6;

  // Walls barely bounce — a piece that hits one should drop, not ricochet.
  const wallOpts = { isStatic: true, restitution: 0.04, friction: 0.9 };
  Matter.Composite.add(engine.world, [
    // Griddle surface.
    Matter.Bodies.rectangle(
      STAGE.griddleX + STAGE.griddleW / 2,
      STAGE.floorY + 30,
      STAGE.griddleW,
      60,
      { ...wallOpts, label: 'griddle' },
    ),
    // Full-height side walls. These used to be 130px stubs around the griddle
    // surface, which left the whole upper stage open — anything thrown above
    // y=381 simply left the world sideways. They now span far past the view.
    Matter.Bodies.rectangle(STAGE.griddleX - 16, STAGE.height / 2, 32, 2600, { ...wallOpts, label: 'wall' }),
    Matter.Bodies.rectangle(STAGE.griddleX + STAGE.griddleW + 16, STAGE.height / 2, 32, 2600, { ...wallOpts, label: 'wall' }),
    // Ceiling just above the top edge, so a hard toss clips the top of the
    // frame for a moment instead of disappearing for two seconds.
    Matter.Bodies.rectangle(STAGE.width / 2, -52, STAGE.width * 2, 64, { ...wallOpts, label: 'ceiling' }),
  ]);

  const mouse = Matter.Mouse.create(canvas);
  const mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.32, damping: 0.22, render: { visible: false } },
  });
  Matter.Composite.add(engine.world, mouseConstraint);

  syncMouseScale(mouse);

  return { engine, mouse, mouseConstraint };
}

/**
 * Matter's `Mouse._getRelativeMousePosition` already divides the CSS-pixel
 * offset by `clientWidth / canvas.width * pixelRatio`. Give it the same dpr the
 * backing store uses and that single step lands in stage coordinates:
 *
 *   x_css * (STAGE.width * dpr) / (clientWidth * dpr) = x_css * STAGE.width / clientWidth
 *
 * So `scale` must stay at 1. Setting it to STAGE.width/rect.width as well
 * applied the stage-to-CSS ratio twice, which put every press off target by
 * 2x on a retina desktop and ~12x on a phone.
 */
export function syncMouseScale(mouse: Matter.Mouse) {
  mouse.pixelRatio = currentDpr();
  Matter.Mouse.setScale(mouse, { x: 1, y: 1 });
  Matter.Mouse.setOffset(mouse, { x: 0, y: 0 });
}
