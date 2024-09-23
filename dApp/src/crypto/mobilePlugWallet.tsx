import { PlugMobileProvider } from '@funded-labs/plug-mobile-sdk';
import storeHolder from '@lib/storeHolder';
import { Actor, HttpAgent } from '@dfinity/agent';
import { cryptoService } from '@services/crypto.service';

async function initializeMobileProvider() {
  const store: any = storeHolder.getStore();
  const { settings } = store.getState();
  const mobileProvider = new PlugMobileProvider({
    debug: true,
    walletConnectProjectId: settings.walletConnectProjectId,
    window
  });

  await mobileProvider.initialize().catch(console.log);


  return mobileProvider;
}

function isMobileBrowser() {
  return PlugMobileProvider.isMobileBrowser();
}

export async function getPlugWalletProvider() {
  if (isMobileBrowser()) {
    const mobileProvider = await initializeMobileProvider();

    if (!mobileProvider.isPaired()) {
      await mobileProvider.pair().catch(console.log);
    }

    return mobileProvider;
  }

  // @ts-ignore
  return window?.ic?.plug;
}

export async function getPlugWalletIsConnected() {
  if (isMobileBrowser()) {
    const mobileProvider = await initializeMobileProvider();
    return mobileProvider.isPaired();
  }

  // @ts-ignore
  return typeof window !== 'undefined' && 'ic' in window ? window?.ic?.plug?.isConnected() : false;
}

export async function getPlugWalletAgent(canisterIdName = 'icTraxIdentity') {
  const store:any = storeHolder.getStore();
  const { settings } = store.getState();
  const canisterId = settings[canisterIdName];

  if (isMobileBrowser()) {
    const mobileProvider = await getPlugWalletProvider();
    const agent = await mobileProvider.createAgent({
      host: 'https://icp0.io',
      targets: [canisterId] // List of canisters to call
    });

    /*const delegatedIdentity = await mobileProvider?.delegatedIdentity;

      if (delegatedIdentity) {
        const principal = delegatedIdentity.getPrincipal();
        console.log('Principal ID:', principal.toText());
      } else {
        console.error('No delegated identity found.');
      }*/

    return agent;
  }

  const connected = typeof window !== 'undefined' && "ic" in window
    // @ts-ignore
    ? await window?.ic?.plug?.requestConnect({
        whitelist: [canisterId],
        host: settings.icHost
      })
    : false;
// @ts-ignore
  if (connected && !window?.ic?.plug?.agent) {
    // @ts-ignore
    await window.ic.plug.createAgent({
      whitelist: [canisterId],
      host: settings.icHost
    });
  }

  return (window as any).ic.plug.agent;
}

export async function getPrincipalId() {
  const store:any = storeHolder.getStore();
  const { settings } = store.getState();
  const mobileProvider = await getPlugWalletProvider();

  if (isMobileBrowser()) {
    const delegatedIdentity = await mobileProvider?.delegatedIdentity;

    return delegatedIdentity ? await delegatedIdentity.getPrincipal().toText() : '';
  }
  if (!(await mobileProvider.isConnected())) {
    await mobileProvider.requestConnect({
      whitelist: [],
      host: settings.icHost
    });
  }

  return await mobileProvider.principalId;
}

export async function createPlugwalletActor(identityIDL, canisterId, host = '', identity = null, agent = null) {
  const store:any = storeHolder.getStore();
  const { settings } = store.getState();

  if (identity) {
    return await cryptoService.createBucketActor(
      identityIDL,
      canisterId,
      host ? host : settings.icHost,
      identity
    );
  }

  return agent ? await Actor.createActor(identityIDL, { agent, canisterId }) : null;
}

export const disconnectPlugWallet = async () => {
  if (isMobileBrowser()) {
    const mobileProvider = await getPlugWalletProvider();
    await mobileProvider.disconnect();
  } else {
    if (typeof window !== 'undefined' && (window as any).ic && (window as any).ic.plug) {
      await (window as any).ic.plug.disconnect();
    }
  }
};

/*
export async function getPlugWalletAgent() {
  const isMobile = PlugMobileProvider.isMobileBrowser();

  if (isMobile) {
    const provider = await getPlugWalletProvider();
    console.log('u mobileu sam getPlugWalletAgent', provider);
    const createAgent = async () => {
      const agent = await provider.createAgent({
        host: 'https://icp0.io',
        targets: [], // List of canister you are planning to call
      });
      return agent;
    };
    console.log('u mobileu sam getPlugWalletAgent', createAgent);

    return createAgent;
  }

  const store = storeHolder.getStore();
  const state: any = store.getState();
  const { settings } = state;

  // @ts-ignore
  const connected = typeof window !== "undefined" && "ic" in window
    // @ts-ignore
    ? await window?.ic?.plug?.requestConnect({
      whitelist: [],
      host: settings.icHost
    })
    : false;

  // @ts-ignore
  if (!window?.ic?.plug?.agent && connected) {
    // @ts-ignore
    await window.ic.plug.createAgent({
      whitelist: [],
      host: settings.icHost
    });
  }

  return (window as any).ic.plug.agent;
}*/
/*
export async function plugMobileProvider() {

  const store = storeHolder.getStore();
  const state: any = store.getState();
  const { settings } = state;

  const mobileProvider = new PlugMobileProvider({
    debug: true, // If you want to see debug logs in console
    walletConnectProjectId: settings.walletConnectProjectId, // Project ID from WalletConnect console
    window
  });

  return mobileProvider;
}*/


/*export async function connectPlugWallet() {
  const isMobile = PlugMobileProvider.isMobileBrowser();
  if (isMobile) {
    if (!mobileProvider.isPaired()) {
      await mobileProvider.pair().catch(console.log);
    }
  }

  //window?.ic?.plug.is
}*/
/*
export async function getPlugWalletProvider() {
  const isMobile = PlugMobileProvider.isMobileBrowser();
  if (isMobile) {
    console.log('u mobileu sam getPlugWalletProvider');
    const mobileProvider = await plugMobileProvider();
    await mobileProvider.initialize().catch(console.log);

    if (!mobileProvider.isPaired()) {
      await mobileProvider.pair().catch(console.log);
    }
    console.log('u mobileu sam getPlugWalletProvider', mobileProvider);
    return mobileProvider;
  }
  // @ts-ignore
  return window?.ic?.plug;
}*/
/*
export async function getPlugWalletIsConnected() {
  const isMobile = PlugMobileProvider.isMobileBrowser();
  if (isMobile) {
    console.log('u mobileu sam getPlugWalletProvider');
    const mobileProvider = await plugMobileProvider();
    await mobileProvider.initialize().catch(console.log);

    return mobileProvider.isPaired();
  }
  // @ts-ignore
  return window?.ic?.plug.isConnected();
}*/
/*
export const disconnectPlugWallet = async () => {
  if (typeof window !== 'undefined' && (window as any).ic && (window as any).ic.plug) {
    await (window as any).ic.plug.disconnect();
  }
};
*/

// const isMobile = typeof navigator !== 'undefined' && (navigator.userAgent.toLowerCase().indexOf('android') > -1 || navigator.userAgent.toLowerCase().indexOf('iphone') > -1 || navigator.userAgent.toLowerCase().indexOf('ipad') > -1);

// export function plugWalletMobileConnection() {
//   // @ts-ignore
//   if (typeof window !== 'undefined' && !window?.ic?.plug && isMobile) {
//     Provider.exposeProviderWithWalletConnect({
//       window,
//       wcProjectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID as string,
//       debug: process.env.NODE_ENV === 'development'
//     });
//   }
// }
