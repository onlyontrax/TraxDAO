import { merge } from 'lodash';
import { createReducers } from '@lib/redux';
import {
  listProducts, listProductsFail, listProductsSuccess, moreProduct, moreProductFail, moreProductSuccess
} from './actions';

const initialState = {
  products: {
    requesting: false,
    error: null,
    success: false,
    items: [],
    total: 0
  }
};

const productReducers = [
  {
    on: listProducts,
    reducer(state: any) {
      return {
        ...state,
        products: {
          ...state.products,
          requesting: true
        }
      };
    }
  },
  {
    on: listProductsSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        products: {
          requesting: false,
          items: data.payload.data,
          total: data.payload.total,
          success: true
        }
      };
    }
  },
  {
    on: listProductsFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        products: {
          ...state.products,
          requesting: false,
          error: data.payload
        }
      };
    }
  },
  {
    on: moreProduct,
    reducer(state: any) {
      return {
        ...state,
        products: {
          ...state.products,
          requesting: true,
          error: null,
          success: false
        }
      };
    }
  },
  {
    on: moreProductSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        products: {
          requesting: false,
          total: data.payload.total,
          items: [...state.products.items, ...data.payload.data],
          success: true
        }
      };
    }
  },
  {
    on: moreProductFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        products: {
          ...state.products,
          requesting: false,
          error: data.payload,
          success: false
        }
      };
    }
  }
];

export default merge({}, createReducers('product', [productReducers], initialState));
