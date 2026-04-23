import { useStatusStore } from '@/state/useStatusStore';
import { cn } from '@/util/cn';

import styles from './Chrome.module.css';

export function StatusChip() {
  const { status, message } = useStatusStore();
  return (
    <div className={cn(styles.status, status === 'streaming' && styles.statusBusy, status === 'error' && styles.statusError)}>
      <span className={styles.statusDot} />
      {message}
    </div>
  );
}
