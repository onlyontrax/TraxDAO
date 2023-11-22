import { Actor, HttpAgent } from '@dfinity/agent';

// Imports and re-exports candid interface
import { idlFactory } from './manager.did.js';

/* CANISTER_ID is replaced by webpack based on node environment
 * Note: canister environment variable will be standardized as
 * process.env.CANISTER_ID_<CANISTER_NAME_UPPERCASE>
 * beginning in dfx 0.15.0
 */
export const canisterId = process.env.CANISTER_ID_MANAGER
  || process.env.MANAGER_CANISTER_ID;

export const createActor = (canId, options = {}) => {
  const agent = options.agent || new HttpAgent({ ...options.agentOptions });

  if (options.agent && options.agentOptions) {
    // eslint-disable-next-line no-console
    console.warn(
      'Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent.'
    );
  }

  // Fetch root key for certificate validation during development
  if (process.env.DFX_NETWORK !== 'ic') {
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
