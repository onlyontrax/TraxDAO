import { createAsyncAction } from '@lib/redux';

export const {
  getList,
  getListSuccess,
  getListFail
} = createAsyncAction('getList', 'GET_LIST');

export const {
  getProfile,
  getProfileSuccess,
  getProfileFail
} = createAsyncAction('getProfile', 'GET_PROFILE');
