import { IPerformer } from './performer';

export interface IVideo {
  _id: string;
  title: string;
  slug: string;
  performerId: string;
  isSale: string;
  price: number;
  isCrypto: boolean;
  isCryptoPayment: boolean;
  performerWalletAddress: string;
  status: string;
  trackType: string;
  processing: boolean;
  description: string;
  thumbnail: {
    url: string;
    thumbnails: any[]
  };
  teaser: {
    url: string;
    thumbnails: any[];
    uploadedToIC: boolean;
    _id: string;
  };
  teaserProcessing: boolean;
  tags: string[];
  participantIds: string[];
  participants: any[];
  video: {
    url: string;
    thumbnails: string[];
    duration: number;
    width: number;
    height: number;
    uploadedToIC: boolean;
    _id: string;
  };
  stats: {
    views: number;
    likes: number;
    comments: number;
    bookmarks: number;
  };
  performer: IPerformer;
  isBought: boolean;
  isSubscribed: boolean;
  isBookmarked: boolean;
  isLiked: boolean;
  isSchedule: boolean;
  scheduledAt: Date;
  updatedAt: Date;
  createdAt: Date;
  teaserId: string;
  fileId: string;
  thumbnailId: string;
}
