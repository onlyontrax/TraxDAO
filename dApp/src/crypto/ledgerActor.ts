import { Actor } from '@dfinity/agent';
import { idlFactory } from '../smart-contracts/declarations/ledger/ledger.did.js';
import type { _SERVICE } from '../smart-contracts/declarations/ledger/ledger2.did';

export const createLedgerActor = async (agent: any, canId: string) => Actor.createActor<_SERVICE>(idlFactory, {
  agent,
  canisterId: canId
});
