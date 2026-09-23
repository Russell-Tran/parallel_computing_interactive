import { anchorWorld, type Joint } from '../physics/joints';
import { metaOf } from '../physics/bodies';
import { PHASE_FILL } from './drawToken';

/**
 * The seam between two stacked blocks. It is drawn from the live constraint
 * anchors rather than body centres, so when the script sags the connector
 * visibly stretches — which is the whole point of the soft joint.
 */
export function drawJoints(ctx: CanvasRenderingContext2D, joints: Joint[]) {
  if (!joints.length) return;
  ctx.save();
  ctx.lineCap = 'round';

  for (const j of joints) {
    const pa = anchorWorld(j.a, j.pin.pointA as { x: number; y: number });
    const pb = anchorWorld(j.b, j.pin.pointB as { x: number; y: number });
    const meta = metaOf(j.a);
    const color = meta?.kind === 'token' ? PHASE_FILL[meta.ins.phase] : '#8a8a8a';

    ctx.strokeStyle = 'rgba(0,0,0,0.38)';
    ctx.lineWidth = 17;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y + 2);
    ctx.lineTo(pb.x, pb.y + 2);
    ctx.stroke();

    ctx.strokeStyle = color;
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();

    // A strained seam lightens, so you can see which link is carrying the load.
    const stretch = Math.hypot(pb.x - pa.x, pb.y - pa.y);
    if (stretch > 3) {
      ctx.strokeStyle = `rgba(255,255,255,${Math.min(0.4, stretch / 60)})`;
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  }

  ctx.restore();
}
