import { useMemo, useState } from 'react';
import { TEAM_COLORS } from '../scenarios/defaultScenario';
import { selectArchetypeIds, useBattleSandboxStore } from '../store/useBattleSandboxStore';
import type { TeamId, UnitState } from '../types';
import styles from '../BattleSandboxPage.module.css';

function formatSeconds(value: number): string {
  return `${value.toFixed(1)}s`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(Math.round(value));
}

function clampStringNumber(value: string): number {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
}

function SectionTitle({
  title,
  accent,
}: {
  title: string;
  accent?: string;
}) {
  return (
    <div className={styles.sectionTitle}>
      <span
        className={styles.sectionTitleBar}
        style={accent ? { background: accent } : undefined}
      />
      <h2>{title}</h2>
    </div>
  );
}

function ArmyEditor({ team }: { team: TeamId }) {
  const scenario = useBattleSandboxStore((state) => state.scenario);
  const army = useBattleSandboxStore((state) => state.scenario[team]);
  const updateArmyCount = useBattleSandboxStore((state) => state.updateArmyCount);
  const updateArmySetting = useBattleSandboxStore((state) => state.updateArmySetting);
  const updateArmySpawn = useBattleSandboxStore((state) => state.updateArmySpawn);
  const archetypeIds = selectArchetypeIds(scenario);

  return (
    <section className={styles.panel}>
      <SectionTitle
        title={`${team.toUpperCase()} army`}
        accent={TEAM_COLORS[team]}
      />

      <div className={`${styles.fieldGrid} ${styles.fieldGridThree}`}>
        <label className={styles.fieldLabel}>
          <span>Spawn X</span>
          <input
            className={styles.input}
            type="number"
            step="1"
            value={army.spawn.x}
            onChange={(event) =>
              updateArmySpawn(team, 'x', clampStringNumber(event.target.value))
            }
          />
        </label>
        <label className={styles.fieldLabel}>
          <span>Spawn Z</span>
          <input
            className={styles.input}
            type="number"
            step="1"
            value={army.spawn.z}
            onChange={(event) =>
              updateArmySpawn(team, 'z', clampStringNumber(event.target.value))
            }
          />
        </label>
        <label className={styles.fieldLabel}>
          <span>Spacing</span>
          <input
            className={styles.input}
            type="number"
            step="0.1"
            value={army.spacing}
            onChange={(event) =>
              updateArmySetting(
                team,
                'spacing',
                clampStringNumber(event.target.value),
              )
            }
          />
        </label>
      </div>

      <div className={styles.fieldGrid}>
        <label className={styles.fieldLabel}>
          <span>Columns</span>
          <input
            className={styles.input}
            type="number"
            min="1"
            step="1"
            value={army.columns}
            onChange={(event) =>
              updateArmySetting(
                team,
                'columns',
                clampStringNumber(event.target.value),
              )
            }
          />
        </label>
      </div>

      <div className={styles.armyUnitGrid}>
        {archetypeIds.map((archetypeId) => (
          <label className={styles.fieldLabel} key={archetypeId}>
            <span>{scenario.archetypes[archetypeId]?.label ?? archetypeId}</span>
            <input
              className={styles.input}
              type="number"
              min="0"
              step="1"
              value={army.units[archetypeId] ?? 0}
              onChange={(event) =>
                updateArmyCount(
                  team,
                  archetypeId,
                  clampStringNumber(event.target.value),
                )
              }
            />
          </label>
        ))}
      </div>
    </section>
  );
}

function SelectedUnitPanel({ unit }: { unit: UnitState | null }) {
  return (
    <section className={styles.panel}>
      <SectionTitle title="Selected unit" />

      {unit ? (
        <div className={styles.selectedUnitCard}>
          <div className={`${styles.metricGrid} ${styles.metricGridTwo}`}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>ID</span>
              <strong>{unit.id}</strong>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Team</span>
              <strong>{unit.team}</strong>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Type</span>
              <strong>{unit.archetypeLabel}</strong>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>HP</span>
              <strong>
                {Math.round(unit.health)} / {unit.maxHealth}
              </strong>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Target</span>
              <strong>{unit.targetId ?? '—'}</strong>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Cooldown</span>
              <strong>{unit.cooldownRemaining.toFixed(2)}s</strong>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Damage dealt</span>
              <strong>{formatNumber(unit.damageDealt)}</strong>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Damage taken</span>
              <strong>{formatNumber(unit.damageTaken)}</strong>
            </div>
          </div>
        </div>
      ) : (
        <p className={styles.muted}>
          Click a unit in the arena to inspect it.
        </p>
      )}
    </section>
  );
}

