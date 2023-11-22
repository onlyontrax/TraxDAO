import { all, spawn } from 'redux-saga/effects';

import userSagas from './user/sagas';
import authSagas from './auth/sagas';
import performerSagas from './performer/sagas';
import videoSagas from './video/sagas';
import productSagas from './product/sagas';
import commentSagas from './comment/sagas';
import gallerySagas from './gallery/sagas';
import messageSagas from './message/sagas';
import feedSagas from './feed/sagas';
import streamChatSagas from './stream-chat/sagas';

function* rootSaga() {
  yield all(
    [
      ...authSagas,
      ...userSagas,
      ...performerSagas,
      ...videoSagas,
      ...productSagas,
      ...commentSagas,
      ...gallerySagas,
      ...messageSagas,
      ...feedSagas,
      ...streamChatSagas
    ].map(spawn)
  );
}

export default rootSaga;
