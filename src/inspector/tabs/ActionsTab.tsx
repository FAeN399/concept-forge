import type { Block } from '@/blocks/types';
import { Icon } from '@/chrome/Icon';
import { buildScenarioFromConceptForgeBlocks } from '@/features/battleSandbox/adapters/fromConceptForgeBlocks';
import { useBattleSandboxStore } from '@/features/battleSandbox/store/useBattleSandboxStore';
import { useBlocksStore } from '@/state/useBlocksStore';
import { useSessionStore } from '@/state/useSessionStore';

import styles from '../Inspector.module.css';

function DeferredAction({ name, milestone }: { name: string; milestone: string }) {
  return (
    <div className={styles.actionRow}>
      <div>
        <strong>{name}</strong>
        <p>Coming in {milestone}.</p>
      </div>
      <button className="btn" disabled type="button">Soon</button>
    </div>
  );
}

function addBlock(map: Map<string, Block>, block: Block): void {
  map.set(block.id, block);
}

function collectBattleSourceBlocks(block: Block, blocks: Block[]): Block[] {
  const selected = new Map<string, Block>();
  addBlock(selected, block);

  if (block.type === 'unit') {
    blocks.forEach((candidate) => {
      const referencesUnit = candidate.relations.some((relation) => relation.to === block.id);
      if (referencesUnit) {
        addBlock(selected, candidate);
      }
      if (candidate.type === 'statProfile' && candidate.payload.unitName === block.title) {
        addBlock(selected, candidate);
      }
      if (candidate.type === 'behaviorScript' && candidate.payload.unitName === block.title) {
        addBlock(selected, candidate);
      }
    });
  }

  if (block.type === 'formation' || block.type === 'archetype') {
    blocks.forEach((candidate) => {
      if (candidate.type === 'unit' && candidate.status === 'approved') {
        addBlock(selected, candidate);
      }
      if (candidate.type === 'statProfile' || candidate.type === 'behaviorScript') {
        const hasApprovedUnit = blocks.some((unitBlock) => (
          unitBlock.type === 'unit'
          && unitBlock.status === 'approved'
          && unitBlock.title === candidate.payload.unitName
        ));
        if (hasApprovedUnit) {
          addBlock(selected, candidate);
        }
      }
    });
  }

  return Array.from(selected.values());
}

export function ActionsTab({ block }: { block: Block }) {
  const dispatch = useBlocksStore((state) => state.dispatchBlockAction);
  const blocks = useBlocksStore((state) => state.blocks);
  const loadScenario = useBattleSandboxStore((state) => state.loadScenario);
  const setWorkspaceMode = useSessionStore((state) => state.setWorkspaceMode);
  const canTestInBattle = block.type === 'unit' || block.type === 'formation' || block.type === 'archetype';

  function testInBattleSandbox() {
    const scenario = buildScenarioFromConceptForgeBlocks(
      collectBattleSourceBlocks(block, blocks),
      {
        scenarioName: `Battle test - ${block.title}`,
        seed: 4242,
        includeDraftUnits: block.type === 'unit',
      },
    );
    loadScenario(scenario);
    setWorkspaceMode('battle');
  }

  return (
    <div className={styles.actionList}>
      <div className={styles.actionRow}>
        <div><strong>Pin</strong><p>Keep this block prominent in generation context.</p></div>
        <button className="btn" onClick={() => dispatch({ kind: 'pin', id: block.id })} type="button"><Icon name="pin" />{block.pinned ? 'Unpin' : 'Pin'}</button>
      </div>
      <div className={styles.actionRow}>
        <div><strong>Approve</strong><p>Mark this block as accepted for downstream use.</p></div>
        <button className="btn" onClick={() => dispatch({ kind: 'approve', id: block.id })} type="button"><Icon name="approve" />Approve</button>
      </div>
      <div className={styles.actionRow}>
        <div><strong>Duplicate</strong><p>Create a local draft copy linked to this source.</p></div>
        <button className="btn" onClick={() => dispatch({ kind: 'duplicate', id: block.id })} type="button"><Icon name="duplicate" />Duplicate</button>
      </div>
      <div className={styles.actionRow}>
        <div><strong>Compare</strong><p>Add this block to the local comparison set.</p></div>
        <button className="btn" onClick={() => dispatch({ kind: 'compareAdd', id: block.id })} type="button"><Icon name="compare" />Compare</button>
      </div>
      {block.type === 'unit' && (
        <div className={styles.actionRow}>
          <div><strong>Send to Party Lab</strong><p>Approves this unit and makes it a Party Lab class suggestion.</p></div>
          <button className="btn" onClick={() => dispatch({ kind: 'sendToDomain', id: block.id, targetDomain: 'party' })} type="button"><Icon name="send" />Send</button>
        </div>
      )}
      {canTestInBattle && (
        <div className={styles.actionRow}>
          <div><strong>Test in Battle Sandbox</strong><p>Build a validated deterministic scenario from this block and related approved units.</p></div>
          <button className="btn" onClick={testInBattleSandbox} type="button"><Icon name="target" />Test</button>
        </div>
      )}
      <div className={styles.actionRow}>
        <div><strong>Archive</strong><p>Remove this block from the active canvas.</p></div>
        <button className="btn" onClick={() => dispatch({ kind: 'archive', id: block.id })} type="button"><Icon name="archive" />Archive</button>
      </div>
      <DeferredAction name="Convert view" milestone="M2" />
      <DeferredAction name="Remix" milestone="M4" />
      <DeferredAction name="Variant" milestone="M4" />
    </div>
  );
}
