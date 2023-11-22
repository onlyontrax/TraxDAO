import { Actor } from '@dfinity/agent';
import { idlFactory } from '../smart-contracts/declarations/ppv';
import type { _SERVICE } from '../smart-contracts/declarations/ppv/ppv.did';

export const createPPVActor = async (agent: any, canId: string) => Actor.createActor<_SERVICE>(idlFactory, {
  agent,
  canisterId: canId
});
