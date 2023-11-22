import { flatten } from 'lodash';
import { put } from 'redux-saga/effects';
import { createSagas } from '@lib/redux';
import { commentService } from '@services/index';
import { IReduxAction } from 'src/interfaces';
import { message } from 'antd';
import {
  getComments, getCommentsSuccess, moreCommentSuccess, moreComment, getCommentsFail, moreCommentFail,
  createComment, createCommentSuccess, createCommentFail, deleteComment, deleteCommentFail, deleteCommentSuccess
} from './actions';

const commentSagas = [
  {
    on: getComments,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield commentService.search(data.payload);
        yield put(getCommentsSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(getCommentsFail(error));
      }
    }
  },
  {
    on: moreComment,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield commentService.search(data.payload);
        yield put(moreCommentSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(moreCommentFail(error));
      }
    }
  },
  {
    on: createComment,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield commentService.create(data.payload);
        yield put(createCommentSuccess(resp.data));
        yield message.success('Commented successfully');
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield message.error('Error occured, please try again later');
        yield put(createCommentFail(error));
      }
    }
  },
  {
    on: deleteComment,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield commentService.delete(data.payload);
        yield put(deleteCommentSuccess(resp.data));
        yield message.success('Removed successfully!');
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield message.error('Error occured, please try again later');
        yield put(deleteCommentFail(error));
      }
    }
  }
];

export default flatten([createSagas(commentSagas)]);
