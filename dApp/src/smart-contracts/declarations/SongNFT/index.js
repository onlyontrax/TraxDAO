import { Actor, HttpAgent } from "@dfinity/agent";
import storeHolder from '@lib/storeHolder';

// Imports and re-exports candid interface
import { idlFactory } from "./SongNFT.did.js";
export { idlFactory } from "./SongNFT.did.js";

export const canisterId = () => {
  const store = storeHolder.getStore();
  if (!store) {
    throw new Error('Redux store is not initialized');
  }

  const state = store.getState();
  const { settings } = state;
  return settings.icNFTSong;
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
        "Unable to fetch root key. Check to ensure that your local replica is running"
      );
      console.error(err);
    });
  }

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
};

// export const SongNFT = createActor(canisterId);
