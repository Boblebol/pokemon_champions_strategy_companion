type ServiceWorkerContainerLike = {
  register(scriptURL: string | URL, options?: RegistrationOptions): Promise<unknown>;
};

type NavigatorLike = {
  serviceWorker?: ServiceWorkerContainerLike;
};

type WindowLike = {
  addEventListener(event: 'load', handler: () => void): void;
};

export type ServiceWorkerRegistrationStatus = 'scheduled' | 'unsupported';

export function registerServiceWorker({
  navigatorLike = navigator,
  windowLike = window,
  swUrl = `${import.meta.env.BASE_URL}sw.js`,
  scope = import.meta.env.BASE_URL,
}: {
  navigatorLike?: NavigatorLike;
  windowLike?: WindowLike;
  swUrl?: string;
  scope?: string;
} = {}): ServiceWorkerRegistrationStatus {
  if (!navigatorLike.serviceWorker) {
    return 'unsupported';
  }

  windowLike.addEventListener('load', () => {
    navigatorLike.serviceWorker?.register(swUrl, { scope }).catch((error: unknown) => {
      console.warn('Service worker registration failed', error);
    });
  });

  return 'scheduled';
}
