import { Actor } from '@dfinity/agent';
import { idlFactory } from '../smart-contracts/declarations/tipping/tipping.did.js';
import type { _SERVICE } from '../smart-contracts/declarations/tipping/tipping2.did.js';

export const createTippingActor = async (agent: any, canId: string) => Actor.createActor<_SERVICE>(idlFactory, {
  agent,
  canisterId: canId
});
