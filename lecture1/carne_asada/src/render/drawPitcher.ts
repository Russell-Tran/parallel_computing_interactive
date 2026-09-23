import type Matter from 'matter-js';
import { JUICE, JUICE_DEEP, JUICE_LIGHT } from '../lib/palette';
import type { PitcherMeta } from '../physics/bodies';

/**
 * A pitcher, not a jar: body tapers in toward the base, the rim flares, and a
 * pulled spout sits on the right with a proper C handle opposite it.
 */
function pitcherPath(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const topHalf = w / 2;
  const botHalf = w * 0.39;
  ctx.beginPath();
  ctx.moveTo(-topHalf, -h / 2);
  ctx.lineTo(-botHalf, h / 2 - 10);
  ctx.quadraticCurveTo(-botHalf, h / 2, -botHalf + 10, h / 2);
  ctx.lineTo(botHalf - 10, h / 2);
  ctx.quadraticCurveTo(botHalf, h / 2, botHalf, h / 2 - 10);
  ctx.lineTo(topHalf, -h / 2);
  ctx.closePath();
}

export function drawPitcher(ctx: CanvasRenderingContext2D, body: Matter.Body, meta: PitcherMeta) {
  const { w, h } = meta;
  const cx = body.position.x;
  const cy = body.position.y;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(body.angle);

  // Handle first, so the glass overlaps where it joins.
  ctx.strokeStyle = 'rgba(226,240,248,0.5)';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-w / 2 + 6, -h / 2 + 18);
  ctx.bezierCurveTo(-w / 2 - 34, -h / 2 + 22, -w / 2 - 34, h / 2 - 22, -w * 0.39 + 6, h / 2 - 14);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Pulled spout.
  ctx.fillStyle = 'rgba(226,240,248,0.34)';
  ctx.beginPath();
  ctx.moveTo(w / 2 - 12, -h / 2 + 2);
  ctx.quadraticCurveTo(w / 2 + 16, -h / 2 - 2, w / 2 + 13, -h / 2 - 12);
  ctx.quadraticCurveTo(w / 2 + 2, -h / 2 - 6, w / 2 - 22, -h / 2 - 4);
  ctx.closePath();
  ctx.fill();

  // Glass.
  ctx.fillStyle = 'rgba(226,240,248,0.16)';
  pitcherPath(ctx, w, h);
  ctx.fill();

  // Juice: clipped to the pitcher in local space, filled as a horizontal band
  // in world space, so the surface stays level however far it is tipped.
  ctx.save();
  pitcherPath(ctx, w - 7, h - 7);
  ctx.clip();
  ctx.rotate(-body.angle);
  ctx.translate(-cx, -cy);

  const span = Math.hypot(w, h);
  const surfaceY = cy + span / 2 - meta.level * span * 0.84;
  const grad = ctx.createLinearGradient(0, surfaceY, 0, surfaceY + span);
  grad.addColorStop(0, JUICE_LIGHT);
  grad.addColorStop(0.4, JUICE);
  grad.addColorStop(1, JUICE_DEEP);
  ctx.fillStyle = grad;
  ctx.fillRect(cx - span, surfaceY, span * 2, span * 2);
  ctx.fillStyle = 'rgba(255,242,210,0.7)';
  ctx.fillRect(cx - span, surfaceY, span * 2, 3);
  ctx.restore();

  // Flared rim.
  ctx.fillStyle = 'rgba(236,246,252,0.62)';
  ctx.beginPath();
  ctx.ellipse(0, -h / 2, w / 2 + 3, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(160,190,205,0.4)';
  ctx.beginPath();
  ctx.ellipse(0, -h / 2, w / 2 - 4, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Outline and one specular strip.
  ctx.strokeStyle = 'rgba(240,250,255,0.72)';
  ctx.lineWidth = 3.5;
  pitcherPath(ctx, w, h);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.moveTo(-w / 2 + 14, -h / 2 + 12);
  ctx.lineTo(-w / 2 + 23, -h / 2 + 12);
  ctx.lineTo(-w * 0.39 + 20, h / 2 - 14);
  ctx.lineTo(-w * 0.39 + 12, h / 2 - 14);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
