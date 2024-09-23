/* eslint-disable func-names */
import nextReduxSaga from 'next-redux-saga';
import nextReduxWrapper from 'next-redux-wrapper';
import store from './store';

export default function withReduxSaga(BaseComponent: any) {
  return nextReduxWrapper(store as any)(nextReduxSaga(BaseComponent));
}
