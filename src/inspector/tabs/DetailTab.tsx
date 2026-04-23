import type { Block } from '@/blocks/types';

import { AbilityKitDetail } from '../details/AbilityKitDetail';
import { ArchetypeDetail } from '../details/ArchetypeDetail';
import { BehaviorScriptDetail } from '../details/BehaviorScriptDetail';
import { CounterMatrixDetail } from '../details/CounterMatrixDetail';
import { FlowDetail } from '../details/FlowDetail';
import { FormationDetail } from '../details/FormationDetail';
import { FormationFitDetail } from '../details/FormationFitDetail';
import { GraphDetail } from '../details/GraphDetail';
import { NoteDetail } from '../details/NoteDetail';
import { RiskNoteDetail } from '../details/RiskNoteDetail';
import { StatProfileDetail } from '../details/StatProfileDetail';
import { SynergyLinksDetail } from '../details/SynergyLinksDetail';
import { TableDetail } from '../details/TableDetail';
import { TradeoffDetail } from '../details/TradeoffDetail';
import { UnitDetail } from '../details/UnitDetail';
import { UpgradePathDetail } from '../details/UpgradePathDetail';

export function DetailTab({ block }: { block: Block }) {
  switch (block.type) {
    case 'archetype':
      return <ArchetypeDetail block={block} />;
    case 'unit':
      return <UnitDetail block={block} />;
    case 'formation':
      return <FormationDetail block={block} />;
    case 'abilityKit':
      return <AbilityKitDetail block={block} />;
    case 'statProfile':
      return <StatProfileDetail block={block} />;
    case 'graph':
      return <GraphDetail block={block} />;
    case 'table':
      return <TableDetail block={block} />;
    case 'flow':
      return <FlowDetail block={block} />;
    case 'tradeoff':
      return <TradeoffDetail block={block} />;
    case 'counterMatrix':
      return <CounterMatrixDetail block={block} />;
    case 'upgradePath':
      return <UpgradePathDetail block={block} />;
    case 'formationFit':
      return <FormationFitDetail block={block} />;
    case 'synergyLinks':
      return <SynergyLinksDetail block={block} />;
    case 'behaviorScript':
      return <BehaviorScriptDetail block={block} />;
    case 'riskNote':
      return <RiskNoteDetail block={block} />;
    case 'note':
      return <NoteDetail block={block} />;
  }
}
