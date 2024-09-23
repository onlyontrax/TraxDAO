import { merge } from 'lodash';
import { createReducers } from '@lib/redux';
import { updateUIValue, loadUIValue } from './actions';

const initialState = {
  theme: 'light',
  siteName: '',
  logo: '',
  menus: [],
  favicon: '/static/favicon.ico',
  loginPlaceholderImage: '',
  footerContent: '',
  artistBenefit: '',
  userBenefit: ''
};

const uiReducers = [
  {
    on: updateUIValue,
    reducer(state: any, data: any) {
      if (process.browser) {
        Object.keys(data.payload).forEach(
          (key) => typeof window !== 'undefined' && localStorage.setItem(key, JSON.stringify(data.payload[key]))
        );
      }
      return {
        ...state,
        ...data.payload
      };
    }
  },
  {
    on: loadUIValue,
    reducer(state: any) {
      const newVal = {};
      if (process.browser) {
        Object.keys(initialState).forEach((key) => {
          const val = typeof window !== 'undefined' && JSON.parse(localStorage.getItem(key));
          if (val) {
            newVal[key] = val;
          }
        });
      }
      return {
        ...state,
        ...newVal
      };
    }
  }
];

export default merge({}, createReducers('ui', [uiReducers], initialState));
