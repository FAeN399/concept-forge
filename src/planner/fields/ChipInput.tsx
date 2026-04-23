import { useState } from 'react';

import { Icon } from '@/chrome/Icon';

import styles from '../Planner.module.css';

export type ChipSuggestion = {
  label: string;
  badge?: string;
};

type ChipInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
  suggestions?: ChipSuggestion[] | undefined;
};

export function ChipInput({ value, onChange, suggestions = [] }: ChipInputProps) {
  const [draft, setDraft] = useState('');

  const addItems = (raw: string) => {
    const next = raw.split(',').map((item) => item.trim()).filter(Boolean);
    if (next.length === 0) return;
    onChange(Array.from(new Set([...value, ...next])));
    setDraft('');
  };

  const filteredSuggestions = suggestions.filter((suggestion) => !value.includes(suggestion.label));

  return (
    <div className={styles.row}>
      <div className={styles.chipInput}>
        {value.map((chip) => (
          <span className="chip" key={chip}>
            {chip}
            <button className="iconBtn" onClick={() => onChange(value.filter((item) => item !== chip))} title={`Remove ${chip}`} type="button">
              <Icon name="x" size={12} />
            </button>
          </span>
        ))}
        <input
          onBlur={() => addItems(draft)}
          onChange={(event) => {
            const next = event.target.value;
            if (next.includes(',')) {
              addItems(next);
            } else {
              setDraft(next);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addItems(draft);
            }
            if (event.key === 'Backspace' && draft.length === 0 && value.length > 0) {
              onChange(value.slice(0, -1));
            }
          }}
          placeholder="Add chip..."
          value={draft}
        />
      </div>
      {filteredSuggestions.length > 0 && (
        <div className={styles.suggestions}>
          {filteredSuggestions.map((suggestion) => (
            <button className="chip" key={suggestion.label} onClick={() => addItems(suggestion.label)} type="button">
              <Icon name="plus" size={12} />
              {suggestion.label}
              {suggestion.badge && <span className="chip chipOk">{suggestion.badge}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
