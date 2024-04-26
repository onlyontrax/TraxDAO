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
export type SubType = { 'monthly' : null } |
  { 'yearly' : null };
export type Ticker = string;
export type Timestamp = bigint;
export interface Token { 'symbol' : string }
export interface Tokens { 'e8s' : bigint }
export interface _SERVICE {
  '_payArtistsSub' : ActorMethod<[], undefined>,
  'accountBalance' : ActorMethod<[Principal], Tokens>,
  'accountIdentifierToBlob' : ActorMethod<
    [AccountIdentifier__2],
    AccountIdentifierToBlobResult
  >,
  'canisterAccount' : ActorMethod<[], AccountIdentifier__1>,
  'canisterBalance' : ActorMethod<[], Tokens>,
  'checkLatePaymentStrikes' : ActorMethod<[FanID, ArtistID], bigint>,
  'getArtistTotalSubRevenue' : ActorMethod<[ArtistID, Ticker], [] | [bigint]>,
  'getExchangeRate' : ActorMethod<[string], number>,
  'getNumOfSubs' : ActorMethod<[ArtistID], number>,
  'getSubTxMapArtist' : ActorMethod<
    [ArtistID],
    Array<[FanID, Timestamp, bigint, Ticker]>
  >,
  'getSubTxMapFan' : ActorMethod<
    [ArtistID],
    Array<[ArtistID, Timestamp, bigint, Ticker]>
  >,
  'get_account_identifier' : ActorMethod<
    [GetAccountIdentifierArgs],
    GetAccountIdentifierResult
  >,
  'isFanSubscribed' : ActorMethod<[ArtistID, FanID], boolean>,
  'subscribe' : ActorMethod<
    [ArtistID, FanID, number, Ticker, SubType],
    boolean
  >,
  'unsubscribe' : ActorMethod<[ArtistID, FanID], boolean>,
}
