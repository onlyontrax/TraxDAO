import Router from 'next/router';

const defaultPages = [
  'artist', 'auth', 'contact', 'event-store', 'explore', 'gallery', 'home', 'login', 'messages',
  'nft', 'page', 'payment', 'post', 'register', 'store', 'streaming', 'unsubscribe', 'user', 'video', 'wallet',
  'dashboard', 'cart', 'error', 'search'
];

export class RouterService {
  async checkRedirectUrl() {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    if (currentPath === '/') {
      return true;
    }

    const currentPathParts = currentPath.split('/').filter((part) => part !== '');
    const firstSegment = currentPathParts.length > 0 ? currentPathParts[0] : '';

    // Check if the first segment matches any of the default pages
    const isDefaultPage = currentPathParts.length > 1 || defaultPages.includes(firstSegment);

    if (!isDefaultPage) {
      await Router.replace(
        {
          pathname: '/artist/profile',
          query: { id: firstSegment }
        },
        undefined,
        { shallow: true }
      );
    }

    return true;
  }

  async changeUrlPath() {
    if (typeof window !== 'undefined') {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

      if (currentPath.startsWith('/artist/profile/')) {
        const searchParams = new URLSearchParams(window.location.search);
        const id = searchParams.get('id');
        const newPathname = `/${id}`;
        window.history.replaceState({}, '', newPathname);

        //window.dispatchEvent(new Event('popstate'));
      }
    }
  }
}

export const routerService = new RouterService();
