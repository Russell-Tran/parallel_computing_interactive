import type Matter from 'matter-js';
import type { Instruction } from '../lib/instructions';
import { fmt } from '../lib/instructions';
import { roundRect } from './drawGriddle';

export const PHASE_FILL: Record<Instruction['phase'], string> = {
  marinade: '#9966ff',
  heat: '#ffab19',
  cook: '#4c97ff',
  serve: '#59c059',
};

const PHASE_INK: Record<Instruction['phase'], string> = {
  marinade: '#ffffff',
  heat: '#3b2400',
  cook: '#ffffff',
  serve: '#ffffff',
};

export const TOKEN_W = 168;
export const TOKEN_H = 46;

/**
 * The same Scratch token as the scheduling bench below, but drawn into the
 * physics stage so an instruction is an object you can pick up and throw.
 */
export function drawToken(ctx: CanvasRenderingContext2D, body: Matter.Body, ins: Instruction) {
  const w = TOKEN_W;
  const h = TOKEN_H;
  const fill = PHASE_FILL[ins.phase];
  const ink = PHASE_INK[ins.phase];

  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);

  ctx.save();
  ctx.translate(2, 5);
  ctx.fillStyle = 'rgba(0,0,0,0.34)';
  roundRect(ctx, -w / 2, -h / 2, w, h, 8);
  ctx.fill();
  ctx.restore();

  // Bottom tab, then the body over it.
  ctx.fillStyle = fill;
  roundRect(ctx, -w / 2 + 16, h / 2 - 3, 26, 9, 4);
  ctx.fill();
  roundRect(ctx, -w / 2, -h / 2, w, h, 8);
  ctx.fill();

  // Top notch.
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  roundRect(ctx, -w / 2 + 16, -h / 2, 26, 7, 4);
  ctx.fill();

  // Number badge.
  ctx.fillStyle = 'rgba(0,0,0,0.26)';
  ctx.beginPath();
  ctx.arc(-w / 2 + 19, 2, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = ink;
  ctx.font = '800 14px "Baloo 2", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(ins.id), -w / 2 + 19, 3);

  // Label, trimmed to fit.
  ctx.textAlign = 'left';
  ctx.font = '800 13px "Baloo 2", Verdana, sans-serif';
  ctx.fillText(trim(ctx, ins.short, w - 74), -w / 2 + 35, -3);

  ctx.font = '600 10px Verdana, sans-serif';
  ctx.globalAlpha = 0.8;
  ctx.fillText(`${fmt(ins.minutes)} · ${ins.deps.length ? `after ${ins.deps.join(',')}` : 'no deps'}`, -w / 2 + 35, 12);
  ctx.globalAlpha = 1;

  ctx.restore();
}

function trim(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text;
  let s = text;
  while (s.length > 1 && ctx.measureText(`${s}…`).width > max) s = s.slice(0, -1);
  return `${s}…`;
}
