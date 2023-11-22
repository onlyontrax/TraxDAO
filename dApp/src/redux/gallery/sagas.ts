import { galleryService } from 'src/services';
import { flatten } from 'lodash';
import { put } from 'redux-saga/effects';
import { createSagas } from '@lib/redux';
import { IReduxAction } from 'src/interfaces';
import {
  getGalleries, getGalleriesSuccess, getGalleriesFail,
  moreGalleries, moreGalleriesFail, moreGalleriesSuccess,
  getRelatedGalleries, getRelatedGalleriesFail, getRelatedGalleriesSuccess
} from './actions';

const gallerySagas = [
  {
    on: getGalleries,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield galleryService.userSearch(data.payload);
        yield put(getGalleriesSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(getGalleriesFail(error));
      }
    }
  },
  {
    on: moreGalleries,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield galleryService.userSearch(data.payload);
        yield put(moreGalleriesSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(moreGalleriesFail(error));
      }
    }
  },
  {
    on: getRelatedGalleries,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield galleryService.userSearch(data.payload);
        yield put(getRelatedGalleriesSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(getRelatedGalleriesFail(error));
      }
    }
  }
];

export default flatten([createSagas(gallerySagas)]);
