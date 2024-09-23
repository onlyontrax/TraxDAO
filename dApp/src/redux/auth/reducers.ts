import { merge } from 'lodash';
import { createReducers } from '@lib/redux';
import {
  login,
  loginSuccess,
  loginNfid,
  attachNfidLogout,
  loginFail,
  registerFanSuccess,
  registerFanFail,
  registerFan,
  registerPerformerSuccess,
  registerPerformer,
  registerPerformerFail,
  loginPerformer,
  forgotSuccess,
  forgotFail,
  logout,
  connectPlugWallet,
  connectPlugWalletSuccess,
  connectPlugWalletFail,
  disconnectPlugWallet
} from './actions';

const initialState = {
  mobileProvider: null,
  loggedIn: false,
  is2FAEnabled: false,
  isSmsEnabled: false,
  authUser: null,
  walletConnected: false,
  walletAccount: null,
  walletAgent: null,
  loginAuth: {
    requesting: false,
    error: null,
    data: null,
    success: false
  },
  registerFanData: {
    requesting: false,
    error: null,
    data: null,
    success: false
  },
  registerPerformerData: {
    requesting: false,
    error: null,
    data: null,
    success: false
  },
  forgotData: {
    requesting: false,
    error: null,
    data: null,
    success: false
  },
  nfidData: {
    principalId: null,
    nfidLogout: null
  }
};

const authReducers = [
  {
    on: login,
    reducer(state: any) {
      return {
        ...state,
        loginAuth: {
          requesting: true,
          error: null,
          data: null,
          success: false
        },
        authStatus: '',
        twoFactorError: '',
      };
    }
  },
  {
    on: '2FA_REQUIRED',
    reducer(state: any, action: any) {
      return {
        ...state,
        loginAuth: {
          ...state.loginAuth,
          requesting: false,
          error: null
        },
        is2FAEnabled: action?.payload?.required?.enabled2fa === true,
        isSmsEnabled: action?.payload?.required?.enabledSms === true,
        authStatus: '2FA_REQUIRED',
        twoFactorError: '',
      };
    }
  },
  {
    on: '2FA_ERROR',
    reducer(state: any, action: any) {
      return {
        ...state,
        twoFactorError: action.payload,
        authStatus: '2FA_ERROR',
      };
    }
  },
  {
    on: loginNfid,
    reducer(state: any, data: any) {
      return {
        ...state,
        nfidData: {
          principalId: data.payload.principal,
          nfidLogout: state.nfidData.nfidLogout
        }
      };
    }
  },
  {
    on: attachNfidLogout,
    reducer(state: any, data: any) {
      return {
        ...state,
        nfidData: {
          principalId: state.nfidData.principalId,
          nfidLogout: data.payload.nfidLogout
        }
      };
    }
  },
  {
    on: loginPerformer,
    reducer(state: any) {
      return {
        ...state,
        loginAuth: {
          requesting: true,
          error: null,
          data: null,
          success: false
        }
      };
    }
  },
  {
    on: loginSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        loggedIn: true,
        loginAuth: {
          requesting: false,
          error: null,
          data: data.payload,
          success: true
        },
        authStatus: '',
        twoFactorError: '',
      };
    }
  },
  {
    on: loginFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        loggedIn: false,
        loginAuth: {
          requesting: false,
          error: data.payload,
          success: false
        },
        authStatus: '',
        twoFactorError: '',
      };
    }
  },
  {
    on: registerFan,
    reducer(state: any) {
      return {
        ...state,
        registerFanData: {
          requesting: true,
          error: null,
          success: false
        }
      };
    }
  },
  {
    on: registerFanSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        registerFanData: {
          requesting: false,
          error: null,
          data: data.payload,
          success: true
        }
      };
    }
  },
  {
    on: registerFanFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        registerFanData: {
          requesting: false,
          error: data.payload,
          success: false
        }
      };
    }
  },
  {
    on: registerPerformer,
    reducer(state: any) {
      return {
        ...state,
        registerPerformerData: {
          requesting: true,
          error: null,
          success: false
        }
      };
    }
  },
  {
    on: registerPerformerSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        registerPerformerData: {
          requesting: false,
          error: null,
          data: data.payload,
          success: true
        }
      };
    }
  },
  {
    on: registerPerformerFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        registerPerformerData: {
          requesting: false,
          error: data.payload,
          success: false
        }
      };
    }
  },
  {
    on: forgotSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        registerFanData: {
          requesting: false,
          data: data.payload,
          success: false
        }
      };
    }
  },
  {
    on: forgotFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        registerFanData: {
          requesting: false,
          data: data.payload,
          success: false
        }
      };
    }
  },
  {
    on: logout,
    reducer(state: any) {
      if (typeof state.nfidData.nfidLogout === 'function') {
        state.nfidData.nfidLogout();
      }

      return {
        ...initialState
      };
    }
  },
  {
    on: connectPlugWallet,
    reducer(state: any) {
      return {
        ...state,
        walletConnected: false,
        walletAccount: null,
        walletAgent: null
      };
    }
  },
  {
    on: connectPlugWalletSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        walletConnected: true,
        walletAccount: data.payload,
        walletAgent: data.payload.agent
      };
    }
  },
  {
    on: connectPlugWalletFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        walletConnected: false,
        walletAccount: null,
        walletAgent: null
      };
    }
  },
  {
    on: disconnectPlugWallet,
    reducer(state: any) {
      return {
        ...state,
        walletConnected: false,
        walletAccount: null,
        walletAgent: null
      };
    }
  },
];

export default merge({}, createReducers('auth', [authReducers], initialState));
