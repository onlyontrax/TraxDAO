export interface IError {
  statusCode: number;
  message: string;
}

export interface IContact {
  email: string;
  message: any;
  name: string;
}

export interface ISettings {
  requireEmailVerification: boolean;
  googleReCaptchaSiteKey: string;
  enableGoogleReCaptcha: boolean;
  googleClientId: string;
  twitterClientId: string;
  tokenConversionRate: number;
  stripePublishableKey: string;
  metaKeywords: string;
  metaDescription: string;
  agoraEnable: boolean;
  paymentGateway: string;
  identityOnfidoApiToken: string;
  identityOnfidoSandbox: boolean;
  identityOnfidoWorkflowId: string;
  icNetwork: boolean;
  icEnableIcStorage: string;
  icHost: string;
  icHostContentManager: string;
  icXRC: string;
  icLedger: string;
  icCKBTCMinter: string;
  icPPV: string;
  icTipping: string;
  icSubscriptions: string;
  icContentManager: string;
  icContentArtistAccount: string;
  icContentArtistContent: string;
  icNFT: string;
  icIdentityProvider: string;
  icTraxIdentity: string;
  icAirdrop: string;
  icTraxToken: string;
  icTraxAccountPercentage: string;
  icNFTTicket: string;
  icNFTSong: string;
}
