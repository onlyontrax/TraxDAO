/* eslint-disable no-shadow, no-param-reassign, no-console */
import { Actor, HttpAgent } from '@dfinity/agent';
import storeHolder from '@lib/storeHolder';

// Imports and re-exports candid interface
import { idlFactory } from './subscriptions.did.js';

export { idlFactory } from './subscriptions.did.js';

// CANISTER_ID is replaced by webpack based on node environment
export const canisterId = () => {
  const store = storeHolder.getStore();
  if (!store) {
    throw new Error('Redux store is not initialized');
  }

  const state = store.getState();
  const { settings } = state;
  return settings.icSubscriptions;
};

export const createActor = (canisterId, options = {}) => {
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
    canisterId,
    ...options.actorOptions
  });
};

export const subscriptions = createActor(canisterId);
