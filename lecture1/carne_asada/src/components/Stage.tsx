import { useEffect, useRef } from 'react';
import { GriddleController } from '../physics/controller';
import { STAGE } from '../physics/world';

export function Stage({ onReady }: { onReady: (c: GriddleController) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const controller = new GriddleController(canvas, ctx);
    controller.resize();
    onReady(controller);

    const ro = new ResizeObserver(() => controller.resize());
    ro.observe(canvas);
    window.addEventListener('resize', () => controller.resize());

    return () => {
      ro.disconnect();
      controller.destroy();
    };
    // Controller owns its own loop; it is created once for the life of the canvas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="stage">
      <canvas
        ref={canvasRef}
        className="stage__canvas"
        style={{ aspectRatio: `${STAGE.width} / ${STAGE.height}` }}
        aria-label="A cast iron griddle with draggable carne asada pieces and a jug of orange juice"
      />
    </div>
  );
}
