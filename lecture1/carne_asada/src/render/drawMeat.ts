import type Matter from 'matter-js';
import { crustColor, interiorColor } from '../lib/palette';
import { mulberry32 } from '../lib/rand';
import { doneness, type MeatMeta } from '../physics/bodies';
import { roundRect } from './drawGriddle';

export function drawMeat(ctx: CanvasRenderingContext2D, body: Matter.Body, meta: MeatMeta, t: number) {
  const { w, h } = meta;
  const faceADown = Math.cos(body.angle) > 0;
  const downSide = faceADown ? meta.sideA : meta.sideB;
  const upSide = faceADown ? meta.sideB : meta.sideA;

  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);

  // Squash-and-stretch on impact keeps it feeling soft rather than like a brick.
  const squash = 1 + meta.wobble * Math.sin(t * 0.03);
  ctx.scale(1 / squash, squash);

  ctx.save();
  ctx.translate(2, 4);
  ctx.fillStyle = 'rgba(0,0,0,0.30)';
  roundRect(ctx, -w / 2, -h / 2, w, h, h / 2 - 2);
  ctx.fill();
  ctx.restore();

  // Crust shell, then the interior inset — the cross-section of a sliced steak.
  ctx.fillStyle = crustColor(Math.max(meta.sideA, meta.sideB));
  roundRect(ctx, -w / 2, -h / 2, w, h, h / 2 - 2);
  ctx.fill();

  ctx.save();
  ctx.clip();

  ctx.fillStyle = interiorColor(doneness(meta));
  roundRect(ctx, -w / 2 + 5, -h / 2 + 5, w - 10, h - 10, Math.max(2, h / 2 - 7));
  ctx.fill();

  // The face against the iron picks up the crust first.
  const searDepth = 3 + downSide * 9;
  ctx.fillStyle = crustColor(downSide);
  ctx.globalAlpha = 0.92;
  ctx.fillRect(-w / 2, h / 2 - searDepth, w, searDepth);
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = crustColor(upSide);
  ctx.fillRect(-w / 2, -h / 2, w, 2 + upSide * 5);
  ctx.globalAlpha = 1;

  // Grill bars burned into the down face.
  if (downSide > 0.12) {
    ctx.strokeStyle = `rgba(38,20,12,${Math.min(0.78, downSide)})`;
    ctx.lineWidth = 4;
    const rnd = mulberry32(meta.seed ^ 0x9e37);
    for (let i = 0; i < 4; i++) {
      const bx = -w / 2 + 12 + rnd() * (w - 24);
      ctx.beginPath();
      ctx.moveTo(bx, h / 2 - searDepth - 1);
      ctx.lineTo(bx + 5, -h / 2 + 4);
      ctx.stroke();
    }
  }

  for (const f of meta.flecks) {
    ctx.fillStyle = `hsl(${f.hue} 62% ${34 + f.r * 5}%)`;
    ctx.beginPath();
    ctx.ellipse(f.x, f.y, f.r * 1.5, f.r * 0.8, f.hue * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  ctx.strokeStyle = 'rgba(255,214,170,0.22)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, -w / 2 + 1, -h / 2 + 1, w - 2, h - 2, h / 2 - 3);
  ctx.stroke();

  ctx.restore();
}

/** Wisps off a piece that is actively searing. */
export function drawSizzle(ctx: CanvasRenderingContext2D, body: Matter.Body, meta: MeatMeta, t: number) {
  const heat = Math.max(meta.sideA, meta.sideB);
  if (heat < 0.06 || heat > 0.97 || body.speed > 0.8) return;
  ctx.save();
  ctx.globalAlpha = 0.20 * Math.min(1, heat * 3);
  ctx.strokeStyle = '#fff1dc';
  ctx.lineWidth = 2;
  const rnd = mulberry32(meta.seed ^ 0x51ed);
  for (let i = 0; i < 3; i++) {
    const ox = (rnd() - 0.5) * meta.w * 0.7;
    const phase = rnd() * 6.28;
    ctx.beginPath();
    for (let s = 0; s <= 40; s += 8) {
      const px = body.position.x + ox + Math.sin(t * 0.004 + phase + s * 0.09) * 7 * (s / 40);
      const py = body.position.y - meta.h / 2 - s;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}