function ScenarioJsonPanel() {
  const scenario = useBattleSandboxStore((state) => state.scenario);
  const importScenario = useBattleSandboxStore((state) => state.importScenario);
  const importError = useBattleSandboxStore((state) => state.importError);
  const [editorValue, setEditorValue] = useState(
    JSON.stringify(scenario, null, 2),
  );
  const [clipboardError, setClipboardError] = useState<string | null>(null);

  const currentJson = useMemo(
    () => JSON.stringify(scenario, null, 2),
    [scenario],
  );

  async function copyCurrentScenario() {
    try {
      await navigator.clipboard.writeText(currentJson);
      setClipboardError(null);
    } catch {
      setClipboardError('Clipboard access failed. Copy manually from the editor.');
    }
  }

  function handleImport() {
    importScenario(editorValue);
  }

  return (
    <section className={styles.panel}>
      <SectionTitle title="Scenario JSON" />
      <div className={styles.buttonRow}>
        <button type="button" onClick={() => setEditorValue(currentJson)}>
          Load current
        </button>
        <button type="button" onClick={copyCurrentScenario}>
          Copy current
        </button>
        <button type="button" onClick={handleImport}>
          Import JSON
        </button>
      </div>
      <textarea
        className={styles.textarea}
        value={editorValue}
        onChange={(event) => setEditorValue(event.target.value)}
        spellCheck={false}
      />
      {clipboardError ? <p className={styles.errorText}>{clipboardError}</p> : null}
      {importError ? <p className={styles.errorText}>{importError}</p> : null}
    </section>
  );
}

