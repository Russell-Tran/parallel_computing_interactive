import { useState } from 'react';
import { Controls } from './components/Controls';
import { Hud } from './components/Hud';
import { Stage } from './components/Stage';
import type { GriddleController } from './physics/controller';

const LECTURE = 'https://cs149.stanford.edu/fall25/lecture/efficiency/';
const slide = (n: number) => `${LECTURE}slide_${n}`;

export default function App() {
  const [controller, setController] = useState<GriddleController | null>(null);

  return (
    <main className="page">
      <header className="masthead">
        <p className="eyebrow">
          <a className="src" href={LECTURE} target="_blank" rel="noopener noreferrer">
            Stanford CS149 · Lecture 1 · Why Parallelism? Why Efficiency?
          </a>
        </p>
        <h1 className="title">What is a computer program?</h1>

        <div className="answer">
          <blockquote className="answer__line">
            <p>A program is just a list of instructions.</p>
            <cite>
              <a className="src" href={slide(26)} target="_blank" rel="noopener noreferrer">
                Slide 26
              </a>
            </cite>
          </blockquote>
          <blockquote className="answer__line answer__line--recipe">
            <p>Kind of like the instructions in a recipe for your favorite meals.</p>
            <cite>
              <a className="src" href={slide(27)} target="_blank" rel="noopener noreferrer">
                Slide 27
              </a>
            </cite>
          </blockquote>
        </div>

        <div className="dish">
          <h2 className="dish__name">Mmm, carne asada</h2>
          <svg className="dish__arrow" viewBox="0 0 48 56" aria-hidden="true">
            <path d="M6 6 L28 33.5" stroke="currentColor" strokeWidth="7" strokeLinecap="round" fill="none" />
            <polygon points="36,44 19.75,36.5 32.25,26.5" fill="currentColor" />
          </svg>
        </div>
      </header>

      <Stage onReady={setController} />

      <Controls controller={controller} />
      <Hud />
    </main>
  );
}
