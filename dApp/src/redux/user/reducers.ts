import { merge } from 'lodash';
import { createReducers } from '@lib/redux';
import { IReduxAction, IUser } from 'src/interfaces';
import { logout } from '@redux/auth/actions';
import { authService } from 'src/services';
import {
  setAccount,
  updateAccountSuccess,
  updateAccountFail,
  updateCurrentUser,
  updateUserSuccess,
  setUpdating,
  updateCurrentUserAvatar,
  updateUserFail,
  updatePasswordSuccess,
  updatePasswordFail,
  updateCurrentUserCover,
  updateBalance
} from './actions';
import { LetterTextIcon } from 'lucide-react';

const initialState = {
  account:{
    _id: null,
    email: ''
  },
  current: {
    _id: null,
    avatar: '/static/no-avatar.png',
    cover: null,
    name: '',
    account: null,
  },
  error: null,
  updateSuccess: false,
  updating: false
};

const userReducers = [
  {
    on: setAccount,
    reducer(state: any, data: any) {
      const activeSubaccount = data.payload.activeSubaccount || 'user';
      const current = activeSubaccount === 'user' ? data.payload.userInfo : data.payload.performerInfo;

      return {
        ...state,
        account: data.payload,
        current: {
          ...current,
          account: data.payload
        }
      };
    }
  },
  {
    on: updateAccountSuccess,
    reducer(state: any, data: IReduxAction<any>) {
      return {
        ...state,
        account: data.payload,
        updateSuccess: true,
        error: null
      };
    }
  },
  {
    on: updateAccountFail,
    reducer(state: any, data: IReduxAction<any>) {
      return {
        ...state,
        updateUser: null,
        updateSuccess: false,
        error: data.payload
      };
    }
  },
  {
    on: updateCurrentUser,
    reducer(state: any, data: any) {
      return {
        ...state,
        current: {
          ...state.current,
          ...data.payload
        }
      };
    }
  },
  {
    on: updateCurrentUserAvatar,
    reducer(state: any, data: any) {
      return {
        ...state,
        current: {
          ...state.current,
          avatar: data.payload
        }
      };
    }
  },
  {
    on: updateCurrentUserCover,
    reducer(state: any, data: any) {
      return {
        ...state,
        current: {
          ...state.current,
          cover: data.payload
        }
      };
    }
  },
  {
    on: updateUserSuccess,
    reducer(state: any, data: IReduxAction<IUser>) {
      return {
        ...state,
        current: {
          ...state.current,
          ...data.payload
        },
        updateSuccess: true,
        error: null
      };
    }
  },
  {
    on: updateUserFail,
    reducer(state: any, data: IReduxAction<any>) {
      return {
        ...state,
        updateUser: null,
        updateSuccess: false,
        error: data.payload
      };
    }
  },
  {
    on: setUpdating,
    reducer(state: any, data: IReduxAction<boolean>) {
      return {
        ...state,
        updating: data.payload
      };
    }
  },
  {
    on: updatePasswordSuccess,
    reducer(state: any, data: IReduxAction<any>) {
      return {
        ...state,
        updateSuccess: true,
        updatedPassword: data.payload,
        error: null
      };
    }
  },
  {
    on: updatePasswordFail,
    reducer(state: any, data: IReduxAction<any>) {
      return {
        ...state,
        updateSuccess: false,
        updatedPassword: null,
        error: data.payload
      };
    }
  },
  {
    on: updateBalance,
    reducer(state: any, data: any) {
      const { token } = data.payload;
      //nextState.current.balance += token;
      const balance = (state.account.balance || 0) + token;

      return {
        ...state,
        account: {
          ...state.account,
          balance: balance
        },
        current: {
          ...state.current,
          account: {
            ...state.account,
            balance: balance
          }
        }
      };
    }
  },
  {
    on: logout,
    reducer() {
      return {
        ...initialState
      };
    }
  }
];

export default merge({}, createReducers('user', [userReducers], initialState));
