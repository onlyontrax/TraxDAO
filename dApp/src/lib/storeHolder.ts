import { Store as RDStore } from 'redux';

export type Store = RDStore<{}>;

let store: Store | null = null;

const storeHolder = {
  getStore: () => store,
  setStore: (s: Store) => {
    store = s;
  }
};

export default storeHolder;
