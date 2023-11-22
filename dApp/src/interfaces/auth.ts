export interface ILogin {
  username?: string;
  password: string;
  remember?: boolean;
}

export interface IForgot {
  email: string;
  type?: string;
}

export interface IFanRegister {
  name?: string;
  firstName: string;
  lastName: string;
  username: string;
  gender: string;
  email: string;
  password: string;
  wallet_icp: string;
  referralCode?: string;
}

export interface IPerformerRegister {
  firstName: string;
  lastName: string;
  name?: string;
  username: string;
  email: string;
  password: string;
  gender: string;
  wallet_icp: string;
  referralCode?: string;
}

export interface IVerifyEmail {
  source: any;
  sourceType: string;
}
