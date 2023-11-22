/* eslint-disable no-shadow, no-param-reassign, no-console */
import { Actor, HttpAgent } from '@dfinity/agent';

// Imports and re-exports candid interface
import { idlFactory } from './subscriptions.did.js';

export { idlFactory } from './subscriptions.did.js';

// CANISTER_ID is replaced by webpack based on node environment
export const canisterId = process.env.NEXT_PUBLIC_SUBSCRIPTIONS_CANISTER_ID.toString();

export const createActor = (canisterId, options = {}) => {
  // options.agentOptions.host = `http://127.0.0.1:8006?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai&id=${process.env.SUBSCRIPTIONS_CANISTER_ID}`;
  // options.agentOptions.host = `http://127.0.0.1:8006?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai&id=${process.env.SUBSCRIPTIONS_CANISTER_ID}`;

  const agent = options.agent || new HttpAgent({
    host:
      process.env.NEXT_PUBLIC_DFX_NETWORK.toString() === 'ic'
        ? 'https://icp0.io'
        : 'http://127.0.0.1:8006'
  });

  // Fetch root key for certificate validation during development
  if (process.env.NEXT_PUBLIC_DFX_NETWORK.toString() !== 'ic') {
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
