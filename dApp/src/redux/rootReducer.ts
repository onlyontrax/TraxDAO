import { merge } from 'lodash';
import { combineReducers } from 'redux';

// load reducer here
import settings from './settings/reducers';
import ui from './ui/reducers';
import user from './user/reducers';
import auth from './auth/reducers';
import performer from './performer/reducers';
import video from './video/reducers';
import gallery from './gallery/reducers';
import product from './product/reducers';
import comment from './comment/reducers';
import cart from './cart/reducers';
import message from './message/reducers';
import feed from './feed/reducers';
import streaming from './streaming/reducers';
import conversation from './stream-chat/reducers';
import subscription from './subscription/reducers';

const reducers = merge(
  settings,
  ui,
  user,
  auth,
  performer,
  gallery,
  video,
  product,
  comment,
  cart,
  message,
  feed,
  streaming,
  conversation,
  subscription
);

export default combineReducers(reducers);
