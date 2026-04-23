import { Icon } from '@/chrome/Icon';
import type { DomainPlannerValue } from '@/state/useDomainStore';

import styles from '../Planner.module.css';

type Ability = {
  name: string;
  cost?: string;
  cd?: string;
  timing?: string;
  effect: string;
};

function asAbilities(value: DomainPlannerValue): Ability[] {
  return Array.isArray(value)
    ? value.filter((item): item is Ability => typeof item === 'object' && item !== null && 'name' in item && 'effect' in item)
    : [];
}

export function AbilitiesEditor({ mode, value, onChange }: { mode: 'active' | 'passive'; value: DomainPlannerValue; onChange: (value: DomainPlannerValue) => void }) {
  const abilities = asAbilities(value);
  const addAbility = () => onChange([
    ...abilities,
    mode === 'active'
      ? { name: 'New action', cost: '', cd: '', timing: '', effect: '' }
      : { name: 'New trait', effect: '' },
  ]);
  const update = (index: number, patch: Partial<Ability>) => onChange(abilities.map((ability, itemIndex) => itemIndex === index ? { ...ability, ...patch } : ability));

  return (
    <div className={styles.row}>
      {abilities.map((ability, index) => (
        <div className={styles.ability} key={`${ability.name}-${index}`}>
          <div className={styles.toolbar}>
            <input className="field" onChange={(event) => update(index, { name: event.target.value })} value={ability.name} />
            <button className="iconBtn" onClick={() => onChange(abilities.filter((_, itemIndex) => itemIndex !== index))} title="Remove ability" type="button"><Icon name="x" /></button>
          </div>
          {mode === 'active' && (
            <div className={styles.grid}>
              <input className="field" onChange={(event) => update(index, { cost: event.target.value })} placeholder="Cost" value={ability.cost ?? ''} />
              <input className="field" onChange={(event) => update(index, { cd: event.target.value })} placeholder="Cooldown" value={ability.cd ?? ''} />
              <input className="field" onChange={(event) => update(index, { timing: event.target.value })} placeholder="Timing" value={ability.timing ?? ''} />
            </div>
          )}
          <textarea className="field" onChange={(event) => update(index, { effect: event.target.value })} placeholder="Effect" rows={3} value={ability.effect} />
        </div>
      ))}
      <button className="btn" onClick={addAbility} type="button"><Icon name="plus" />Add {mode === 'active' ? 'active' : 'passive'}</button>
    </div>
  );
}
