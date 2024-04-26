export interface IPerformer {
  _id: string;
  performerId: string;
  performerWalletAddress: string;
  name: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  phoneCode: string;
  avatarPath: string;
  avatar: any;
  coverPath: string;
  cover: any;
  gender: string;
  genreOne: string;
  genreTwo: string;
  genreThree: string;
  genreFour: any;
  genreFive: any;
  country: string;
  spotify: string;
  appleMusic: string;
  soundcloud: string;
  instagram: string;
  twitter: string;
  city: string;
  state: string;
  zipcode: string;
  address: string;
  languages: string[];
  studioId: string;
  categoryIds: string[];
  timezone: string;
  noteForUser: string;
  height: string;
  weight: string;
  bio: string;
  eyes: string;
  sexualOrientation: string;
  isFreeSubscription: boolean;
  durationFreeSubscriptionDays: number;
  monthlyPrice: number;
  yearlyPrice: number;
  stats: {
    likes: number;
    subscribers: number;
    views: number;
    totalVideos: number;
    totalPhotos: number;
    totalGalleries: number;
    totalProducts: number;
    totalFeeds: number;
    followers: number;
  };
  score: number;
  bankingInformation: IBanking;
  stripeAccount: any;
  paypalSetting: any;
  blockCountries: IBlockCountries;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isOnline: number;
  verifiedAccount: boolean;
  verifiedEmail: boolean;
  earlyBird: boolean;
  verifiedDocument: boolean;
  twitterConnected: boolean;
  googleConnected: boolean;
  welcomeVideoId: string;
  welcomeVideoPath: string;
  welcomeVideoName: string;
  activateWelcomeVideo: boolean;
  isBookMarked: boolean;
  isSubscribed: boolean;
  live: number;
  streamingStatus: string;

  idVerification: any;
  documentVerification: any;
  dateOfBirth: Date;
  publicChatPrice: number;
  groupChatPrice: number;
  privateChatPrice: number;
  balance: number;
  socialsLink: {
    facebook: string;
    google: string;
    instagram: string;
    twitter: string;
    linkedIn: string;
  };
  isPerformer: boolean;
  isFollowed: boolean;
  wallet_icp: string;
  userReferral: string;
  referredBy?: string;
  identityVerificationStatus?: {
    link: string,
    lastStatus: string,
    status: string,
    reasons: string[]
  };
}

export interface IBanking {
  firstName: string;
  lastName: string;
  SSN: string;
  bankName: string;
  bankAccount: string;
  bankRouting: string;
  bankSwiftCode: string;
  address: string;
  city: string;
  state: string;
  country: string;
  performerId: string;
}

export interface IPerformerStats {
  totalGrossPrice: number;
  totalSiteCommission: number;
  totalNetPrice: number;
  totalGrossPriceICP: number;
  totalGrossPriceTRAX: number;
  totalGrossPriceCKBTC: number;
  totalSiteCommissionICP: number;
  totalSiteCommissionTRAX: number;
  totalSiteCommissionCKBTC: number;
  totalNetPriceICP: number;
  totalNetPriceCKBTC: number;
  totalNetPriceTRAX: number;
}

export interface IBlockCountries {
  countryCodes: string[];
}

export interface IBlockedByPerformer {
  userId: string;
  description: string;
}
