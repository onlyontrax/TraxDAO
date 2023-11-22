import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type AccountIdentifier = { 'principal' : Principal } |
  { 'blob' : Uint8Array | number[] } |
  { 'text' : string };
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
export type AccountIdentifier__1 = Uint8Array | number[];
export type AccountIdentifier__2 = { 'principal' : Principal } |
  { 'blob' : Uint8Array | number[] } |
  { 'text' : string };
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
export type FanID = Principal;
export interface GetAccountIdentifierArgs {
  'principal' : Principal,
  'token' : Token,
}
export interface GetAccountIdentifierErr {
  'kind' : { 'InvalidToken' : null } |
    { 'Other' : null },
  'message' : [] | [string],
}
export type GetAccountIdentifierResult = {
    'ok' : GetAccountIdentifierSuccess
  } |
  { 'err' : GetAccountIdentifierErr };
export interface GetAccountIdentifierSuccess {
  'accountIdentifier' : AccountIdentifier,
}
export interface PPV {
  'accountBalance' : ActorMethod<[Principal], Tokens__1>,
  'accountIdentifierToBlob' : ActorMethod<
    [AccountIdentifier__2],
    AccountIdentifierToBlobResult
  >,
  'addPPVContent' : ActorMethod<[ContentID, Content], undefined>,
  'canisterAccount' : ActorMethod<[], AccountIdentifier__1>,
  'canisterBalance' : ActorMethod<[], Tokens__1>,
  'changePlatformFee' : ActorMethod<[number], undefined>,
  'cyclesBalance' : ActorMethod<[], bigint>,
  'drainCanisterBalance' : ActorMethod<[bigint, Principal, Ticker], boolean>,
  'fanHasPaid' : ActorMethod<[ContentID, FanID], boolean>,
  'getAllArtistContentIDs' : ActorMethod<[ArtistID__1], Array<ContentID>>,
  'getAllArtistContentPayments' : ActorMethod<
    [ArtistID__1],
    Array<[ContentID, FanID, Timestamp, bigint, Ticker]>
  >,
  'getAllContentPayments' : ActorMethod<
    [],
    Array<
      [ContentID, ArtistID__1, FanID, Timestamp, bigint, Ticker, ContentType__1]
    >
  >,
  'getAllFanContentPayments' : ActorMethod<
    [FanID],
    Array<[ContentID, Timestamp, bigint, Ticker]>
  >,
  'getContent' : ActorMethod<[ContentID], [] | [Content]>,
  'getExchangeRate' : ActorMethod<[string], number>,
  'getStatus' : ActorMethod<[[] | [StatusRequest]], [] | [StatusResponse]>,
  'get_account_identifier' : ActorMethod<
    [GetAccountIdentifierArgs],
    GetAccountIdentifierResult
  >,
  'purchaseContent' : ActorMethod<
    [bigint, ContentID, string, bigint],
    undefined
  >,
  'removeContent' : ActorMethod<[ContentID], undefined>,
  'showEntriesOfContentMap' : ActorMethod<[], Array<[ContentID, Content]>>,
  'updatePPVContent' : ActorMethod<[ContentID, Content], undefined>,
}
export interface Participants {
  'participantPercentage' : Percentage,
  'participantID' : ArtistID,
}
export type Percentage = number;
export interface StatusRequest {
  'memory_size' : boolean,
  'version' : boolean,
  'cycles' : boolean,
  'heap_memory_size' : boolean,
  'ckbtc_balance' : boolean,
  'icp_balance' : boolean,
}
export interface StatusResponse {
  'memory_size' : [] | [bigint],
  'version' : [] | [bigint],
  'cycles' : [] | [bigint],
  'heap_memory_size' : [] | [bigint],
  'ckbtc_balance' : [] | [bigint],
  'icp_balance' : [] | [Tokens],
}
export type Ticker = string;
export type Timestamp = bigint;
export interface Token { 'symbol' : string }
export interface Tokens { 'e8s' : bigint }
export interface Tokens__1 { 'e8s' : bigint }
export interface _SERVICE extends PPV {}
