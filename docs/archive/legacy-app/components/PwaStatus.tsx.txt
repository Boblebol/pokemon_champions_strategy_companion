import { useEffect, useState } from 'react';

function readOnlineStatus(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

export function PwaStatus({ isOnline }: { isOnline?: boolean }) {
  const [detectedOnline, setDetectedOnline] = useState(readOnlineStatus);
  const online = isOnline ?? detectedOnline;

  useEffect(() => {
    if (isOnline !== undefined) {
      return undefined;
    }

    function handleOnline() {
      setDetectedOnline(true);
    }

    function handleOffline() {
      setDetectedOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  return (
    <section className="pwa-status" aria-label="Statut PWA">
      <div>
        <strong>Installable sans store</strong>
        <span>Ajoute l'app à l'écran d'accueil pour garder le cockpit local sous la main.</span>
      </div>
      <p aria-live="polite">
        {online ? 'Mode en ligne : refresh Smogon disponible.' : 'Hors ligne : données locales conservées.'}
      </p>
    </section>
  );
}
