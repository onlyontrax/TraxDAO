import { Actor, HttpAgent } from "@dfinity/agent";

// Imports and re-exports candid interface
import { idlFactory } from "./identity.did.js";
export { idlFactory } from "./identity.did.js";

/* CANISTER_ID is replaced by webpack based on node environment
 * Note: canister environment variable will be standardized as
 * process.env.CANISTER_ID_<CANISTER_NAME_UPPERCASE>
 * beginning in dfx 0.15.0
 */
export const canisterId = process.env.NEXT_PUBLIC_DFX_NETWORK.toString() === 'ic' ?
  process.env.NEXT_PUBLIC_IDENTITY_CANISTER.toString() : process.env.NEXT_PUBLIC_IDENTITY_CANISTER_LOCAL.toString();

export const createActor = (_canisterId, options = {}) => {
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
    _canisterId,
    ...(options ? options.actorOptions : {})
  });
};

export const identity = createActor(canisterId);