export function BattleHud() {
  const scenario = useBattleSandboxStore((state) => state.scenario);
  const runtime = useBattleSandboxStore((state) => state.runtime);
  const playbackSpeed = useBattleSandboxStore((state) => state.playbackSpeed);
  const view = useBattleSandboxStore((state) => state.view);
  const selectedUnitId = useBattleSandboxStore((state) => state.selectedUnitId);

  const start = useBattleSandboxStore((state) => state.start);
  const pause = useBattleSandboxStore((state) => state.pause);
  const reset = useBattleSandboxStore((state) => state.reset);
  const stepOneTick = useBattleSandboxStore((state) => state.stepOneTick);
  const randomizeSeed = useBattleSandboxStore((state) => state.randomizeSeed);
  const setPlaybackSpeed = useBattleSandboxStore((state) => state.setPlaybackSpeed);
  const updateScenarioName = useBattleSandboxStore(
    (state) => state.updateScenarioName,
  );
  const updateSeed = useBattleSandboxStore((state) => state.updateSeed);
  const updateArena = useBattleSandboxStore((state) => state.updateArena);
  const toggleViewOption = useBattleSandboxStore(
    (state) => state.toggleViewOption,
  );

  const selectedUnit =
    runtime.units.find((unit) => unit.id === selectedUnitId) ?? null;

  const actionLabel =
    runtime.phase === 'running'
      ? 'Pause'
      : runtime.phase === 'finished'
        ? 'Replay'
        : 'Start';

  return (
    <div className={styles.sidebarInner}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Three.js battle test arena</p>
        <h1>Battle Sandbox</h1>
        <p className={styles.muted}>
          Tune armies, replay deterministic fights, inspect units, and validate
          combat behavior before moving into polished content.
        </p>
      </header>

      <section className={styles.panel}>
        <SectionTitle title="Battle controls" />
        <div className={`${styles.fieldGrid} ${styles.fieldGridTwo}`}>
          <label className={styles.fieldLabel}>
            <span>Scenario name</span>
            <input
              className={styles.input}
              value={scenario.name}
              onChange={(event) => updateScenarioName(event.target.value)}
            />
          </label>
          <label className={styles.fieldLabel}>
            <span>Seed</span>
            <input
              className={styles.input}
              type="number"
              value={scenario.seed}
              onChange={(event) => updateSeed(clampStringNumber(event.target.value))}
            />
          </label>
        </div>

        <div className={styles.buttonRow}>
          <button
            type="button"
            onClick={runtime.phase === 'running' ? pause : start}
          >
            {actionLabel}
          </button>
          <button type="button" onClick={stepOneTick}>
            Step
          </button>
          <button type="button" onClick={reset}>
            Reset
          </button>
          <button type="button" onClick={randomizeSeed}>
            New seed
          </button>
        </div>

        <label className={styles.sliderRow}>
          <span>Playback speed</span>
          <input
            className={styles.input}
            type="range"
            min="0.25"
            max="4"
            step="0.25"
            value={playbackSpeed}
            onChange={(event) =>
              setPlaybackSpeed(clampStringNumber(event.target.value))
            }
          />
          <strong>{playbackSpeed.toFixed(2)}x</strong>
        </label>
      </section>

      <section className={styles.panel}>
        <SectionTitle title="Battle metrics" />
        <div className={`${styles.metricGrid} ${styles.metricGridTwo}`}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Elapsed</span>
            <strong>{formatSeconds(runtime.metrics.elapsedSeconds)}</strong>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Result</span>
            <strong>
              {runtime.metrics.winner === null
                ? runtime.phase
                : runtime.metrics.winner}
            </strong>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Blue alive</span>
            <strong>
              {runtime.metrics.blue.alive} / {runtime.metrics.blue.total}
            </strong>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Red alive</span>
            <strong>
              {runtime.metrics.red.alive} / {runtime.metrics.red.total}
            </strong>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Blue damage</span>
            <strong>{formatNumber(runtime.metrics.blue.damageDealt)}</strong>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Red damage</span>
            <strong>{formatNumber(runtime.metrics.red.damageDealt)}</strong>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Blue kills</span>
            <strong>{runtime.metrics.blue.kills}</strong>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Red kills</span>
            <strong>{runtime.metrics.red.kills}</strong>
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <SectionTitle title="Arena & view" />
        <div className={`${styles.fieldGrid} ${styles.fieldGridTwo}`}>
          <label className={styles.fieldLabel}>
            <span>Arena width</span>
            <input
              className={styles.input}
              type="number"
              value={scenario.arena.width}
              onChange={(event) =>
                updateArena('width', clampStringNumber(event.target.value))
              }
            />
          </label>
          <label className={styles.fieldLabel}>
            <span>Arena depth</span>
            <input
              className={styles.input}
              type="number"
              value={scenario.arena.depth}
              onChange={(event) =>
                updateArena('depth', clampStringNumber(event.target.value))
              }
            />
          </label>
        </div>

        <div className={styles.checkboxGrid}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={view.showGrid}
              onChange={() => toggleViewOption('showGrid')}
            />
            <span>Show grid</span>
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={view.showRanges}
              onChange={() => toggleViewOption('showRanges')}
            />
            <span>Show selected range</span>
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={view.showHealthBars}
              onChange={() => toggleViewOption('showHealthBars')}
            />
            <span>Show health bars</span>
          </label>
        </div>
      </section>

      <ArmyEditor team="blue" />
      <ArmyEditor team="red" />
      <SelectedUnitPanel unit={selectedUnit} />
      {scenario.sourceBlocks.length > 0 || scenario.mappingNotes.length > 0 ? (
        <section className={styles.panel}>
          <SectionTitle title="Concept Forge mapping" />
          {scenario.sourceBlocks.length > 0 ? (
            <ul className={styles.noteList}>
              {scenario.sourceBlocks.map((source) => (
                <li key={source.id}>
                  <strong>{source.title}</strong>
                  <p className={styles.muted}>{source.domain} / {source.type} / {source.status}</p>
                </li>
              ))}
            </ul>
          ) : null}
          {scenario.mappingNotes.length > 0 ? (
            <ul className={styles.noteList}>
              {scenario.mappingNotes.map((note) => (
                <li key={`${note.level}-${note.blockId ?? 'scenario'}-${note.message}`}>
                  <strong>{note.level}</strong>
                  <p className={styles.muted}>{note.message}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
      <ScenarioJsonPanel />

      <section className={styles.panel}>
        <SectionTitle title="Recent combat events" />
        {runtime.log.length === 0 ? (
          <p className={styles.muted}>No events yet.</p>
        ) : (
          <ul className={styles.logList}>
            {[...runtime.log].reverse().map((entry) => (
              <li key={entry.id}>
                <span className={styles.logTime}>{formatSeconds(entry.time)}</span>
                <span>{entry.text}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
