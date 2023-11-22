/* eslint-disable */
import { Actor, HttpAgent } from '@dfinity/agent';

// Imports and re-exports candid interface
import { idlFactory } from './ledger.did.js';

export { idlFactory } from './ledger.did.js';

// CANISTER_ID is replaced by webpack based on node environment
export const canisterId = process.env.NEXT_PUBLIC_LEDGER_CANISTER_ID.toString();

export const createActor = (_canisterId, options = {}) => {

  // options.agentOptions = {};
  // // options.agentOptions.host = `http://127.0.0.1:8006?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai&id=${process.env.TIPPING_CANISTER_ID}`; 
  // options.agentOptions.host = `http://127.0.0.1:8006`;
  
  const agent = options.agent || new HttpAgent({
    host:
      process.env.NEXT_PUBLIC_DFX_NETWORK.toString() === 'ic'
        ? 'https://icp0.io'
        : 'http://127.0.0.1:8006',
  })

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
    canisterId: _canisterId,
    ...options.actorOptions
  });
};

export const ledger = createActor(canisterId);
