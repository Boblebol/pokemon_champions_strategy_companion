import { describe, expect, it, vi } from 'vitest';
import manifestSource from '../public/manifest.webmanifest?raw';
import serviceWorkerSource from '../public/sw.js?raw';
import { registerServiceWorker } from './pwa';

describe('registerServiceWorker', () => {
  it('registers the service worker after the window load event', async () => {
    const register = vi.fn().mockResolvedValue(undefined);
    let loadHandler: (() => void) | undefined;

    const result = registerServiceWorker({
      navigatorLike: {
        serviceWorker: { register },
      },
      windowLike: {
        addEventListener(event, handler) {
          if (event === 'load') {
            loadHandler = handler;
          }
        },
      },
      swUrl: '/sw.js',
      scope: '/',
    });

    expect(result).toBe('scheduled');
    expect(register).not.toHaveBeenCalled();

    loadHandler?.();
    await Promise.resolve();

    expect(register).toHaveBeenCalledWith('/sw.js', { scope: '/' });
  });

  it('does not schedule registration when service workers are unavailable', () => {
    const addEventListener = vi.fn();

    const result = registerServiceWorker({
      navigatorLike: {},
      windowLike: { addEventListener },
      swUrl: '/sw.js',
      scope: '/',
    });

    expect(result).toBe('unsupported');
    expect(addEventListener).not.toHaveBeenCalled();
  });
});

describe('mobile-only PWA shell', () => {
  it('starts and shortcuts into the mobile app only', () => {
    const manifest = JSON.parse(manifestSource) as {
      start_url: string;
      shortcuts: Array<{ name: string; short_name: string; url: string }>;
    };

    expect(manifest.start_url).toBe('./app');
    expect(manifest.shortcuts.map((shortcut) => shortcut.url)).toEqual(['./app']);
    expect(manifestSource).not.toContain('./landing');
    expect(manifestSource).not.toContain('./docs');
  });

  it('pre-caches only the mobile app shell routes', () => {
    expect(serviceWorkerSource).toContain("'./app'");
    expect(serviceWorkerSource).not.toContain("'./landing'");
    expect(serviceWorkerSource).not.toContain("'./docs'");
  });
});
