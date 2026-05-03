import { lazy, Suspense } from 'react';
import type { CombatCalculatorProps } from './CombatCalculator';

const LazyCombatCalculator = lazy(() =>
  import('./CombatCalculator').then((module) => ({ default: module.CombatCalculator })),
);

export function DeferredCombatCalculator(props: CombatCalculatorProps) {
  return (
    <Suspense fallback={<section className="panel combat-calculator">Chargement du calculateur...</section>}>
      <LazyCombatCalculator {...props} />
    </Suspense>
  );
}
