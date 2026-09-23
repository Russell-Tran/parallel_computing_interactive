import { JUICE, JUICE_DEEP, JUICE_LIGHT } from '../lib/palette';
import type { JuiceSystem } from '../lib/particles';
import { STAGE } from '../physics/world';

export function drawJuice(ctx: CanvasRenderingContext2D, juice: JuiceSystem) {
  // Puddles sit on the iron, under the meat.
  for (const p of juice.puddles) {
    const g = ctx.createRadialGradient(p.x, STAGE.floorY + 3, 1, p.x, STAGE.floorY + 3, p.r);
    g.addColorStop(0, JUICE_LIGHT);
    g.addColorStop(0.6, JUICE);
    g.addColorStop(1, 'rgba(232,115,11,0.05)');
    ctx.fillStyle = g;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.ellipse(p.x, STAGE.floorY + 3, p.r, p.r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawDrops(ctx: CanvasRenderingContext2D, juice: JuiceSystem) {
  for (const d of juice.drops) {
    if (!d.alive) continue;
    // Stretch each drop along its travel direction: cheap motion blur.
    const speed = Math.hypot(d.vx, d.vy);
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.rotate(Math.atan2(d.vy, d.vx));
    ctx.fillStyle = speed > 9 ? JUICE : JUICE_DEEP;
    ctx.beginPath();
    ctx.ellipse(0, 0, d.r * (1 + speed * 0.06), d.r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
