export interface IAccount {
  _id: string;
  email: string;
  verifiedEmail: boolean;
  balance: number;
  unsubscribed: boolean;
  isOnline: boolean;
  earlyBird: boolean;
  userReferral: string;
  referredBy: string;
  activeSubaccount: string;
  userId: string;
  performerId: string;
  userInfo?: any;
  performerInfo?: any;
  twitterProfile: any;
  twitterConnected: boolean;
  googleConnected: boolean;
  appleConnected: boolean;
  facebookConnected: boolean;
  wallet_icp: string;
  enabled2fa: boolean;
  phone: string;
  enabledSms: boolean;

  stripeAccount?: any;
  ccbillSetting?: any;
  paypalSetting?: any;

  status: string;
  createdAt: Date;
  updatedAt: Date;
}
