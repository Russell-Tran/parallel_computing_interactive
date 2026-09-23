import type Matter from 'matter-js';
import type { Ingredient } from '../lib/recipe';
import { roundRect } from './drawGriddle';

/** One drawing per form in the recipe list. No procedural guesswork. */
export function drawIngredient(ctx: CanvasRenderingContext2D, body: Matter.Body, def: Ingredient) {
  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);

  ctx.save();
  ctx.translate(2, 4);
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  roundRect(ctx, -def.w / 2, -def.h / 2, def.w, def.h, 10);
  ctx.fill();
  ctx.restore();

  switch (def.form) {
    case 'bottle': bottle(ctx, def); break;
    case 'citrus': citrus(ctx, def); break;
    case 'shaker': shaker(ctx, def); break;
    case 'chile': chile(ctx, def); break;
    case 'bulb': bulb(ctx, def); break;
    case 'herbs': herbs(ctx, def); break;
    default: break;
  }

  ctx.restore();
}

function bottle(ctx: CanvasRenderingContext2D, d: Ingredient) {
  const { w, h } = d;
  ctx.fillStyle = d.fill;
  roundRect(ctx, -w / 2, -h / 2 + 22, w, h - 22, 9);
  ctx.fill();

  ctx.fillStyle = d.accent;
  roundRect(ctx, -7, -h / 2 + 2, 14, 26, 4);
  ctx.fill();
  roundRect(ctx, -9, -h / 2 - 5, 18, 10, 3);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.86)';
  roundRect(ctx, -w / 2 + 4, 2, w - 8, h / 3, 3);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  roundRect(ctx, -w / 2 + 6, -h / 2 + 28, 6, h / 3, 3);
  ctx.fill();
}

function citrus(ctx: CanvasRenderingContext2D, d: Ingredient) {
  const r = d.w / 2;
  ctx.fillStyle = d.accent;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = d.fill;
  ctx.beginPath();
  ctx.arc(0, 0, r - 5, 0, Math.PI * 2);
  ctx.fill();

  // Cut face: eight segments, because these two are here as juice.
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 3, Math.sin(a) * 3);
    ctx.lineTo(Math.cos(a) * (r - 7), Math.sin(a) * (r - 7));
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();
}

function shaker(ctx: CanvasRenderingContext2D, d: Ingredient) {
  const { w, h } = d;
  ctx.fillStyle = 'rgba(240,246,250,0.28)';
  roundRect(ctx, -w / 2, -h / 2 + 12, w, h - 12, 7);
  ctx.fill();

  ctx.fillStyle = d.fill;
  roundRect(ctx, -w / 2 + 3, -h / 2 + 26, w - 6, h - 30, 5);
  ctx.fill();

  ctx.fillStyle = d.accent;
  roundRect(ctx, -w / 2 + 1, -h / 2, w - 2, 16, 5);
  ctx.fill();

  ctx.fillStyle = 'rgba(60,50,44,0.65)';
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.arc(i * 8, -h / 2 + 7, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  roundRect(ctx, -w / 2, -h / 2 + 12, w, h - 12, 7);
  ctx.stroke();
}

function chile(ctx: CanvasRenderingContext2D, d: Ingredient) {
  const { w, h } = d;
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, d.fill);
  g.addColorStop(1, d.accent);
  ctx.fillStyle = g;

  // Tapered, slightly curved pod.
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0);
  ctx.quadraticCurveTo(-w / 6, -h / 2, w / 3, -h / 2 + 4);
  ctx.quadraticCurveTo(w / 2 + 4, 0, w / 3, h / 2 - 4);
  ctx.quadraticCurveTo(-w / 6, h / 2, -w / 2, 0);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#2c5f1d';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-w / 2 + 2, 0);
  ctx.lineTo(-w / 2 - 8, -6);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.32)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-w / 5, -h / 4);
  ctx.quadraticCurveTo(w / 6, -h / 3, w / 3, -h / 6);
  ctx.stroke();
}

function bulb(ctx: CanvasRenderingContext2D, d: Ingredient) {
  const { w, h } = d;
  ctx.fillStyle = d.fill;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.quadraticCurveTo(w / 2, -h / 6, w / 2 - 4, h / 4);
  ctx.quadraticCurveTo(0, h / 2 + 4, -w / 2 + 4, h / 4);
  ctx.quadraticCurveTo(-w / 2, -h / 6, 0, -h / 2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = d.accent;
  ctx.lineWidth = 2;
  for (const ox of [-w / 5, 0, w / 5]) {
    ctx.beginPath();
    ctx.moveTo(ox * 0.3, -h / 2 + 4);
    ctx.quadraticCurveTo(ox, 0, ox * 0.9, h / 2 - 2);
    ctx.stroke();
  }

  ctx.strokeStyle = '#b8a98e';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -h / 2 + 2);
  ctx.lineTo(2, -h / 2 - 8);
  ctx.stroke();
}

function herbs(ctx: CanvasRenderingContext2D, d: Ingredient) {
  const { w, h } = d;
  ctx.strokeStyle = '#3f7a29';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 5, h / 2);
    ctx.quadraticCurveTo(i * 12, 0, i * (w / 5), -h / 2 + 10);
    ctx.stroke();
  }
  for (let i = -2; i <= 2; i++) {
    const lx = i * (w / 5);
    const ly = -h / 2 + 10;
    ctx.fillStyle = i % 2 === 0 ? d.fill : d.accent;
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + i;
      ctx.beginPath();
      ctx.ellipse(lx + Math.cos(a) * 8, ly + Math.sin(a) * 7, 8, 6, a, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
