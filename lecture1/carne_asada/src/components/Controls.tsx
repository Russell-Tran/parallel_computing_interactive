import { MARINADE } from '../lib/recipe';
import type { GriddleController } from '../physics/controller';
import { useGriddleStore } from '../store/useGriddleStore';

export function Controls({ controller }: { controller: GriddleController | null }) {
  const added = useGriddleStore((s) => s.added);
  const next = MARINADE[added];

  return (
    <div className="controls">
      <button className="btn btn--primary" onClick={() => controller?.addPiece()}>
        Add flank steak
      </button>
      <button className="btn" disabled={!next} onClick={() => controller?.addIngredient()}>
        {next ? `Add ${next.label.toLowerCase()}` : 'All ingredients added'}
      </button>
      <button className="btn" onClick={() => controller?.dropInstructionSet()}>
        Re-drop the script
      </button>
      <button className="btn" onClick={() => controller?.toss()}>
        Toss the pan
      </button>
      <button className="btn" onClick={() => controller?.refillPitcher()}>
        Refill the pitcher
      </button>
      <button className="btn btn--quiet" onClick={() => controller?.clear()}>
        Clear griddle
      </button>
    </div>
  );
}
