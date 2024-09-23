import { createAsyncAction } from '@lib/redux';

export const {
  getVideos,
  getVideosSuccess,
  getVideosFail
} = createAsyncAction('getVideos', 'GET_VIDEOS');

export const {
  getVods,
  getVodsSuccess,
  getVodsFail
} = createAsyncAction('getVods', 'GET_VODS');

export const {
  moreVideo, moreVideoSuccess, moreVideoFail
} = createAsyncAction('moreVideo', 'LOAD_MORE');

export const {
  moreVod, moreVodSuccess, moreVodFail
} = createAsyncAction('moreVod', 'MORE_VOD');

export const {
  getRelated, getRelatedSuccess, getRelatedFail
} = createAsyncAction('getRelated', 'GET_RELATED');
