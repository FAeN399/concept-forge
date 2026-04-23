import type { Block } from '@/blocks/types';

import styles from './BlockRenderer.module.css';

export function TableBlock({ block }: { block: Block }) {
  if (block.type !== 'table') return null;
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Name</th>
          {block.payload.cols.slice(0, 4).map((col) => <th key={col.key}>{col.label}</th>)}
        </tr>
      </thead>
      <tbody>
        {block.payload.rows.slice(0, 4).map((row) => (
          <tr key={String(row.name)}>
            <td>{String(row.name)}</td>
            {block.payload.cols.slice(0, 4).map((col) => <td key={col.key}>{String(row[col.key] ?? '-')}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
