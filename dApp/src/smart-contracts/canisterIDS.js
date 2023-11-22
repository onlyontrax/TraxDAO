import canisters from 'payments_frontend/.dfx/local/canister_ids.json';

const {
  tipping, subscriptions, xrc, ledger, internet_identity: internetIdentity, ppv
} = canisters;
export const LEDGER_CANISTER_ID = ledger.local;
export const XRC_CANISTER_ID = xrc.local;
export const PPV_CANISTER_ID = ppv.local;
export const TIPPING_CANISTER_ID = tipping;
export const SUBSCRIPTIONS_CANISTER_ID = subscriptions.local;
export const INTERNET_IDENTITY_ID = internetIdentity.local;
export const DFX_NETWORK = 'local';
