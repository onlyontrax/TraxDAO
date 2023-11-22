import { Actor } from '@dfinity/agent';
import { idlFactory } from '../smart-contracts/declarations/ledger';
import type { _SERVICE } from '../smart-contracts/declarations/ledger/ledger.did';

export const createLedgerActor = async (agent: any, canId: string) => Actor.createActor<_SERVICE>(idlFactory, {
  agent,
  canisterId: canId
});
