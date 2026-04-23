import { nanoid } from 'nanoid';

export function createId(prefix = 'cf') {
  return `${prefix}_${nanoid(8)}`;
}
