import { Actor, HttpAgent } from '@dfinity/agent';
import { authService } from '@services/index';
import * as crypto from 'crypto';
import { message } from 'antd';
import { idlFactory as identityIDL } from '../smart-contracts/declarations/identity';

export class CryptoService {
  public appName = 'Trax';

  // URL to 37x37px logo of your application (URI encoded)
  public appLogoUrl = '/settings/er0ks-scroppedx.png';

  public authPath = `/authenticate/?applicationName=${this.appName}&applicationLogo=${this.appLogoUrl}#authorize`;

  getNfidInternetIdentityProviderProps(
    onSuccess?: Function
  ) {
    const appLogoUrl = `${process.env.NEXT_PUBLIC_API_ENDPOINT}${this.appLogoUrl}`;
    const appName = (process.env.NEXT_PUBLIC_DFX_NETWORK === 'ic' ? '' : 'local') + this.appName;
    this.authPath = `/authenticate/?applicationName=${appName}&applicationLogo=${appLogoUrl}#authorize`;

    const nfidProvider: any = {
      authClientOptions: {
        maxTimeToLive: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
        identityProvider: this.getIdentityProvider(),
        windowOpenerFeatures:
        `left=${(typeof window !== 'undefined' ? window.screen.width : 500) / 2 - 525 / 2}, `
        + `top=${(typeof window !== 'undefined' ? window.screen.height : 500) / 2 - 705 / 2},`
        + 'toolbar=0,location=0,menubar=0,width=525,height=705',
        onSuccess: (principal) => onSuccess(principal)
      }
    };

    if (process.env.NEXT_PUBLIC_DFX_NETWORK === 'ic') {
      nfidProvider.authClientOptions.identityProvider = `https://nfid.one${this.authPath}`;
    }


    return nfidProvider;
  }

  getIdentityProvider() {
    // needs to change to public
    return (process.env.NEXT_PUBLIC_DFX_NETWORK as string) === 'ic' ? 'https://identity.ic0.app' : process.env.NEXT_PUBLIC_IDENTITY_PROVIDER as string;
  }

  async createBucketActor (idl, canisterId, host = '', identity = null) {
    const agentHost = host ? host : (process.env.NEXT_PUBLIC_DFX_NETWORK as string) === 'ic' ? process.env.NEXT_PUBLIC_HOST as string : process.env.NEXT_PUBLIC_HOST_LOCAL as string;
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
      const host = (process.env.NEXT_PUBLIC_DFX_NETWORK as string) === 'ic' ? (process.env.NEXT_PUBLIC_HOST as string) : (process.env.NEXT_PUBLIC_HOST_BACKEND_LOCAL as string);
      const canisterId = (process.env.NEXT_PUBLIC_DFX_NETWORK as string) === 'ic' ? (process.env.NEXT_PUBLIC_IDENTITY_CANISTER as string) : (process.env.NEXT_PUBLIC_IDENTITY_CANISTER_LOCAL as string);

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
      const canisterId = (process.env.NEXT_PUBLIC_DFX_NETWORK as string) === 'ic' ? (process.env.NEXT_PUBLIC_IDENTITY_CANISTER as string) : (process.env.NEXT_PUBLIC_IDENTITY_CANISTER_LOCAL as string);
      // @ts-ignore
      const actor = typeof window !== 'undefined' && 'ic' in window ? await window?.ic?.plug.createActor({
        canisterId,
        interfaceFactory: identityIDL
      }) : null;
      if (actor) {
        const canisterResponse = await actor.getHashedToken(hashKey);
        return canisterResponse;
      }
      return '';
    } catch (e) {}

    return '';
  }

  async onNFIDLogin(resp: any, from: string, loginNfid: any) {
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
        referralCode
      };

      if (from === 'sign-up') {
        payload.login = false;
        payload.role = 'user';
      }

      const response = await (await authService.loginNFID(payload)).data;
      if (response.token) {
        message.success('Login successfull. Please wait for redirect.');
        await loginNfid({ token: response.token, principal: fetchedResult[1] });
      }
    } catch (e) {
      message.success('There is a problem with authenticating your NFID. Please try again.');
    }
  }
}

export const cryptoService = new CryptoService();
