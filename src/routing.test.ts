import { afterEach, describe, expect, it } from 'vitest';
import { pageHref, resolvePage } from './routing';

describe('routing helpers', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('builds app route hrefs from the configured base path', () => {
    expect(pageHref('app')).toBe('/app');
  });

  it('keeps every public path on the mobile app', () => {
    window.history.pushState({}, '', '/');

    expect(resolvePage()).toBe('app');

    window.history.pushState({}, '', '/app');
    expect(resolvePage()).toBe('app');

    window.history.pushState({}, '', '/mobile');
    expect(resolvePage()).toBe('app');

    window.history.pushState({}, '', '/landing');
    expect(resolvePage()).toBe('app');

    window.history.pushState({}, '', '/docs');
    expect(resolvePage()).toBe('app');
  });

  it('resolves GitHub Pages redirect query paths to the mobile app', () => {
    window.history.pushState({}, '', '/?path=/docs');

    expect(resolvePage()).toBe('app');
  });
});
