/**
 * Turn Vite's single-file build into an Artifact-ready fragment.
 *
 * The Artifact runtime wraps whatever you publish in its own
 * <!doctype>/<html>/<head>/<body> skeleton, so the published file must NOT
 * carry those tags itself. Everything else — <title>, <style>, the inline
 * module script, #root — passes straight through.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve(process.cwd(), 'dist');
const html = readFileSync(resolve(dist, 'index.html'), 'utf8');

const pick = (tag) => {
  const m = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? m[1] : '';
};

const head = pick('head')
  .replace(/<meta[^>]*>/gi, '')
  .trim();
const body = pick('body').trim();

const fragment = `${head}\n${body}\n`;
const out = resolve(dist, 'artifact.html');
writeFileSync(out, fragment, 'utf8');

const kb = (Buffer.byteLength(fragment) / 1024).toFixed(0);
console.log(`artifact.html  ${kb} KB  (limit 16384 KB)`);
