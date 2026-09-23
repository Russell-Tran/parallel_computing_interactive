import { MARINADE } from '../lib/recipe';
import { donenessLabel, useGriddleStore } from '../store/useGriddleStore';

export function Hud() {
  const pieces = useGriddleStore((s) => s.pieces);
  const juiceLevel = useGriddleStore((s) => s.juiceLevel);
  const avgDoneness = useGriddleStore((s) => s.avgDoneness);
  const pouring = useGriddleStore((s) => s.pouring);
  const added = useGriddleStore((s) => s.added);

  return (
    <div className="hud">
      <div className="hud__item">
        <span className="hud__label">On the iron</span>
        <span className="hud__value">{pieces}</span>
      </div>

      <div className="hud__item">
        <span className="hud__label">Doneness</span>
        <span className="hud__value hud__value--text">{donenessLabel(avgDoneness)}</span>
        <div className="meter" role="img" aria-label={`Average doneness ${Math.round(avgDoneness * 100)} percent`}>
          <div className="meter__fill meter__fill--sear" style={{ width: `${Math.round(avgDoneness * 100)}%` }} />
        </div>
      </div>

      <div className="hud__item">
        <span className="hud__label">Marinade</span>
        <span className="hud__value">
          {added}<span className="hud__of"> / {MARINADE.length}</span>
        </span>
        <div className="meter" role="img" aria-label={`${added} of ${MARINADE.length} marinade ingredients added`}>
          <div className="meter__fill meter__fill--herb" style={{ width: `${(added / MARINADE.length) * 100}%` }} />
        </div>
      </div>

      <div className="hud__item">
        <span className="hud__label">Pitcher{pouring ? ' — pouring' : ''}</span>
        <span className="hud__value">{Math.round(juiceLevel * 100)}%</span>
        <div className="meter" role="img" aria-label={`Pitcher ${Math.round(juiceLevel * 100)} percent full`}>
          <div className="meter__fill meter__fill--juice" style={{ width: `${Math.round(juiceLevel * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}
