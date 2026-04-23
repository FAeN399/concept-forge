import type { ReactNode } from 'react';

import styles from '../Inspector.module.css';

export function DetailGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.group}>
      <span className={styles.label}>{label}</span>
      <div>{children}</div>
    </div>
  );
}

export function TextList({ items }: { items: string[] }) {
  return <ul className={styles.list}>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}
