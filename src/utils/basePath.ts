export function getBasePath(): string {
  const envBase = import.meta.env.VITE_APP_BASE_PATH || import.meta.env.BASE_URL || '/';

  if (typeof window === 'undefined') {
    return normalizeBase(envBase);
  }

  if (import.meta.env.VITE_APP_BASE_PATH) {
    return normalizeBase(import.meta.env.VITE_APP_BASE_PATH);
  }

  const manifestHref = document
    .querySelector<HTMLLinkElement>('link[rel="manifest"]')
    ?.getAttribute('href');

  if (manifestHref) {
    const manifestUrl = new URL(manifestHref, window.location.href);
    const manifestPath = manifestUrl.pathname.replace(/manifest\.webmanifest$/, '');
    return normalizeBase(manifestPath || '/');
  }

  if (envBase === './' || envBase === '.') {
    const { pathname } = window.location;
    if (pathname.endsWith('/')) {
      return normalizeBase(pathname);
    }

    const segments = pathname.split('/');
    segments.pop();
    const computed = segments.join('/') || '/';
    return normalizeBase(computed);
  }

  return normalizeBase(envBase);
}

function normalizeBase(path: string): string {
  if (!path) {
    return '/';
  }

  let normalized = path.trim();

  if (/^https?:/i.test(normalized)) {
    normalized = new URL(normalized).pathname;
  }

  if (normalized === '.' || normalized === './') {
    normalized = '/';
  }

  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }

  const segments = normalized.split('/').filter(Boolean);

  if (segments.length === 0) {
    return '/';
  }

  return `/${segments.join('/')}/`;
}
