import { IPerformer } from './performer';

export interface IFeed {
  _id?: string;
  type: string;
  fromRef: string;
  refId: string;
  fromSourceId: string;
  performer: IPerformer;
  fromSource: string;
  title: string;
  slug: string;
  text: string;
  fileIds: Array<string>;
  totalLike: number;
  totalComment: number;
  createdAt: Date;
  updatedAt: Date;
  files: any;
  isLiked: boolean;
  isSale: string;
  price: number;
  isSubscribed: boolean;
  isBought: boolean;
  polls: any[];
  pollIds: string[];
  pollExpiredAt: Date;
  feedParticipants: string[];
  royaltySharing: [{
    percentage: number,
    performerId: string,
    wallet_id: string
  }]
  isBookMarked: boolean;
  thumbnailId: string;
  thumbnail: any;
  teaserId: string;
  teaser: any;
  isPinned: boolean;
  pinnedAt: Date;
  pollDescription: string;
  isFollowed: boolean;
}
