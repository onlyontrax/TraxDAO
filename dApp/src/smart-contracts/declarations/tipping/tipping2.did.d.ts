import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type AccountIdentifier = Uint8Array | number[];
export interface AccountIdentifierToBlobErr {
  'kind' : { 'InvalidAccountIdentifier' : null } |
    { 'Other' : null },
  'message' : [] | [string],
}
export type AccountIdentifierToBlobResult = {
    'ok' : AccountIdentifierToBlobSuccess
  } |
  { 'err' : AccountIdentifierToBlobErr };
export type AccountIdentifierToBlobSuccess = Uint8Array | number[];
export type AccountIdentifier__1 = { 'principal' : Principal } |
  { 'blob' : Uint8Array | number[] } |
  { 'text' : string };
export type ArtistID = Principal;
export type ArtistID__1 = Principal;
export type FanID = Principal;
export interface Participants {
  'participantPercentage' : Percentage,
  'participantID' : ArtistID,
}
export type Percentage = number;
export interface StatusRequest {
  'memory_size' : [] | [boolean],
  'trax_balance' : [] | [boolean],
  'version' : [] | [boolean],
  'cycles' : [] | [boolean],
  'heap_memory_size' : [] | [boolean],
  'ckbtc_balance' : [] | [boolean],
  'icp_balance' : [] | [boolean],
}
export interface StatusResponse {
  'memory_size' : [] | [bigint],
  'trax_balance' : [] | [bigint],
  'version' : [] | [bigint],
  'cycles' : [] | [bigint],
  'heap_memory_size' : [] | [bigint],
  'ckbtc_balance' : [] | [bigint],
  'icp_balance' : [] | [Tokens__1],
}
export type Ticker = string;
export type Timestamp = bigint;
export interface Tipping {
  'accountIdentifierToBlob' : ActorMethod<
    [AccountIdentifier__1],
    AccountIdentifierToBlobResult
  >,
  'addToReferralMap' : ActorMethod<[ArtistID__1, ArtistID__1], undefined>,
  'canisterAccount' : ActorMethod<[], AccountIdentifier>,
  'changePlatformFee' : ActorMethod<[number], undefined>,
  'ckbtcBalance' : ActorMethod<[Principal], bigint>,
  'ckbtcBalanceOfCanister' : ActorMethod<[], bigint>,
  'cyclesBalance' : ActorMethod<[], bigint>,
  'drainCanisterBalance' : ActorMethod<[bigint, Principal, Ticker], boolean>,
  'getAllTippingTransactions' : ActorMethod<
    [],
    Array<[ArtistID__1, FanID, Timestamp, bigint, Ticker]>
  >,
  'getStatus' : ActorMethod<[[] | [StatusRequest]], [] | [StatusResponse]>,
  'icpBalance' : ActorMethod<[Principal], Tokens>,
  'icpBalanceOfCanister' : ActorMethod<[], Tokens>,
  'myAccountId' : ActorMethod<[Principal], AccountIdentifier>,
  'sendTip' : ActorMethod<
    [bigint, TippingParticipants, bigint, Ticker],
    undefined
  >,
  'traxBalance' : ActorMethod<[Principal], bigint>,
  'traxBalanceOfCanister' : ActorMethod<[], bigint>,
}
export type TippingParticipants = Array<Participants>;
export interface Tokens { 'e8s' : bigint }
export interface Tokens__1 { 'e8s' : bigint }
export interface _SERVICE extends Tipping {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
