import Matter from 'matter-js';

export interface Joint {
  a: Matter.Body;
  b: Matter.Body;
  /** Holds the seam together. */
  pin: Matter.Constraint;
  /** Weakly resists twist, so the seam flexes instead of locking. */
  brace: Matter.Constraint;
}

/**
 * Explicit joints between bodies — nothing here is collision driven.
 *
 * A joint is deliberately two constraints of very different strength. The pin
 * is firm, so blocks stay attached at the notch; the brace is slack, so the
 * pair can rock a few degrees against each other. One stiff constraint pair
 * would weld the chain into a single rigid slab; the pin alone would be a free
 * hinge and the script would fold in half. The gap between them is the wobble.
 */
export class JointSet {
  private joints: Joint[] = [];

  constructor(private world: Matter.World) {}

  get count() {
    return this.joints.length;
  }

  list(): Joint[] {
    return this.joints;
  }

  /**
   * Link two bodies at a seam. `anchorA`/`anchorB` are offsets from each body's
   * centre, in the body's current orientation — Matter rotates them from here.
   */
  link(
    a: Matter.Body,
    b: Matter.Body,
    anchorA: Matter.Vector,
    anchorB: Matter.Vector,
    braceOffset: number,
  ) {
    const pin = Matter.Constraint.create({
      bodyA: a,
      bodyB: b,
      pointA: { ...anchorA },
      pointB: { ...anchorB },
      length: 0,
      stiffness: 0.42,
      damping: 0.1,
      render: { visible: false },
    });

    const brace = Matter.Constraint.create({
      bodyA: a,
      bodyB: b,
      pointA: { x: anchorA.x + braceOffset, y: anchorA.y },
      pointB: { x: anchorB.x + braceOffset, y: anchorB.y },
      length: 0,
      stiffness: 0.055,
      damping: 0.03,
      render: { visible: false },
    });

    Matter.Composite.add(this.world, [pin, brace]);
    this.joints.push({ a, b, pin, brace });
  }

  forget(body: Matter.Body) {
    this.joints = this.joints.filter((j) => {
      if (j.a !== body && j.b !== body) return true;
      Matter.Composite.remove(this.world, [j.pin, j.brace]);
      return false;
    });
  }

  clear() {
    for (const j of this.joints) Matter.Composite.remove(this.world, [j.pin, j.brace]);
    this.joints = [];
  }
}

/** World-space position of a constraint anchor (Matter keeps pointA rotated). */
export const anchorWorld = (body: Matter.Body, point: Matter.Vector) => ({
  x: body.position.x + point.x,
  y: body.position.y + point.y,
});
