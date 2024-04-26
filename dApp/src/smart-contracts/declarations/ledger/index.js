/* eslint-disable */
import { Actor, HttpAgent } from '@dfinity/agent';
import storeHolder from '@lib/storeHolder';

// Imports and re-exports candid interface
import { idlFactory } from './ledger.did.js';

export { idlFactory } from './ledger.did.js';

// CANISTER_ID is replaced by webpack based on node environment
export const canisterId = () => {
  const store = storeHolder.getStore();
  if (!store) {
    throw new Error('Redux store is not initialized');
  }

  const state = store.getState();
  const { settings } = state;
  return settings.icLedger;
};

export const createActor = (_canisterId, options = {}) => {
  const store = storeHolder.getStore();
  if (!store) {
    throw new Error('Redux store is not initialized');
  }

  const state = store.getState();
  const { settings } = state;

  const agent = options.agent || new HttpAgent({
    host: settings.icHost
  });

  // Fetch root key for certificate validation during development
  if (settings.icNetwork !== true) {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        'Unable to fetch root key. Check to ensure that your local replica is running'
      );
      console.error(err);
    });
  }

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId: _canisterId,
    ...options.actorOptions
  });
};

export const ledger = createActor(canisterId);
