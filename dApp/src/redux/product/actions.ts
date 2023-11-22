import { createAsyncAction } from '@lib/redux';

export const {
  listProducts,
  listProductsSuccess,
  listProductsFail
} = createAsyncAction('listProducts', 'LIST_PRODUCT');

export const {
  moreProduct, moreProductSuccess, moreProductFail
} = createAsyncAction('moreProduct', 'MORE_PRODUCT');
