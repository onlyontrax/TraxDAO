import { merge } from 'lodash';
import { createReducers } from '@lib/redux';
import {
  getFeeds, getFeedsSuccess, getFeedsFail,
  moreFeeds, moreFeedsFail, moreFeedsSuccess,
  removeFeedSuccess,
  getVideoFeeds,
  getVideoFeedsSuccess,
  getVideoFeedsFail,
  moreVideoFeeds,
  moreVideoFeedsSuccess,
  moreVideoFeedsFail,
  getPhotoFeeds,
  getPhotoFeedsFail,
  morePhotoFeeds,
  morePhotoFeedsFail,
  morePhotoFeedsSuccess,
  getPhotoFeedsSuccess
} from './actions';

const initialState = {
  feeds: {
    requesting: false,
    error: null,
    data: null,
    success: false
  },
  videoFeeds: {
    requesting: false,
    error: null,
    data: null,
    success: false
  },
  photoFeeds: {
    requesting: false,
    error: null,
    data: null,
    success: false
  }
};

const feedReducers = [
  {
    on: getFeeds,
    reducer(prevState: any) {
      return {
        ...prevState,
        feeds: {
          ...initialState.feeds,
          requesting: true
        }
      };
    }
  },
  {
    on: getFeedsSuccess,
    reducer(prevState: any, data: any) {
      return {
        ...prevState,
        feeds: {
          ...prevState.feeds,
          requesting: false,
          items: data.payload.data,
          total: data.payload.total,
          success: true
        }
      };
    }
  },
  {
    on: getFeedsFail,
    reducer(prevState: any, data: any) {
      return {
        ...prevState,
        feeds: {
          ...prevState.feeds,
          requesting: false,
          error: data.payload
        }
      };
    }
  },
  {
    on: moreFeeds,
    reducer(prevState: any) {
      return {
        ...prevState,
        feeds: {
          ...prevState.feeds,
          requesting: true,
          error: null,
          success: false
        }
      };
    }
  },
  {
    on: moreFeedsSuccess,
    reducer(prevState: any, data: any) {
      return {
        ...prevState,
        feeds: {
          ...prevState.feeds,
          requesting: false,
          total: data.payload.total,
          items: [...prevState.feeds.items, ...data.payload.data],
          success: true
        }
      };
    }
  },
  {
    on: moreFeedsFail,
    reducer(prevState: any, data: any) {
      return {
        ...prevState,
        feeds: {
          ...prevState.feeds,
          requesting: false,
          error: data.payload,
          success: false
        }
      };
    }
  },
  {
    on: getVideoFeeds,
    reducer(prevState: any) {
      return {
        ...prevState,
        videoFeeds: {
          ...initialState.videoFeeds,
          requesting: true
        }
      };
    }
  },
  {
    on: getVideoFeedsSuccess,
    reducer(prevState: any, data: any) {
      return {
        ...prevState,
        videoFeeds: {
          ...prevState.videoFeeds,
          requesting: false,
          items: data.payload.data,
          total: data.payload.total,
          success: true
        }
      };
    }
  },
  {
    on: getVideoFeedsFail,
    reducer(prevState: any, data: any) {
      return {
        ...prevState,
        videoFeeds: {
          ...prevState.videoFeeds,
          requesting: false,
          error: data.payload
        }
      };
    }
  },
  {
    on: moreVideoFeeds,
    reducer(prevState: any) {
      return {
        ...prevState,
        videoFeeds: {
          ...prevState.videoFeeds,
          requesting: true,
          error: null,
          success: false
        }
      };
    }
  },
  {
    on: moreVideoFeedsSuccess,
    reducer(prevState: any, data: any) {
      return {
        ...prevState,
        videoFeeds: {
          ...prevState.videoFeed,
          requesting: false,
          total: data.payload.total,
          items: [...prevState.videoFeeds.items, ...data.payload.data],
          success: true
        }
      };
    }
  },
  {
    on: moreVideoFeedsFail,
    reducer(prevState: any, data: any) {
      return {
        ...prevState,
        videoFeeds: {
          ...prevState.videoFeeds,
          requesting: false,
          error: data.payload,
          success: false
        }
      };
    }
  },
  {
    on: getPhotoFeeds,
    reducer(prevState: any) {
      return {
        ...prevState,
        photoFeeds: {
          ...initialState.photoFeeds,
          requesting: true
        }
      };
    }
  },
  {
    on: getPhotoFeedsSuccess,
    reducer(prevState: any, data: any) {
      return {
        ...prevState,
        photoFeeds: {
          ...prevState.photoFeeds,
          requesting: false,
          items: data.payload.data,
          total: data.payload.total,
          success: true
        }
      };
    }
  },
  {
    on: getPhotoFeedsFail,
    reducer(prevState: any, data: any) {
      return {
        ...prevState,
        photoFeeds: {
          ...prevState.photoFeeds,
          requesting: false,
          error: data.payload
        }
      };
    }
  },
  {
    on: morePhotoFeeds,
    reducer(prevState: any) {
      return {
        ...prevState,
        photoFeeds: {
          ...prevState.photoFeeds,
          requesting: true,
          error: null,
          success: false
        }
      };
    }
  },
  {
    on: morePhotoFeedsSuccess,
    reducer(prevState: any, data: any) {
      return {
        ...prevState,
        photoFeeds: {
          ...prevState.photoFeeds,
          requesting: false,
          total: data.payload.total,
          items: [...prevState.photoFeeds.items, ...data.payload.data],
          success: true
        }
      };
    }
  },
  {
    on: morePhotoFeedsFail,
    reducer(prevState: any, data: any) {
      return {
        ...prevState,
        photoFeeds: {
          ...prevState.photoFeeds,
          requesting: false,
          error: data.payload,
          success: false
        }
      };
    }
  },
  {
    on: removeFeedSuccess,
    reducer(prevState: any, data: any) {
      const { feed } = data.payload;
      const { items } = prevState.feeds || [];
      items.splice(items.findIndex((f) => f._id === feed._id), 1);
      return {
        ...prevState,
        feeds: {
          total: prevState.total - 1,
          items
        }
      };
    }
  }
];

export default merge({}, createReducers('feed', [feedReducers], initialState));
