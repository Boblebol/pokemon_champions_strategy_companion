export type PageId = 'landing' | 'app' | 'docs';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export function pageHref(page: PageId): string {
  return `${basePath}/${page}` || `/${page}`;
}

function routePath(): string {
  const redirectedPath = new URLSearchParams(window.location.search).get('path');
  const currentPath = redirectedPath ?? window.location.pathname;

  if (basePath && currentPath.startsWith(basePath)) {
    return currentPath.slice(basePath.length) || '/';
  }

  return currentPath;
}

export function resolvePage(): PageId {
  const path = routePath().replace(/\/$/, '');

  if (path.endsWith('/docs')) {
    return 'docs';
  }

  if (path.endsWith('/landing')) {
    return 'landing';
  }

  if (path.endsWith('/app')) {
    return 'app';
  }

  return import.meta.env.DEV ? 'app' : 'landing';
}
