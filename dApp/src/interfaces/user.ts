export interface IUser {
  _id: string;
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
  dateOfBirth: Date;
  verifiedDocument: boolean;
  balance: number;
  stripeCardIds: string[];
  stripeCustomerId: string;
  stats: any;
  stripeAccount: any;
  wallet_icp?: string;
  userReferral: string;
  referredBy?: string;
}
