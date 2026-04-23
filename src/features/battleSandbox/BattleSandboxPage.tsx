import { BattleCanvas } from './components/BattleCanvas';
import { BattleHud } from './components/BattleHud';
import styles from './BattleSandboxPage.module.css';

export function BattleSandboxPage() {
  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <BattleHud />
      </aside>
      <main className={styles.stage}>
        <BattleCanvas />
      </main>
    </div>
  );
}
