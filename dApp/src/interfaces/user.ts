import { IAccount } from './account';

export interface IUser {
  _id: string;
  account: IAccount;
  avatar: string;
  name: string;
  email: string;
  username: string;
  roles: string[];
  isPerformer: boolean;
  isOnline: number;
  verifiedEmail: boolean;
  earlyBird: boolean;
  verifiedAccount: boolean;
  twitterConnected: boolean;
  googleConnected: boolean;
  cover: string;
  phone?: string;
  dateOfBirth: Date;
  verifiedDocument: boolean;
  balance: number;
  stripeCardIds: string[];
  stripeCustomerId: string;
  stats: any;
  stripeAccount: any;
  userReferral: string;
  referredBy?: string;
  enabled2fa?: boolean;
  currency?: string;
  enabledSms?: boolean;
  unsubscribed?: boolean;
  themeColor?: string;
  backgroundColor?: string;
}
