import { useMemo, useState } from 'react';

import { blockTypeLabels } from '@/blocks/renderers';
import { Icon } from '@/chrome/Icon';
import { useBlocksStore } from '@/state/useBlocksStore';

import styles from './Inspector.module.css';
import { ActionsTab } from './tabs/ActionsTab';
import { DetailTab } from './tabs/DetailTab';
import { PayloadTab } from './tabs/PayloadTab';
import { RelatedTab } from './tabs/RelatedTab';

type InspectorTab = 'Detail' | 'Actions' | 'Payload' | 'Related';

export function Inspector() {
  const [activeTab, setActiveTab] = useState<InspectorTab>('Detail');
  const block = useBlocksStore((state) => state.getSelectedBlock());
  const selectBlock = useBlocksStore((state) => state.selectBlock);
  const tabs = useMemo<InspectorTab[]>(() => ['Detail', 'Actions', 'Payload', 'Related'], []);

  if (!block) {
    return (
      <aside className={styles.drawer}>
        <div className={styles.empty}>
          <Icon name="note" size={30} />
          <strong>Select a block</strong>
          <span>Details, actions, payload, and relations appear here.</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className={styles.drawer}>
      <header className={styles.header}>
        <div className={styles.titleLine}>
          <h2 className={styles.title}>{block.title}</h2>
          <button className="iconBtn" onClick={() => selectBlock(null)} title="Close inspector" type="button"><Icon name="x" /></button>
        </div>
        <p className={styles.summary}>{block.summary}</p>
        <div>
          <span className="chip chipAccent">{blockTypeLabels[block.type]}</span>{' '}
          <span className="chip">{block.status}</span>{' '}
          {block.pinned && <span className="chip chipOk">Pinned</span>}
        </div>
      </header>
      <div className={styles.tabs} role="tablist">
        {tabs.map((tab) => (
          <button
            aria-selected={activeTab === tab}
            className={styles.tab}
            key={tab}
            onClick={() => setActiveTab(tab)}
            role="tab"
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>
      <div className={styles.content}>
        {activeTab === 'Detail' && <DetailTab block={block} />}
        {activeTab === 'Actions' && <ActionsTab block={block} />}
        {activeTab === 'Payload' && <PayloadTab block={block} />}
        {activeTab === 'Related' && <RelatedTab block={block} />}
      </div>
    </aside>
  );
}
