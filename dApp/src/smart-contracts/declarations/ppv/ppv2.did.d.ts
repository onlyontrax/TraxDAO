import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type ArtistID = Principal;
export type ArtistID__1 = Principal;
export interface Content {
  'participants' : Array<Participants>,
  'contentType' : ContentType,
  'publisher' : ArtistID,
  'price' : number,
  'publisherPercentage' : Percentage,
}
export type ContentID = string;
export type ContentType = string;
export type ContentType__1 = string;
export interface Event {
  'timestamp' : bigint,
  'details' : string,
  'caller' : Principal,
  'eventType' : string,
}
export type FanID = Principal;
export interface PPV {
  'addPPVContent' : ActorMethod<[ContentID, Content], Result>,
  'approveSpending' : ActorMethod<[bigint], Result_1>,
  'ckbtcBalanceOfCanister' : ActorMethod<[], bigint>,
  'fanHasPaid' : ActorMethod<[ContentID, Principal], boolean>,
  'getAllContentPayments' : ActorMethod<
    [bigint, bigint],
    {
      'total' : bigint,
      'data' : Array<
        [ContentID, ArtistID__1, FanID, Timestamp, bigint, ContentType__1]
      >,
    }
  >,
  'getAllEvents' : ActorMethod<[], Array<Event>>,
  'getContent' : ActorMethod<[ContentID], [] | [Content]>,
  'getStatus' : ActorMethod<[[] | [StatusRequest]], [] | [StatusResponse]>,
  'purchaseContent' : ActorMethod<[ContentID, Ticker, bigint], Result_1>,
  'removeContent' : ActorMethod<[ContentID], Result>,
  'traxBalanceOfCanister' : ActorMethod<[], bigint>,
  'updatePPVContent' : ActorMethod<[ContentID, Content], Result>,
  'updatePlatformFee' : ActorMethod<[number], Result>,
}
export interface Participants {
  'participantPercentage' : Percentage,
  'participantID' : ArtistID,
}
export type Percentage = number;
export type Result = { 'ok' : null } |
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
export interface Tokens { 'e8s' : bigint }
export interface _SERVICE extends PPV {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
