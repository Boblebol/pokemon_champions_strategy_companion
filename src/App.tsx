import { lazy, Suspense } from 'react';

const MobileAppPage = lazy(() => import('./routes/MobileAppPage'));

export default function App() {
  return (
    <Suspense fallback={<main className="mockup-mobile-shell">Chargement...</main>}>
      <MobileAppPage />
    </Suspense>
  );
}
