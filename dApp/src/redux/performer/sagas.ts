import { flatten } from 'lodash';
import { put } from 'redux-saga/effects';
import { createSagas } from '@lib/redux';
import { performerService } from '@services/index';
import { IReduxAction } from 'src/interfaces';
import {
  getList,
  getListFail,
  getListSuccess,
  getProfile,
  getProfileFail,
  getProfileSuccess
} from './actions';

const performerSagas = [
  {
    on: getList,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield performerService.search(data.payload);
        yield put(getListSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(getListFail(error));
      }
    }
  },
  {
    on: getProfile,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield performerService.findOne(data.payload);
        yield put(getProfileSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(getProfileFail(error));
      }
    }
  }
];

export default flatten([createSagas(performerSagas)]);
