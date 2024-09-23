export interface IComment {
  _id: string;
  objectId: string;
  content: string;
  creator: any;
  objectType: string;
  isLiked: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  totalReply: number;
  totalLike: number;
}
export interface ICreateComment {
  objectId: string;
  content: string;
  objectType: string;
}
