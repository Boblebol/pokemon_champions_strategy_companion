import { afterEach, describe, expect, it } from 'vitest';
import { pageHref, resolvePage } from './routing';

describe('routing helpers', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('builds app route hrefs from the configured base path', () => {
    expect(pageHref('app')).toBe('/app');
    expect(pageHref('docs')).toBe('/docs');
    expect(pageHref('landing')).toBe('/landing');
  });

  it('resolves GitHub Pages redirect query paths before the browser path', () => {
    window.history.pushState({}, '', '/?path=/docs');

    expect(resolvePage()).toBe('docs');
  });
});
