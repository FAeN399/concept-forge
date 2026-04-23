import type { CanvasLayoutMode } from '@/domains/types';
import { requireDomain } from '@/domains/registry';
import { THEMES, useSessionStore, type WorkspaceView } from '@/state/useSessionStore';

import { Icon } from './Icon';
import { StatusChip } from './StatusChip';
import styles from './Chrome.module.css';

type TopBarProps = {
  onGenerate: () => void;
};

const layouts: CanvasLayoutMode[] = ['free', 'grid', 'compare'];
const views: WorkspaceView[] = ['planner', 'raw'];

export function TopBar({ onGenerate }: TopBarProps) {
  const activeDomain = useSessionStore((state) => state.activeDomain);
  const view = useSessionStore((state) => state.view);
  const setView = useSessionStore((state) => state.setView);
  const layout = useSessionStore((state) => state.layoutByDomain[activeDomain]);
  const setLayout = useSessionStore((state) => state.setLayout);
  const theme = useSessionStore((state) => state.theme);
  const setTheme = useSessionStore((state) => state.setTheme);
  const domain = requireDomain(activeDomain);

  return (
    <header className={styles.topBar}>
      <div className={styles.titleBlock}>
        <div className={styles.domainName}>{domain.name}</div>
        <div className={styles.domainDescription}>{domain.description}</div>
      </div>

      <div className="segmented" aria-label="Input mode">
        {views.map((item) => (
          <button
            aria-pressed={view === item}
            className="segment"
            key={item}
            onClick={() => setView(item)}
            type="button"
          >
            {item === 'planner' ? 'Planner' : 'Raw'}
          </button>
        ))}
      </div>

      <div className="segmented" aria-label="Canvas layout">
        {layouts.map((item) => (
          <button
            aria-pressed={layout === item}
            className="segment"
            key={item}
            onClick={() => setLayout(activeDomain, item)}
            type="button"
          >
            {item[0]?.toUpperCase()}{item.slice(1)}
          </button>
        ))}
      </div>

      <div className="segmented" aria-label="Theme">
        {THEMES.map((item) => (
          <button
            aria-pressed={theme === item.id}
            className="segment"
            key={item.id}
            onClick={() => setTheme(item.id)}
            title={item.label}
            type="button"
          >
            {item.short}
          </button>
        ))}
      </div>

      <div className={styles.barGroup}>
        <StatusChip />
        <button className="btn btnPrimary" onClick={onGenerate} type="button">
          <Icon name="wand" />
          Generate
        </button>
      </div>
    </header>
  );
}
