import { IPerformer } from './performer';

/* eslint-disable no-shadow */
export const PUBLIC_CHAT = 'public';
export const PRIVATE_CHAT = 'private';
export const GROUP_CHAT = 'group';
export const OFFLINE = 'offline';
export const ARTIST_STREAM_CHANNEL = 'ARTIST_STREAM_CHANNEL';

export enum ARTIST_STREAM_EVENT_NAME {
  GROUP_START = 'GROUP_START',
  PRIVATE_ACCPET = 'PRIVATE_ACCPET'
}

export enum BroadcastStatus {
  FINISHED = 'finished',
  BROADCASTING = 'broadcasting',
  CREATED = 'created'
}

export enum BroadcastType {
  LiveStream = 'liveStream',
  IpCamera = 'ipCamera',
  StreamSource = 'streamSource',
  Vod = 'Vod'
}

export interface IOneTimeToken {
  tokenId?: string;
  id: string;
  expireDate: number;
  type: 'publish' | 'play';
  roomId?: string;
}

export interface StreamSettings {
  viewerURL: string;
  publisherURL: string;
  optionForBroadcast: 'hls' | 'webrtc';
  optionForPrivate: 'hls' | 'webrtc';
  optionForGroup: 'hls' | 'webrtc';
  secureOption: boolean;
  AntMediaAppname: string;
  agoraEnable: boolean;
}

export const HLS = 'hls';
export const WEBRTC = 'webrtc';

export const defaultStreamValue = {
  publish: true,
  publicStream: true,
  plannedStartDate: 0,
  plannedEndDate: 0,
  duration: 0,
  mp4Enabled: 0,
  webMEnabled: 0,
  expireDurationMS: 0,
  speed: 0,
  pendingPacketSize: 0,
  hlsViewerCount: 0,
  webRTCViewerCount: 0,
  rtmpViewerCount: 0,
  startTime: 0,
  receivedBytes: 0,
  bitrate: 900,
  absoluteStartTimeMs: 0,
  webRTCViewerLimit: -1,
  hlsViewerLimit: -1
};

export interface IStream {
  _id: string;
  title: string;
  description: string;
  performerId: string;
  performerInfo: IPerformer;
  type: 'public' | 'group' | 'private';
  sessionId: string;
  isStreaming: number;
  streamingTime: number;
  lastStreamingTime: Date;
  isFree: boolean;
  price: number;
  stats: {
    members: number;
    likes: number;
  };
  isSubscribed: boolean;
  createdAt: Date;
  updatedAt: Date;
  conversationId: string;
  hasPurchased: boolean;
}
