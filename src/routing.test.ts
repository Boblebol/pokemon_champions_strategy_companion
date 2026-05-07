import { afterEach, describe, expect, it } from 'vitest';
import { pageHref, resolvePage } from './routing';

describe('routing helpers', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('builds app route hrefs from the configured base path', () => {
    expect(pageHref('app')).toBe('/app');
    expect(pageHref('landing')).toBe('/');
  });

  it('routes GitHub Pages root and install docs to the landing page', () => {
    window.history.pushState({}, '', '/');
    expect(resolvePage()).toBe('landing');

    window.history.pushState({}, '', '/landing');
    expect(resolvePage()).toBe('landing');

    window.history.pushState({}, '', '/docs');
    expect(resolvePage()).toBe('landing');

    window.history.pushState({}, '', '/?path=/docs');
    expect(resolvePage()).toBe('landing');
  });

  it('keeps app routes on the mobile PWA shell', () => {
    window.history.pushState({}, '', '/app');
    expect(resolvePage()).toBe('app');

    window.history.pushState({}, '', '/mobile');
    expect(resolvePage()).toBe('app');
  });
});
