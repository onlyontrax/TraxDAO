import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type ArtistID = Principal;
export type ArtistID__1 = Principal;
export interface Event {
  'kind' : EventKind,
  'message' : string,
  'timestamp' : bigint,
  'details' : [] | [
    {
      'participants' : [] | [Array<Principal>],
      'error' : [] | [string],
      'amount' : [] | [bigint],
    }
  ],
  'caller' : Principal,
}
export type EventKind = { 'Error' : null } |
  { 'AdminAction' : null } |
  { 'TipSent' : null } |
  { 'AllowanceUpdated' : null };
export type FanID = Principal;
export interface Participants {
  'participantPercentage' : Percentage,
  'participantID' : ArtistID,
}
export type Percentage = number;
export type Result = { 'ok' : Array<bigint> } |
  { 'err' : string };
export type Result_1 = { 'ok' : bigint } |
  { 'err' : string };
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
  'icp_balance' : [] | [Tokens],
}
export type Ticker = string;
export type Timestamp = bigint;
export interface Tipping {
  'approveSpending' : ActorMethod<[bigint, Ticker, [] | [bigint]], Result_1>,
  'ckbtcBalanceOfCanister' : ActorMethod<[], bigint>,
  'getAllEvents' : ActorMethod<[], Array<Event>>,
  'getAllTippingTransactions' : ActorMethod<
    [],
    Array<[ArtistID__1, FanID, Timestamp, bigint, Ticker]>
  >,
  'getMyBalance' : ActorMethod<[Ticker], Result_1>,
  'getStatus' : ActorMethod<[[] | [StatusRequest]], [] | [StatusResponse]>,
  'sendTip' : ActorMethod<[TippingParticipants, bigint, Ticker], Result>,
  'traxBalanceOfCanister' : ActorMethod<[], bigint>,
  'updatePlatformFee' : ActorMethod<[number], undefined>,
}
export type TippingParticipants = Array<Participants>;
export interface Tokens { 'e8s' : bigint }
export interface _SERVICE extends Tipping {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
