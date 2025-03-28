import { merge } from 'lodash';
import { createReducers } from '@lib/redux';
import { updateSettings } from './actions';

// TODO -
const initialState = {
  requireEmailVerification: false,
  googleReCaptchaSiteKey: '',
  enableGoogleReCaptcha: false,
  googleClientId: '',
  appleClientId: '',
  facebookClientId: '',
  tokenConversionRate: 1,
  stripePublishableKey: '',
  paymentGateway: 'stripe',
  identityOnfidoApiToken: '',
  identityOnfidoSandbox: false,
  identityOnfidoWorkflowId: '',
  icNetwork: true,
  icEnableIcStorage: '',
  icHost: '',
  icHostContentManager: '',
  icXRC: '',
  icLedger: '',
  icCKBTCMinter: '',
  icPPV: '',
  icTipping: '',
  icSubscriptions: '',
  icContentManager: '',
  icContentArtistAccount: '',
  icContentArtistContent: '',
  icNFT: '',
  icIdentityProvider: '',
  icTraxIdentity: '',
  icAirdrop: '',
  icTraxToken: '',
  icTraxAccountPercentage: '',
  icNFTTicket: '',
  icNFTSong: '',
  stripeFeesPercentageAmount: '',
  stripeFeesFixedAmount: ''
};

const settingReducers = [
  {
    on: updateSettings,
    reducer(state: any, data: any) {
      return {
        ...data.payload
      };
    }
  }
];

export default merge({}, createReducers('settings', [settingReducers], initialState));
