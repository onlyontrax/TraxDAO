import { createAsyncAction, createAction } from '@lib/redux';

export const { login, loginSuccess, loginFail } = createAsyncAction(
  'login',
  'LOGIN'
);

export const { loginPerformer } = createAsyncAction(
  'loginPerformer',
  'LOGINPERFORMER'
);

export const { loginSocial } = createAsyncAction(
  'loginSocial',
  'LOGINSOCIAL'
);

export const { loginNfid } = createAsyncAction(
  'loginNfid',
  'LOGINNFID'
);

export const { attachNfidLogout } = createAsyncAction(
  'attachNfidLogout',
  'LOGOUTNFID'
);

export const { registerFan, registerFanSuccess, registerFanFail } = createAsyncAction(
  'registerFan',
  'REGISTERFAN'
);

export const { registerPerformer, registerPerformerSuccess, registerPerformerFail } = createAsyncAction(
  'registerPerformer',
  'REGISTERPERFORMER'
);

export const { forgot, forgotSuccess, forgotFail } = createAsyncAction(
  'forgot',
  'FORGOT'
);

export const logout = createAction('logout');

export const getCurrentUser = createAction('getCurrentUser');

export const { connectPlugWallet, connectPlugWalletSuccess, connectPlugWalletFail } = createAsyncAction(
  'connectPlugWallet',
  'CONNECT_PLUG_WALLET'
);

export const disconnectPlugWallet = createAction('DISCONNECT_PLUG_WALLET');
