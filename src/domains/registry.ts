import { partyManifest } from './party/manifest';
import { unitManifest } from './unit/manifest';
import type { DomainManifest } from './types';

export const DOMAINS: Record<string, DomainManifest> = {
  party: partyManifest,
  unit: unitManifest,
};

export function getDomain(key: string) {
  return DOMAINS[key];
}

export function requireDomain(key: string) {
  const domain = getDomain(key);
  if (!domain) {
    throw new Error(`Unknown Concept Forge domain: ${key}`);
  }
  return domain;
}

export function listDomains() {
  return Object.values(DOMAINS);
}
