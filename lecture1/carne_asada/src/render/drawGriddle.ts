import { IRON, IRON_EDGE, IRON_RIDGE } from '../lib/palette';
import { STAGE } from '../physics/world';

const DEPTH = 46;

export function drawBackdrop(ctx: CanvasRenderingContext2D, t: number) {
  const g = ctx.createLinearGradient(0, 0, 0, STAGE.height);
  g.addColorStop(0, '#2c1f1a');
  g.addColorStop(0.55, '#3d2a21');
  g.addColorStop(1, '#241a16');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);

  // Warm pool of light over the cooking surface.
  const glow = ctx.createRadialGradient(
    STAGE.width / 2, STAGE.floorY - 60, 40,
    STAGE.width / 2, STAGE.floorY - 60, 470,
  );
  glow.addColorStop(0, 'rgba(255,176,92,0.20)');
  glow.addColorStop(1, 'rgba(255,176,92,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);

  drawHeatHaze(ctx, t);
}

function drawHeatHaze(ctx: CanvasRenderingContext2D, t: number) {
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.strokeStyle = '#ffd9a8';
  ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    const x = STAGE.griddleX + 90 + i * 118;
    ctx.beginPath();
    for (let y = 0; y <= 110; y += 10) {
      const sway = Math.sin(t * 0.0016 + i * 1.7 + y * 0.05) * 9 * (y / 110);
      const px = x + sway;
      const py = STAGE.floorY - 14 - y;
      if (y === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

export function drawGriddle(ctx: CanvasRenderingContext2D) {
  const x = STAGE.griddleX;
  const w = STAGE.griddleW;
  const y = STAGE.floorY;

  // Handles, drawn behind the slab so they read as welded on.
  ctx.fillStyle = IRON_EDGE;
  for (const hx of [x - 52, x + w + 8]) {
    roundRect(ctx, hx, y + 6, 44, 16, 8);
    ctx.fill();
  }

  // Slab.
  const slab = ctx.createLinearGradient(0, y, 0, y + DEPTH);
  slab.addColorStop(0, IRON_EDGE);
  slab.addColorStop(0.18, IRON);
  slab.addColorStop(1, IRON_RIDGE);
  ctx.fillStyle = slab;
  roundRect(ctx, x, y, w, DEPTH, 10);
  ctx.fill();

  // Cooking surface highlight.
  ctx.fillStyle = 'rgba(255,196,128,0.12)';
  roundRect(ctx, x + 4, y + 1, w - 8, 5, 3);
  ctx.fill();

  // Ridges.
  ctx.strokeStyle = 'rgba(0,0,0,0.38)';
  ctx.lineWidth = 3;
  for (let i = 1; i < 26; i++) {
    const rx = x + (w / 26) * i;
    ctx.beginPath();
    ctx.moveTo(rx, y + 12);
    ctx.lineTo(rx, y + DEPTH - 6);
    ctx.stroke();
  }
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}
