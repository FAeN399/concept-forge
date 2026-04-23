import { useEffect, useMemo } from 'react';

import { BlockTypeSchema } from '@/blocks/schema';
import type { BlockType, UnitBlock } from '@/blocks/types';
import { forgeClient, type ForgeRequest } from '@/api/forgeClient';
import { ConceptCanvas } from '@/canvas/ConceptCanvas';
import { LeftRail } from '@/chrome/LeftRail';
import { TopBar } from '@/chrome/TopBar';
import { BattleSandboxPage } from '@/features/battleSandbox/BattleSandboxPage';
import { TweaksPanel } from '@/chrome/TweaksPanel';
import { Inspector } from '@/inspector/Inspector';
import { Planner } from '@/planner/Planner';
import { RawContextDrop } from '@/raw/RawContextDrop';
import { useBlocksStore } from '@/state/useBlocksStore';
import { useDomainStore, type DomainPlannerValue } from '@/state/useDomainStore';
import { useSessionStore } from '@/state/useSessionStore';
import { useStatusStore } from '@/state/useStatusStore';

import styles from './App.module.css';

function hasValue(value: DomainPlannerValue | undefined): boolean {
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return value > 0;
  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object' && value !== null) return Object.values(value).some((item) => hasValue(item as DomainPlannerValue));
  return false;
}

function complexityLabel(value: number): ForgeRequest['preferences']['complexity'] {
  if (value <= 2) return 'low';
  if (value >= 4) return 'high';
  return 'medium';
}

function parseBlockTypes(values: string[]): BlockType[] {
  return values.flatMap((value) => {
    const parsed = BlockTypeSchema.safeParse(value);
    return parsed.success ? [parsed.data] : [];
  });
}

export function App() {
  const activeDomain = useSessionStore((state) => state.activeDomain);
  const workspaceMode = useSessionStore((state) => state.workspaceMode);
  const view = useSessionStore((state) => state.view);
  const theme = useSessionStore((state) => state.theme);
  const density = useSessionStore((state) => state.density);
  const domainInput = useDomainStore((state) => state.domains[activeDomain]);
  const allBlocks = useBlocksStore((state) => state.blocks);
  const setBlocksForDomain = useBlocksStore((state) => state.setBlocksForDomain);
  const blocks = useMemo(
    () => allBlocks.filter((block) => block.domain === activeDomain && block.status !== 'archived'),
    [allBlocks, activeDomain],
  );
  const approvedUnits = useMemo(() => allBlocks.filter((block): block is UnitBlock => (
    block.domain === 'unit' && block.status === 'approved' && block.type === 'unit'
  )), [allBlocks]);
  const status = useStatusStore();
  const showTweaks = useMemo(() => new URLSearchParams(window.location.search).has('tweaks'), []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.density = density;
  }, [theme, density]);

  const generate = async () => {
    if (!domainInput) return;
    const plannerHasContext = Object.values(domainInput.planner).some((value) => hasValue(value as DomainPlannerValue));
    const rawHasContext = domainInput.raw.trim().length > 0;
    const mode: ForgeRequest['mode'] = rawHasContext && plannerHasContext ? 'mixed' : rawHasContext ? 'raw' : 'planner';

    const request: ForgeRequest = {
      domain: activeDomain,
      mode,
      planner: domainInput.planner,
      raw: rawHasContext ? domainInput.raw : null,
      pins: allBlocks.filter((block) => block.pinned),
      existingBlocks: blocks,
      savedSources: [],
      crossDomainRefs: approvedUnits,
      preferences: {
        variation: domainInput.variation,
        complexity: complexityLabel(domainInput.complexity),
        outputStyle: domainInput.outputStyle,
        desiredBlockTypes: parseBlockTypes(domainInput.desiredBlockTypes),
      },
    };

    try {
      status.start('Building request envelope');
      status.progress('Mock backend generating blocks', 2);
      const response = await forgeClient.generate(request);
      status.progress('Validated response schema', 3);
      setBlocksForDomain(activeDomain, response.blocks);
      status.finish(`Loaded ${response.blocks.length} validated blocks`);
    } catch (error) {
      status.fail(error instanceof Error ? error.message : 'Unknown generation error');
    }
  };

  return (
    <div className={styles.app}>
      <LeftRail />
      {workspaceMode === 'battle' ? (
        <BattleSandboxPage />
      ) : (
      <div className={styles.workspace}>
        <TopBar onGenerate={generate} />
        {showTweaks && <TweaksPanel />}
        <main className={styles.main}>
          {view === 'planner' ? <Planner /> : <RawContextDrop onGenerate={generate} />}
          <ConceptCanvas onGenerate={generate} />
          <Inspector />
        </main>
      </div>
      )}
    </div>
  );
}
