import { createAction, createAsyncAction } from '@lib/redux';

export const setAccount = createAction('setAccount');
export const updateCurrentUser = createAction('updateCurrentUser');
export const updateCurrentUserAvatar = createAction('updateCurrentUserAvatar');
export const updateCurrentUserCover = createAction('updateCurrentUserCover');

export const {
  updateUser,
  updateUserSuccess,
  updateUserFail
} = createAsyncAction('updateUser', 'UPDATE_USER');

export const {
  updateAccount,
  updateAccountSuccess,
  updateAccountFail
} = createAsyncAction('updateAccount', 'UPDATE_ACCOUNT');

export const { updatePerformer } = createAsyncAction(
  'updatePerformer',
  'UPDATE_PERFORMER'
);

export const setUpdating = createAction('updatingUser');

export const {
  updatePassword,
  updatePasswordSuccess,
  updatePasswordFail
} = createAsyncAction('updatePassword', 'UPDATE_PASSWORD');

export const updateBalance = createAction('updateBalance');
