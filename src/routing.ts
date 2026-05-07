export type PageId = 'landing' | 'app';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export function pageHref(page: PageId): string {
  if (page === 'landing') {
    return `${basePath}/` || '/';
  }

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
  const path = routePath().replace(/\/$/, '') || '/';

  if (path === '/' || path === '/landing' || path === '/docs') {
    return 'landing';
  }

  return 'app';
}
