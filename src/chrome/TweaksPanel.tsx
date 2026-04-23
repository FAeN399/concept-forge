import { THEMES, useSessionStore, type DensityId } from '@/state/useSessionStore';

const DENSITIES: ReadonlyArray<{ id: DensityId; label: string }> = [
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'compact', label: 'Compact' },
];

export function TweaksPanel() {
  const theme = useSessionStore((state) => state.theme);
  const density = useSessionStore((state) => state.density);
  const setTheme = useSessionStore((state) => state.setTheme);
  const setDensity = useSessionStore((state) => state.setDensity);

  return (
    <div className="tweaks-panel">
      <div style={{ marginBottom: 10 }}>
        <div className="overline" style={{ marginBottom: 5 }}>Prototype</div>
        <div style={{ fontWeight: 600, fontSize: 13 }}>Tweaks</div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div className="overline" style={{ marginBottom: 6 }}>Interface theme</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
          {THEMES.map((item) => (
            <button
              key={item.id}
              onClick={() => setTheme(item.id)}
              className={theme === item.id ? 'btn primary sm' : 'btn sm'}
              style={{ justifyContent: 'center' }}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="overline" style={{ marginBottom: 6 }}>Density</div>
        <div className="segmented" style={{ width: '100%' }}>
          {DENSITIES.map((item) => (
            <button
              aria-pressed={density === item.id}
              className="segment"
              key={item.id}
              onClick={() => setDensity(item.id)}
              style={{ flex: 1 }}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
