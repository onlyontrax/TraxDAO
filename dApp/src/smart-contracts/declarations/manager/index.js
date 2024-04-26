import { Actor, HttpAgent } from '@dfinity/agent';
import storeHolder from '@lib/storeHolder';

// Imports and re-exports candid interface
import { idlFactory } from './manager.did.js';

/* CANISTER_ID is replaced by webpack based on node environment
 * Note: canister environment variable will be standardized as
 * process.env.CANISTER_ID_<CANISTER_NAME_UPPERCASE>
 * beginning in dfx 0.15.0
 */
export const canisterId = () => {
  const store = storeHolder.getStore();
  if (!store) {
    throw new Error('Redux store is not initialized');
  }

  const state = store.getState();
  const { settings } = state;
  return settings.icContentManager;
};

export const createActor = (canId, options = {}) => {
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
      // eslint-disable-next-line no-console
      console.warn(
        'Unable to fetch root key. Check to ensure that your local replica is running'
      );
      // eslint-disable-next-line no-console
      console.error(err);
    });
  }

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canId,
    ...options.actorOptions
  });
};

export const manager = createActor(canisterId);
