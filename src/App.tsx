import { lazy, Suspense } from 'react';
import { resolvePage } from './routing';

const LandingPage = lazy(() => import('./routes/LandingPage'));
const MobileAppPage = lazy(() => import('./routes/MobileAppPage'));

export default function App() {
  const page = resolvePage();

  return (
    <Suspense fallback={<main className="route-loading">Chargement...</main>}>
      {page === 'landing' ? <LandingPage /> : null}
      {page === 'app' ? <MobileAppPage /> : null}
    </Suspense>
  );
}
