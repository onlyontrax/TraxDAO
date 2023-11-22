import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

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
export type Network = { 'Mainnet' : null } |
  { 'Regtest' : null } |
  { 'Testnet' : null };
export interface Participants {
  'participantPercentage' : Percentage,
  'participantID' : ArtistID,
}
export type Percentage = number;
export type Ticker = string;
export type Timestamp = bigint;
export interface Tipping {
  'accountIdentifierToBlob' : ActorMethod<
    [AccountIdentifier__1],
    AccountIdentifierToBlobResult
  >,
  'canisterAccount' : ActorMethod<[], AccountIdentifier>,
  'canisterBTCAddress' : ActorMethod<[], string>,
  'canisterBalance' : ActorMethod<[], Tokens>,
  'changePlatformFee' : ActorMethod<[number], undefined>,
  'cyclesBalance' : ActorMethod<[], bigint>,
  'drainCanisterBalance' : ActorMethod<[bigint, Principal], boolean>,
  'getAllTippingTransactions' : ActorMethod<
    [],
    Array<[ArtistID__1, FanID, Timestamp, bigint, Ticker]>
  >,
  'getBalanceBTC' : ActorMethod<[string], bigint>,
  'getTipDataArtist' : ActorMethod<
    [ArtistID__1],
    Array<[FanID, Timestamp, bigint, Ticker]>
  >,
  'getTipDataFan' : ActorMethod<
    [FanID],
    Array<[ArtistID__1, Timestamp, bigint, Ticker]>
  >,
  'getUserAddressBTC1' : ActorMethod<[Principal], string>,
  'getUserAddressBTC2' : ActorMethod<[Principal], string>,
  'sendTip' : ActorMethod<
    [bigint, TippingParticipants, bigint, Ticker],
    undefined
  >,
}
export type TippingParticipants = Array<Participants>;
export interface Tokens { 'e8s' : bigint }
export interface _SERVICE extends Tipping {}
