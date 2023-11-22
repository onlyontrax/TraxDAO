import { createAction, createAsyncAction } from '@lib/redux';

export const {
  getFeeds,
  getFeedsSuccess,
  getFeedsFail
} = createAsyncAction('getFeeds', 'GET_FEEDS');

export const {
  moreFeeds,
  moreFeedsSuccess,
  moreFeedsFail
} = createAsyncAction('moreFeeds', 'GET_MODE_FEEDS');

export const {
  getContentFeeds,
  getContentFeedsSuccess,
  getContentFeedsFail
} = createAsyncAction('getContentFeeds', 'GET_CONTENT_FEEDS');

export const {
  moreContentFeeds,
  moreContentFeedsSuccess,
  moreContentFeedsFail
} = createAsyncAction('moreContentFeeds', 'GET_MODE_CONTENT_FEEDS');

export const {
  getVideoFeeds,
  getVideoFeedsSuccess,
  getVideoFeedsFail
} = createAsyncAction('getVideoFeeds', 'GET_VIDEO_FEEDS');

export const {
  moreVideoFeeds,
  moreVideoFeedsSuccess,
  moreVideoFeedsFail
} = createAsyncAction('moreVideoFeeds', 'GET_MODE_VIDEO_FEEDS');

export const {
  getPhotoFeeds,
  getPhotoFeedsSuccess,
  getPhotoFeedsFail
} = createAsyncAction('getPhotoFeeds', 'GET_PHOTO_FEEDS');

export const {
  morePhotoFeeds,
  morePhotoFeedsSuccess,
  morePhotoFeedsFail
} = createAsyncAction('morePhotoFeeds', 'GET_MODE_PHOTO_FEEDS');

export const removeFeedSuccess = createAction('removeFeedSuccess');
