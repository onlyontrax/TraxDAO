import Provider from '@funded-labs/plug-inpage-provider';

const isMobile = typeof navigator !== 'undefined' && (navigator.userAgent.toLowerCase().indexOf('android') > -1 || navigator.userAgent.toLowerCase().indexOf('iphone') > -1 || navigator.userAgent.toLowerCase().indexOf('ipad') > -1);

export function plugWalletMobileConnection() {
  // @ts-ignore
  if (typeof window !== 'undefined' && !window?.ic?.plug && isMobile) {
    Provider.exposeProviderWithWalletConnect({
      window,
      wcProjectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID as string,
      debug: process.env.NODE_ENV === 'development'
    });
  }
}
