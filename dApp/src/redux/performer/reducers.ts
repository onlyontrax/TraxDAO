import { merge } from 'lodash';
import { createReducers } from '@lib/redux';
import {
  getList, getListFail, getListSuccess, getProfile, getProfileSuccess, getProfileFail
} from './actions';

const initialState = {
  performerListing: {
    requesting: false,
    error: null,
    data: null,
    success: false
  },
  performerProfile: {
    requesting: false,
    error: null,
    data: null,
    success: false
  }
};

const performerReducers = [
  {
    on: getList,
    reducer(state: any) {
      return {
        ...state,
        performerListing: {
          requesting: true,
          error: null,
          data: null,
          success: false
        }
      };
    }
  },
  {
    on: getListSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        performerListing: {
          requesting: false,
          error: null,
          data: data.payload,
          success: false
        }
      };
    }
  },
  {
    on: getListFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        performerListing: {
          requesting: false,
          error: data.payload,
          data: null,
          success: false
        }
      };
    }
  },
  {
    on: getProfile,
    reducer(state: any) {
      return {
        ...state,
        performerProfile: {
          requesting: true,
          error: null,
          data: null,
          success: false
        }
      };
    }
  },
  {
    on: getProfileSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        performerProfile: {
          requesting: false,
          error: null,
          data: data.payload,
          success: true
        }
      };
    }
  },
  {
    on: getProfileFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        performerProfile: {
          requesting: false,
          error: data.payload,
          data: null,
          success: false
        }
      };
    }
  }
];

export default merge({}, createReducers('performer', [performerReducers], initialState));
