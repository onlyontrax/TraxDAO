import { Actor, HttpAgent } from '@dfinity/agent';
import { authService } from '@services/index';
import * as crypto from 'crypto';
import { message } from 'antd';
//import store from '../redux/store';
import storeHolder from '@lib/storeHolder';
import { getPlugWalletAgent, getPlugWalletProvider, createPlugwalletActor } from '../crypto/mobilePlugWallet';

import { idlFactory as identityIDL } from '../smart-contracts/declarations/identity/identity.did.js';

export class CryptoService {
  public appName = 'Trax';

  // URL to 37x37px logo of your application (URI encoded)
  public appLogoUrl = 'https://trax.so/static/LogoAlternate.png';

  public authPath = `/authenticate/?applicationName=${this.appName}&applicationLogo=${this.appLogoUrl}#authorize`;

  getNfidInternetIdentityProviderProps(
    onSuccess?: Function
  ) {
    const store = storeHolder.getStore();
    const state: any = store.getState();
    const { settings } = state;

    const appLogoUrl = `${process.env.NEXT_PUBLIC_API_ENDPOINT}${this.appLogoUrl}`;
    const appName = (settings.icNetwork === true ? '' : 'local') + this.appName;
    this.authPath = `/authenticate/?applicationName=${appName}&applicationLogo=${appLogoUrl}#authorize`;

    const nfidProvider: any = {
      authClientOptions: {
        maxTimeToLive: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
        identityProvider: this.getIdentityProvider(),
        //derivationOrigin: this.getIDerivationOrigin(),
        windowOpenerFeatures:
        `left=${(typeof window !== 'undefined' ? window.screen.width : 500) / 2 - 525 / 2}, `
        + `top=${(typeof window !== 'undefined' ? window.screen.height : 500) / 2 - 705 / 2},`
        + 'toolbar=0,location=0,menubar=0,width=525,height=705',
        onSuccess: (principal) => onSuccess(principal)
      }
    };

    if (settings.icNetwork === true) {
      nfidProvider.authClientOptions.identityProvider = `https://nfid.one${this.authPath}`;
    }

    return nfidProvider;
  }

  getIdentityProvider() {
    const store = storeHolder.getStore();
    const state: any = store.getState();
    const { settings } = state;

    // needs to change to public
    return settings.icNetwork === true ? 'https://identity.ic0.app' : this.getIdentityProviderLink();
  }

  getIDerivationOrigin() {
    const store = storeHolder.getStore();
    const state: any = store.getState();
    const { settings } = state;
    // needs to change to public
    return 'https://o2kpe-tqaaa-aaaap-qb3ga-cai.ic0.app';
  }

  async createBucketActor(idl, canisterId, host = '', identity = null) {
    const store = storeHolder.getStore();
    const state: any = store.getState();
    const { settings } = state;

    const agentHost = host || settings.icHost;
    const agent = new HttpAgent({
      host: agentHost,
      identity
    });
    await agent.fetchRootKey();
    return Actor.createActor(idl, {
      agent,
      canisterId
    });
  }

  async getCanisterHashToken(identity: any, hashKey: string) {
    try {
      const store = storeHolder.getStore();
      const state: any = store.getState();
      const { settings } = state;

      const host = settings.icNetwork === true ? settings.icHost : settings.icHostContentManager;
      const canisterId = settings.icTraxIdentity;

      const actor = await this.createBucketActor(
        identityIDL,
        canisterId,
        host,
        identity
      );
      const canisterResponse = await actor.getHashedToken(hashKey);
      return canisterResponse;
    } catch (e) {}
    return '';
  }

  async getCanisterHashTokenwithPlugWallet(hashKey: string) {
    try {
      const mobileProvider = await getPlugWalletProvider();
      const agent = await getPlugWalletAgent();
      const store = storeHolder.getStore();
      const state: any = store.getState();
      const { settings } = state;

      const canisterId = settings.icTraxIdentity;
      const host = settings.icNetwork === true ? settings.icHost : settings.icHostContentManager;
      // @ts-ignore
      //await window?.ic?.plug.requestConnect([canisterId]);
      // @ts-ignore
      /*const actor = typeof window !== 'undefined' && 'ic' in window ? await window?.ic?.plug.createActor({
        canisterId,
        interfaceFactory: identityIDL
      }) : null;*/

      const delegatedIdentity = await mobileProvider?.delegatedIdentity;
      let actor:any = null;// await createPlugwalletActor(identityIDL, canisterId, host, delegatedIdentity, agent);
      //console.log("actor", actor);
      if (delegatedIdentity) {
        actor = await this.createBucketActor(
          identityIDL,
          canisterId,
          host,
          delegatedIdentity
        );
      } else {
        actor = agent ? await Actor.createActor(identityIDL, { agent, canisterId }) : null;
      }

      if (actor) {
        const canisterResponse = await actor.getHashedToken(hashKey);

        return canisterResponse;
      }
      return '';
    } catch (e) {console.log("error", e)}

    return '';
  }

  async onNFIDLogin(resp: any, from: string, loginNfid: any, onLoggedIn: any) {
    if (!resp?._delegation) {
      return;
    }

    try {
      const userKey = crypto.randomBytes(64).toString('hex');
      const fetchedResult = await this.getCanisterHashToken(resp, userKey);
      const referralCode = typeof window !== 'undefined' ? localStorage.getItem('referralCode') : '';

      const payload = {
        principal: fetchedResult[1],
        login: true,
        role: '',
        messageSigned: fetchedResult[0],
        publicKeyRaw: userKey,
        principalWallet: resp?.getPrincipal().toText(),
        referralCode,
        walletType: 'nfid'
      };

      if (from === 'sign-up') {
        payload.login = false;
        payload.role = 'user';
      }

      try {
        const responseService: any = await authService.loginNFID(payload);
        const response = await responseService.data;

        if (response.token) {
          message.success('Login successful. Please wait for redirect.');
          await loginNfid({ token: response.token, principal: fetchedResult[1] });
          onLoggedIn(true);
        } else {
          message.error('There is a problem with authenticating your NFID. Please try again.');
          onLoggedIn(false);
        }
      } catch (err) {
        const error = await err;
        if (error?.error === 'ENTITY_NOT_FOUND') {
          message.error('User with this wallet principal was not found. Please register a new account or connect this principal to an existing account.');
        } else {
          message.error(error.message);
        }
        onLoggedIn(false);
      }
    } catch (e) {
      message.success('There is a problem with authenticating your NFID. Please try again.');
      onLoggedIn(false);
    }
  }

  getIdentityProviderLink() {
    const settings = this.getSettings();
    //http://127.0.0.1:8006/?canisterId=br5f7-7uaaa-aaaaa-qaaca-cai
    return settings.icNetwork === true ? 'https://identity.ic0.app' : `${settings.icHost}/?canisterId=${settings.icIdentityProvider}`;
  }

  getSettings() {
    const store = storeHolder.getStore();
    const state: any = store.getState();
    const { settings } = state;
    //http://127.0.0.1:8006/?canisterId=br5f7-7uaaa-aaaaa-qaaca-cai
    return settings;
  }
}

export const cryptoService = new CryptoService();
