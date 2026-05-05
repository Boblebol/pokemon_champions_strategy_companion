import { lazy, Suspense } from 'react';
import { resolvePage } from './routing';

const LandingPage = lazy(() => import('./routes/LandingPage'));
const DocsPage = lazy(() => import('./routes/DocsPage'));
const MobileAppPage = lazy(() => import('./routes/MobileAppPage'));

export default function App() {
  const page = resolvePage();

  return (
    <Suspense fallback={<main className="app-shell">Chargement...</main>}>
      {page === 'docs' ? <DocsPage /> : null}
      {page === 'landing' ? <LandingPage /> : null}
      {page === 'app' || page === 'mobile' ? <MobileAppPage /> : null}
    </Suspense>
  );
}
