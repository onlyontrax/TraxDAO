import { merge } from 'lodash';
import { createReducers } from '@lib/redux';
import { IProduct } from 'src/interfaces/product';
import {
  addCart, removeCart, updateItemCart, clearCart
} from './actions';

const initialState = {
  total: 0,
  items: []
};

const cartReducers = [
  {
    on: addCart,
    reducer(state: any, data: any) {
      return {
        ...state,
        total: state.total + data.payload.length,
        items: [...state.items, ...data.payload]
      };
    }
  },
  {
    on: removeCart,
    reducer(state: any, data: any) {
      return {
        ...state,
        total: state.total - data.payload.length,
        items: [
          ...state.items.filter(
            (item: IProduct) => data.payload.indexOf(item) > -1
          )
        ]
      };
    }
  },
  {
    on: clearCart,
    reducer(state: any) {
      return {
        ...state,
        total: 0,
        items: []
      };
    }
  },
  {
    on: updateItemCart,
    reducer(state: any, data: any) {
      const index = state.items.findIndex(
        (element) => element._id === data.payload.data._id
      );
      const newArray = [...state.items];
      if (index > -1) {
        newArray[index] = {
          ...newArray[index],
          quantity: data.payload.quantity || 1
        };
      }
      return {
        ...state,
        items: newArray
      };
    }
  }
];

export default merge({}, createReducers('cart', [cartReducers], initialState));
