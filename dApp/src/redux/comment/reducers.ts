import { merge } from 'lodash';
import { createReducers } from '@lib/redux';
import { IReduxAction } from '@interfaces/redux';
import {
  getComments, getCommentsSuccess, getCommentsFail,
  moreComment, moreCommentSuccess, moreCommentFail,
  createComment, createCommentFail, createCommentSuccess,
  deleteCommentSuccess
} from './actions';

const initialState = {
  activeObject: {},
  commentMapping: {},
  comment: {
    requesting: false,
    error: null,
    success: false,
    data: null
  }
};

const commentReducers = [
  {
    on: getComments,
    reducer(state: any, data: IReduxAction<any>) {
      const { objectId } = data.payload;
      const nextState = { ...state };
      nextState.activeObject._id = objectId;
      nextState.commentMapping[objectId] = {
        requesting: true,
        items: [],
        total: 0
      };
      return {
        ...nextState
      };
    }
  },
  {
    on: getCommentsSuccess,
    reducer(state: any, data: any) {
      const nextState = { ...state };
      const objectId = data.payload.data && data.payload.data.length ? data.payload.data[0].objectId : nextState.activeObject._id;
      if (objectId) {
        nextState.commentMapping[objectId] = {
          items: data.payload.data,
          total: data.payload.total,
          requesting: false
        };
      }
      return {
        ...nextState
      };
    }
  },
  {
    on: getCommentsFail,
    reducer(state: any, data: any) {
      const nextState = { ...state };
      const objectId = data.payload.data && data.payload.data.length ? data.payload.data[0].objectId : nextState.activeObject._id;
      if (objectId) {
        nextState.commentMapping[objectId] = {
          items: [],
          total: 0,
          requesting: false
        };
      }
      return {
        ...nextState
      };
    }
  },
  {
    on: moreComment,
    reducer(state: any, data: IReduxAction<any>) {
      const { objectId } = data.payload;
      const nextState = { ...state };
      nextState.commentMapping[objectId].requesting = true;
      return {
        ...state
      };
    }
  },
  {
    on: moreCommentSuccess,
    reducer(state: any, data: any) {
      const nextState = { ...state };
      const objectId = data.payload.data && data.payload.data.length ? data.payload.data[0].objectId : null;
      if (objectId) {
        nextState.commentMapping[objectId] = {
          items: [...nextState.commentMapping[objectId].items, ...data.payload.data],
          total: data.payload.total,
          requesting: false
        };
      }
      return {
        ...nextState
      };
    }
  },
  {
    on: moreCommentFail,
    reducer(state: any, data: any) {
      const nextState = { ...state };
      const objectId = data.payload.data && data.payload.data.length ? data.payload.data[0].objectId : null;
      if (objectId) {
        nextState.commentMapping[objectId] = {
          items: [],
          total: 0,
          requesting: false
        };
      }
      return {
        ...nextState
      };
    }
  },
  {
    on: createComment,
    reducer(state: any) {
      return {
        ...state,
        comment: {
          ...state.comment,
          requesting: true,
          error: null,
          success: false
        }
      };
    }
  },
  {
    on: createCommentSuccess,
    reducer(state: any, data: any) {
      const nextState = { ...state };
      const { objectId } = data.payload;
      if (!nextState?.commentMapping[objectId]?.items) {
        nextState.commentMapping[objectId].items = [];
        nextState.commentMapping[objectId].total = 0;
      }
      nextState.commentMapping[objectId].items.unshift(data.payload);
      nextState.commentMapping[objectId].total += 1;
      return {
        ...nextState,
        comment: {
          requesting: false,
          data: data.payload,
          error: null,
          success: true
        }
      };
    }
  },
  {
    on: createCommentFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        comment: {
          requesting: false,
          data: null,
          error: data.payload,
          success: false
        }
      };
    }
  },
  {
    on: deleteCommentSuccess,
    reducer(state: any, data: any) {
      const nextState = { ...state };
      const { objectId, _id } = data.payload;
      nextState.commentMapping[objectId].items.splice(
        nextState.commentMapping[objectId].items.findIndex((item) => item._id === _id),
        1
      );
      nextState.commentMapping[objectId].total -= 1;
      return {
        ...nextState
      };
    }
  }
];

export default merge({}, createReducers('comment', [commentReducers], initialState));
