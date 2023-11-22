import { merge } from 'lodash';
import { createReducers } from '@lib/redux';
import { IReduxAction } from 'src/interfaces';
import { showSubscribePerformerModal, hideSubscribePerformerModal } from './actions';

const initialState = {
  showModal: false,
  subscribingPerformerId: null
};

const reducers = [
  {
    on: showSubscribePerformerModal,
    reducer(state: any, action: IReduxAction<any>) {
      return {
        ...state,
        showModal: true,
        subscribingPerformerId: action.payload
      };
    }
  },
  {
    on: hideSubscribePerformerModal,
    reducer(state: any) {
      return {
        ...state,
        showModal: false,
        subscribingPerformerId: null
      };
    }
  }
];
export default merge({}, createReducers('subscription', [reducers], initialState));
