import { describe, expect, it, vi } from 'vitest';
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
