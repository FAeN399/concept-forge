import type { BlockType } from '@/blocks/types';
import { blockTypeLabels } from '@/blocks/renderers';
import { Icon } from '@/chrome/Icon';
import { requireDomain } from '@/domains/registry';
import type { ContextType } from '@/domains/types';
import { useDomainStore } from '@/state/useDomainStore';
import { useSessionStore } from '@/state/useSessionStore';

import styles from './RawContextDrop.module.css';

type RawContextDropProps = {
  onGenerate: () => void;
};

const outputStyles = ['practical', 'exploratory', 'unusual'] as const;

function wordCount(text: string) {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
}

export function RawContextDrop({ onGenerate }: RawContextDropProps) {
  const activeDomain = useSessionStore((state) => state.activeDomain);
  const manifest = requireDomain(activeDomain);
  const domainInput = useDomainStore((state) => state.domains[activeDomain]);
  const setRaw = useDomainStore((state) => state.setRaw);
  const setContextType = useDomainStore((state) => state.setContextType);
  const setOutputStyle = useDomainStore((state) => state.setOutputStyle);
  const setVariation = useDomainStore((state) => state.setVariation);
  const setComplexity = useDomainStore((state) => state.setComplexity);
  const setDesiredBlockTypes = useDomainStore((state) => state.setDesiredBlockTypes);
  const setSaveSource = useDomainStore((state) => state.setSaveSource);

  if (!domainInput) return null;

  const toggleType = (type: BlockType) => {
    const desired = domainInput.desiredBlockTypes.includes(type)
      ? domainInput.desiredBlockTypes.filter((item) => item !== type)
      : [...domainInput.desiredBlockTypes, type];
    setDesiredBlockTypes(activeDomain, desired);
  };

  const questionCount = (domainInput.raw.match(/\?/g) ?? []).length;

  return (
    <aside className={styles.panel}>
      <header className={styles.header}>
        <div className={styles.title}>Raw Context</div>
        <span className="chip">Paste notes, chat logs, specs, or mixed scraps.</span>
      </header>
      <div className={styles.body}>
        <textarea
          autoFocus
          className={`field mono ${styles.textarea}`}
          onChange={(event) => setRaw(activeDomain, event.target.value)}
          placeholder="Drop rough notes here..."
          value={domainInput.raw}
        />

        <div className={styles.row}>
          <span className="label">Context type</span>
          <div className="segmented">
            {manifest.acceptedContextTypes.map((type) => (
              <button
                aria-pressed={domainInput.contextType === type}
                className="segment"
                key={type}
                onClick={() => setContextType(activeDomain, type as ContextType)}
                type="button"
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.row}>
          <span className="label">Output style</span>
          <div className="segmented">
            {outputStyles.map((style) => (
              <button
                aria-pressed={domainInput.outputStyle === style}
                className="segment"
                key={style}
                onClick={() => setOutputStyle(activeDomain, style)}
                type="button"
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <label className={styles.row}>
          <span className="label">Variation</span>
          <div className={styles.slider}>
            <input max={5} min={1} onChange={(event) => setVariation(activeDomain, Number(event.target.value))} type="range" value={domainInput.variation} />
            <span className="chip">{domainInput.variation}</span>
          </div>
        </label>

        <label className={styles.row}>
          <span className="label">Complexity</span>
          <div className={styles.slider}>
            <input max={5} min={1} onChange={(event) => setComplexity(activeDomain, Number(event.target.value))} type="range" value={domainInput.complexity} />
            <span className="chip">{domainInput.complexity}</span>
          </div>
        </label>

        <div className={styles.row}>
          <span className="label">Desired block types</span>
          <div className={styles.tags}>
            {manifest.outputBlockTypes.map((type) => (
              <button
                className={domainInput.desiredBlockTypes.includes(type) ? 'chip chipAccent' : 'chip'}
                key={type}
                onClick={() => toggleType(type)}
                type="button"
              >
                {blockTypeLabels[type]}
              </button>
            ))}
          </div>
        </div>

        <label className={styles.check}>
          <input checked={domainInput.saveSource} onChange={(event) => setSaveSource(activeDomain, event.target.checked)} type="checkbox" />
          Save as reusable source
        </label>

        <button className="btn btnPrimary" onClick={onGenerate} type="button">
          <Icon name="wand" />
          Generate from raw context
        </button>
      </div>
      <footer className={styles.footer}>
        <span>{wordCount(domainInput.raw)} words</span>
        <span>{domainInput.raw.length} chars</span>
        {questionCount > 0 && <span className="chip chipAccent">{questionCount} open questions detected</span>}
      </footer>
    </aside>
  );
}
