import { Icon } from '@/chrome/Icon';
import { listDomains } from '@/domains/registry';
import { useBlocksStore } from '@/state/useBlocksStore';
import { useSessionStore } from '@/state/useSessionStore';
import { cn } from '@/util/cn';

import styles from './Chrome.module.css';

export function LeftRail() {
  const activeDomain = useSessionStore((state) => state.activeDomain);
  const workspaceMode = useSessionStore((state) => state.workspaceMode);
  const setActiveDomain = useSessionStore((state) => state.setActiveDomain);
  const setWorkspaceMode = useSessionStore((state) => state.setWorkspaceMode);
  const selectBlock = useBlocksStore((state) => state.selectBlock);

  return (
    <aside className={styles.leftRail} aria-label="Domains">
      <div className={styles.brand} title="Concept Forge">
        <Icon name="logo" size={30} />
      </div>
      <nav>
        {listDomains().filter((domain) => domain.installed).map((domain) => (
          <button
            aria-label={domain.name}
            className={cn(styles.domainButton, workspaceMode === 'forge' && activeDomain === domain.key && styles.domainButtonActive)}
            key={domain.key}
            onClick={() => {
              setActiveDomain(domain.key);
              selectBlock(null);
            }}
            title={domain.name}
            type="button"
          >
            <Icon name={domain.icon} size={22} />
            <span>{domain.name}</span>
          </button>
        ))}
        <button
          aria-label="Battle Sandbox"
          className={cn(styles.domainButton, workspaceMode === 'battle' && styles.domainButtonActive)}
          onClick={() => {
            setWorkspaceMode('battle');
            selectBlock(null);
          }}
          title="Battle Sandbox"
          type="button"
        >
          <Icon name="target" size={22} />
          <span>Battle Sandbox</span>
        </button>
      </nav>
    </aside>
  );
}
