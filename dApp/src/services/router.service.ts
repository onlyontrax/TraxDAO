import Router from 'next/router';

const defaultPages = [
  'account', 'artist', 'auth', 'contact', 'event-store', 'explore', 'gallery', 'home', 'login', 'messages',
  'nft', 'page', 'payment', 'post', 'register', 'store', 'streaming', 'unsubscribe', 'user', 'video', 'track', 'wallet',
  'dashboard', 'cart', 'error', 'search'
];

export class RouterService {
  async checkRedirectUrl() {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    if (currentPath === '/') {
      return false;
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

      return true;
    }

    return false;
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

  async redirectAfterSwitchSubaccount(account: any, ) {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    if (currentPath === '/') {
      return false;
    }

    const currentPathParts = currentPath.split('/').filter((part) => part !== '');
    const firstSegment = currentPathParts.length > 0 ? currentPathParts[0] : '';

    // Check if the first segment matches any of the default pages
    const isDefaultPage = currentPathParts.length > 1 || defaultPages.includes(firstSegment);

    if (isDefaultPage) {
      const secondSegment = currentPathParts.length > 1 ? currentPathParts[1] : '';
      if (account.activeSubaccount === 'performer') {
        if (firstSegment === 'user') {
          await Router.push({ pathname: `/artist/studio` }, `/artist/studio`);
          //await Router.push({ pathname: `/artist/profile/?id=${account.performerInfo.username || account.performerId}` }, `/artist/profile/?id=${account.performerInfo.username || account.performerId}`);
        }
      }
      if (account.activeSubaccount === 'user') {
        if (firstSegment === 'artist') {
          await Router.push({ pathname: `/user/library` }, `/user/library`);
        }
      }

      return true;
    }

    return false;
  }
}

export const routerService = new RouterService();
