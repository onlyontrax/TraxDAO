import { Actor, HttpAgent } from '@dfinity/agent';
import storeHolder from '@lib/storeHolder';

// Imports and re-exports candid interface
import { idlFactory } from './artist-content-bucket.did.js';
// CANISTER_ID is replaced by webpack based on node environment
export const canisterId = () => {
  const store = storeHolder.getStore();
  if (!store) {
    throw new Error('Redux store is not initialized');
  }

  const state = store.getState();
  const { settings } = state;
  return settings.icContentArtistContent;
};

/**
 * @deprecated since dfx 0.11.1
 * Do not import from `.dfx`, instead switch to using `dfx generate` to generate your JS interface.
 * @param {string | import("@dfinity/principal").Principal} canisterId Canister ID of Agent
 * @param {{agentOptions?: import("@dfinity/agent").HttpAgentOptions; actorOptions?: import("@dfinity/agent").ActorConfig} | { agent?: import("@dfinity/agent").Agent; actorOptions?: import("@dfinity/agent").ActorConfig }} [options]
 * @return {import("@dfinity/agent").ActorSubclass<import("./artist-content-bucket.did.js")._SERVICE>}
 */
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
      console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
      console.error(err);
    });
  }

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canId,
    ...(options ? options.actorOptions : {})
  });
};

/**
 * A ready-to-use agent for the artist-content-bucket canister
 * @type {import("@dfinity/agent").ActorSubclass<import("./artist-content-bucket.did.js")._SERVICE>}
 */
export const artistContentBucket = createActor(canisterId);
export { idlFactory };
