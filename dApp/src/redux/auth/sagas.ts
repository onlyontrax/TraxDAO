import { flatten, pick } from 'lodash';
import { put } from 'redux-saga/effects';
import { createSagas } from '@lib/redux';
import Router from 'next/router';
import { authService, userService } from 'src/services';
import {
  ILogin, IFanRegister, IForgot
} from 'src/interfaces';
import { message } from 'antd';
import { setAccount } from '../user/actions';
import { Capacitor } from '@capacitor/core';
import {
  loginSocial,
  login,
  loginSuccess,
  loginNfid,
  logout,
  loginFail,
  registerFanFail,
  registerFan,
  registerFanSuccess,
  registerPerformerFail,
  registerPerformer,
  registerPerformerSuccess,
  forgot,
  forgotSuccess,
  forgotFail,
  getCurrentUser,
  connectPlugWallet,
  connectPlugWalletSuccess,
  connectPlugWalletFail,
  disconnectPlugWallet
} from './actions';

import { getPlugWalletProvider, getPlugWalletAgent, disconnectPlugWallet as disconnectWallet, getPrincipalId } from 'src/crypto/mobilePlugWallet';


const authSagas = [
  {
    on: login,
    * worker(data: any) {
      try {
        const payload = data.payload as ILogin;
        const resp = (yield authService.login(payload)).data;
        if (resp.message === 'SMS or 2FA key is empty') {
          // Dispatch an action to indicate that 2FA is required
          yield put({ type: '2FA_REQUIRED', payload: { username: payload.username, password: payload.password, required: resp.required } });
        } else {
          // store token, update store and redirect to dashboard page
          yield authService.setToken(resp.token, payload?.remember);
          const userResp = yield userService.me();
          const activeSubaccount = userResp.data.activeSubaccount || 'user';
          yield put(setAccount(userResp.data));
          yield put(loginSuccess());

          if (activeSubaccount === 'user') {
            if (!userResp.data.email || !userResp.data.userInfo.username) {
              Router.push('/user/account');
            } else {
              Router.push('/');
            }
          } else if (activeSubaccount === 'performer') {
            if (!userResp.data.email || !userResp.data.performerInfo.username) {
              Router.push('/artist/account');
            } else {
              Router.push(`/artist/profile/?id=${userResp.data.performerInfo.username || userResp.data._id}`);
            }
          }
        }
      } catch (e) {
        const error = yield Promise.resolve(e);
        if (error.message === '2FA expired or not correct') {
          yield put({ type: '2FA_ERROR', payload: error.message, required: error.required });
        } else {
          message.error(error?.message || 'Incorrect credentials!');
          yield put(loginFail(error));
        }
      }
    }
  },
  {
    on: loginSocial,
    * worker(data: any) {
      try {
        const payload = data.payload as any;
        const { token } = payload;

        yield authService.setToken(token);
        const userResp = yield userService.me();
        const activeSubaccount = userResp.data.activeSubaccount || 'user';
        yield put(setAccount(userResp.data));
        yield put(loginSuccess());

        if (activeSubaccount === 'user') {
          if (!userResp.data.email || !userResp.data.userInfo.username) {
            Router.push('/user/account');
          }
        } else if (activeSubaccount === 'performer') {
          if (!userResp.data.email || !userResp.data.performerInfo.username) {
            Router.push('/artist/account');
          }
        }

        /*if (!userResp?.data?.isPerformer) {
          Router.push((!userResp.data.email || !userResp.data.username) ? '/user/account' : '/');
        }
        if (userResp?.data?.isPerformer) {
          (!userResp.data.email || !userResp.data.username) ? Router.push('/artist/account') : Router.push({ pathname: `/artist/profile/?id=${userResp.data.username || userResp.data._id}` }, `/artist/profile/?id=${userResp.data.username || userResp.data._id}`);
        }*/
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error(error?.message || 'Incorrect credentials!');
        yield put(loginFail(error));
      }
    }
  },
  {
    on: loginNfid,
    * worker(data: any) {
      try {
        const payload = data.payload as any;
        const { token, noRedirect } = payload;

        yield authService.setToken(token);
        const userResp = yield userService.me();
        const activeSubaccount = userResp.data.activeSubaccount || 'user';
        yield put(setAccount(userResp.data));
        yield put(loginSuccess());

        if (activeSubaccount === 'user') {
          if (!userResp.data.email || !userResp.data.userInfo.username) {
            Router.push('/user/account');
          }
        } else if (activeSubaccount === 'performer') {
          if (!userResp.data.email || !userResp.data.performerInfo.username) {
            Router.push('/artist/account');
          }
        }

        /*yield put(setAccount(userResp.data));
        yield put(loginSuccess());
        if (noRedirect !== true) {
          if (!userResp?.data?.isPerformer) {
            Router.push((!userResp.data.email || !userResp.data.username) ? '/user/account' : '/');
          }
          if (userResp?.data?.isPerformer) {
            (!userResp.data.email || !userResp.data.username) ? Router.push('/artist/account') : Router.push({ pathname: `/artist/profile/?id=${userResp.data.username || userResp.data._id}` }, `/artist/profile/?id=${userResp.data.username || userResp.data._id}`);
          }
        }*/
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error(error?.message || 'Incorrect credentials!');
        yield put(loginFail(error));
      }
    }
  },
  {
    on: registerFan,
    * worker(data: any) {
      try {
        const payload = data.payload as IFanRegister;
        const resp = (yield authService.register(payload)).data;
        message.success(resp?.message || 'Sign up success!', 10);
        //yield put(registerFanSuccess(resp));
        yield authService.setToken(resp.token, true);
        const userResp = yield userService.me();
        yield put(setAccount(userResp.data));
        yield put(loginSuccess());
        Router.push('/');
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error(error?.message || 'This email address has been already taken.', 5);
        yield put(registerFanFail(error));
      }
    }
  },
  {
    on: registerPerformer,
    * worker(data: any) {
      try {
        const firstName = '';
        const lastName = '';
        const payload = {
          ...pick(data.payload, ['name', 'username', 'gender', 'country', 'dateOfBirth']),
          firstName,
          lastName
        };
        const resp = (yield authService.registerPerformer(payload)).data;
        if (resp.account) {
          yield put(setAccount(resp.account));
        }
        yield put(registerPerformerSuccess(resp));
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error(error.message || 'An error occured, please try again later');
        yield put(registerPerformerFail(error));
      }
    }
  },
  {
    on: logout,
    * worker() {
      yield authService.removeToken();
      window.location.replace('/');
    }
  },
  {
    on: forgot,
    * worker(data: any) {
      try {
        const payload = data.payload as IForgot;
        const resp = (yield authService.resetPassword(payload)).data;
        message.success(
          'We\'ve sent an email to reset your password, please check your inbox.',
          10
        );
        yield put(forgotSuccess(resp));
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error((error && error.message) || 'Something went wrong. Please try again later', 5);
        yield put(forgotFail(error));
      }
    }
  },
  {
    on: getCurrentUser,
    * worker() {
      try {
        const userResp = yield userService.me();
        yield put(setAccount(userResp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        // eslint-disable-next-line no-console
      }
    }
  },
  {
    on: connectPlugWallet,
    * worker() {
      try {
        const agent = yield getPlugWalletAgent();
        const account = yield getPrincipalId();
        yield put(connectPlugWalletSuccess(account, agent));
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error(error?.message || 'Failed to connect to Plug Wallet');
        yield put(connectPlugWalletFail(error));
      }
    }
  },
  {
    on: disconnectPlugWallet,
    * worker() {
      try {
        yield disconnectWallet();
      } catch (e) {
        message.error('Failed to disconnect from Plug Wallet');
      }
    }
  },
];

export default flatten([createSagas(authSagas)]);
