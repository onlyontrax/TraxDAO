import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type ArtistID = Principal;
export type ArtistID__1 = Principal;
export type CommonError = { 'InvalidToken' : TokenIdentifier } |
  { 'Other' : string };
export type ExtMetadata = {
    'fungible' : {
      'decimals' : number,
      'metadata' : [] | [Uint8Array | number[]],
      'name' : string,
      'symbol' : string,
    }
  } |
  { 'nonfungible' : { 'metadata' : [] | [Uint8Array | number[]] } };
export type FileExtension = { 'aac' : null } |
  { 'avi' : null } |
  { 'gif' : null } |
  { 'jpg' : null } |
  { 'mp3' : null } |
  { 'mp4' : null } |
  { 'png' : null } |
  { 'svg' : null } |
  { 'wav' : null } |
  { 'jpeg' : null };
export interface MintRequest {
  'to' : User,
  'metadata' : [] | [Uint8Array | number[]],
}
export interface Participants {
  'participantPercentage' : Percentage,
  'participantID' : ArtistID,
}
export type Percentage = number;
export type Result = { 'ok' : Uint32Array | number[] } |
  { 'err' : CommonError };
export type Result_1 = { 'ok' : bigint } |
  { 'err' : CommonError };
export type Result_2 = { 'ok' : ExtMetadata } |
  { 'err' : CommonError };
export type Result_3 = { 'ok' : Principal } |
  { 'err' : CommonError };
export interface SongMetaData {
  'id' : string,
  'status' : string,
  'ticker' : string,
  'logo' : Uint8Array | number[],
  'name' : string,
  'size' : bigint,
  'description' : string,
  'totalSupply' : bigint,
  'chunkCount' : bigint,
  'schedule' : Time,
  'price' : bigint,
  'royalty' : Array<Participants>,
  'extension' : FileExtension,
}
export interface SongNFT {
  'bearer' : ActorMethod<[TokenIdentifier__1], Result_3>,
  'changeCanisterSize' : ActorMethod<[bigint], undefined>,
  'changeCycleAmount' : ActorMethod<[bigint], undefined>,
  'checkCyclesBalance' : ActorMethod<[], undefined>,
  'getAllArtistContentPayments' : ActorMethod<
    [ArtistID__1],
    Array<[string, Principal, bigint, bigint, string]>
  >,
  'getAllContentPayments' : ActorMethod<
    [],
    Array<[string, ArtistID__1, Principal, bigint, bigint, string]>
  >,
  'getAllFanContentPayments' : ActorMethod<
    [Principal],
    Array<[string, bigint, bigint, string]>
  >,
  'getBalance' : ActorMethod<[], Tokens>,
  'getContentChunk' : ActorMethod<[bigint], [] | [Uint8Array | number[]]>,
  'getFanSongs' : ActorMethod<[Principal], [] | [Array<string>]>,
  'getMinter' : ActorMethod<[], Principal>,
  'getRegistry' : ActorMethod<[], Array<[TokenIndex, Principal]>>,
  'getStatus' : ActorMethod<[[] | [StatusRequest]], [] | [StatusResponse]>,
  'getTokens' : ActorMethod<[], Array<[TokenIndex, ExtMetadata]>>,
  'initCanister' : ActorMethod<[], boolean>,
  'metadata' : ActorMethod<[TokenIdentifier__1], Result_2>,
  'mintNFT' : ActorMethod<[MintRequest], string>,
  'putContentChunk' : ActorMethod<[bigint, Uint8Array | number[]], undefined>,
  'supply' : ActorMethod<[], Result_1>,
  'tokens' : ActorMethod<[Principal], Result>,
}
export interface StatusRequest {
  'memory_size' : boolean,
  'cycles' : boolean,
  'heap_memory_size' : boolean,
}
export interface StatusResponse {
  'memory_size' : [] | [bigint],
  'cycles' : [] | [bigint],
  'heap_memory_size' : [] | [bigint],
}
export type Time = bigint;
export type TokenIdentifier = string;
export type TokenIdentifier__1 = string;
export type TokenIndex = number;
export interface Tokens { 'e8s' : bigint }
export type User = Principal;
export interface _SERVICE extends SongNFT {}
