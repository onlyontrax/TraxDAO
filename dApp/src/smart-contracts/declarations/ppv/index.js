/* eslint-disable no-shadow, no-console */
import { Actor, HttpAgent } from '@dfinity/agent';

// Imports and re-exports candid interface
import { idlFactory } from './ppv.did.js';

export { idlFactory } from './ppv.did.js';
// CANISTER_ID is replaced by webpack based on node environment
export const canisterId = process.env.NEXT_PUBLIC_PPV_CANISTER_ID.toString();

/**
 * @deprecated since dfx 0.11.1
 * Do not import from `.dfx`, instead switch to using `dfx generate` to generate your JS interface.
 * @param {string | import("@dfinity/principal").Principal} canisterId Canister ID of Agent
 * @param {{agentOptions?: import("@dfinity/agent").HttpAgentOptions; actorOptions?: import("@dfinity/agent").ActorConfig} | { agent?: import("@dfinity/agent").Agent; actorOptions?: import("@dfinity/agent").ActorConfig }} [options]
 * @return {import("@dfinity/agent").ActorSubclass<import("./ppv.did.js")._SERVICE>}
 */
export const createActor = (canisterId, options = {}) => {
  const agent = options.agent || new HttpAgent({
    host:
      process.env.NEXT_PUBLIC_DFX_NETWORK.toString() === 'ic'
        ? 'https://icp0.io'
        : 'http://127.0.0.1:8006'
  });

  // Fetch root key for certificate validation during development
  if (process.env.NEXT_PUBLIC_DFX_NETWORK.toString() !== 'ic') {
    agent.fetchRootKey().catch((err) => {
      console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
      console.error(err);
    });
  }

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...(options ? options.actorOptions : {})
  });
};

/**
 * A ready-to-use agent for the ppv canister
 * @type {import("@dfinity/agent").ActorSubclass<import("./ppv.did.js")._SERVICE>}
 */
export const ppv = createActor(canisterId);
