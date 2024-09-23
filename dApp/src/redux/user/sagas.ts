import { flatten } from 'lodash';
import { put } from 'redux-saga/effects';
import { createSagas } from '@lib/redux';
import { userService, authService, performerService } from '@services/index';
import { IReduxAction } from 'src/interfaces';
import { message } from 'antd';
import {
  updateUser,
  updateUserSuccess,
  updateUserFail,
  setUpdating,
  updatePassword,
  updatePasswordSuccess,
  updatePasswordFail,
  updatePerformer
} from './actions';

const userSagas = [
  // TODO - defind update current user or get from auth user info to reload current user data if needed
  {
    on: updateUser,
    * worker(data: IReduxAction<any>) {
      try {
        yield put(setUpdating(true));
        const updated = yield userService.updateMe(data.payload);
        yield put(updateUserSuccess(updated.data));
        message.success('Changes saved');
      } catch (e) {
        // TODO - alert error
        const error = yield Promise.resolve(e);
        message.error(error?.message || 'Error occured, please try again later');
        yield put(updateUserFail(error));
      } finally {
        yield put(setUpdating(false));
      }
    }
  },
  {
    on: updatePerformer,
    * worker(data: IReduxAction<any>) {
      try {
        yield put(setUpdating(true));
        const updated = yield performerService.updateMe(data.payload._id, data.payload);
        yield put(updateUserSuccess(updated.data));
        message.success('Changes saved');
      } catch (e) {
        // TODO - alert error
        const error = yield Promise.resolve(e);
        message.error(error?.message || 'Error occured, please try again later');
        yield put(updateUserFail(error));
      } finally {
        yield put(setUpdating(false));
      }
    }
  },
  {
    on: updatePassword,
    * worker(data: IReduxAction<any>) {
      try {
        yield put(setUpdating(true));
        const updated = yield authService.updatePassword(data.payload);
        yield put(updatePasswordSuccess(updated.data));
        message.success('Changes saved');
      } catch (e) {
        // TODO - alert error
        const error = yield Promise.resolve(e);
        message.error(error?.message || 'Error occured, please try again later');
        yield put(updatePasswordFail(error));
      } finally {
        yield put(setUpdating(false));
      }
    }
  }
];

export default flatten([createSagas(userSagas)]);
