import type { ReferenceSnapshot } from '../domain/types';

let cachedReferenceSnapshot: Promise<ReferenceSnapshot> | undefined;

export function getPkmnReferenceSnapshot(): Promise<ReferenceSnapshot> {
  cachedReferenceSnapshot ??= import('./generated/pkmnReferenceSnapshot').then(
    (module) => module.pkmnReferenceSnapshot,
  );
  return cachedReferenceSnapshot;
}
