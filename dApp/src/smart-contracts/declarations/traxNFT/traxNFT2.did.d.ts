import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type AccountIdentifier = { 'principal' : Principal } |
  { 'blob' : Uint8Array | number[] } |
  { 'text' : string };
export interface AccountIdentifierToBlobArgs {
  'canisterId' : [] | [Principal],
  'accountIdentifier' : AccountIdentifier,
}
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
export interface AccountIdentifierToTextArgs {
  'canisterId' : [] | [Principal],
  'accountIdentifier' : AccountIdentifier,
}
export interface AccountIdentifierToTextErr {
  'kind' : { 'InvalidAccountIdentifier' : null } |
    { 'Other' : null },
  'message' : [] | [string],
}
export type AccountIdentifierToTextResult = {
    'ok' : AccountIdentifierToTextSuccess
  } |
  { 'err' : AccountIdentifierToTextErr };
export type AccountIdentifierToTextSuccess = string;
export type AccountIdentifier__1 = { 'principal' : Principal } |
  { 'blob' : Uint8Array | number[] } |
  { 'text' : string };
export type ArtistID = Principal;
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
export interface NFT {
  'id' : string,
  'owner' : Principal,
  'productType' : string,
  'canisterId' : Principal,
}
export interface Participants {
  'participantPercentage' : Percentage,
  'participantID' : ArtistID,
}
export type Percentage = number;
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
export interface TicketMetaData {
  'id' : string,
  'status' : string,
  'ticker' : string,
  'logo' : Uint8Array | number[],
  'name' : string,
  'description' : string,
  'totalSupply' : bigint,
  'schedule' : Time,
  'price' : bigint,
  'royalty' : Array<Participants>,
  'location' : string,
  'eventDate' : string,
  'eventTime' : string,
}
export type Time = bigint;
export interface _SERVICE {
  'accountIdentifierToBlob' : ActorMethod<
    [AccountIdentifierToBlobArgs],
    AccountIdentifierToBlobResult
  >,
  'accountIdentifierToBlobFromText' : ActorMethod<
    [AccountIdentifier__1],
    AccountIdentifierToBlobResult
  >,
  'accountIdentifierToText' : ActorMethod<
    [AccountIdentifierToTextArgs],
    AccountIdentifierToTextResult
  >,
  'candidAccountIdentifierToBlob' : ActorMethod<
    [string],
    Uint8Array | number[]
  >,
  'createSong' : ActorMethod<[Principal, SongMetaData], Principal>,
  'createTicket' : ActorMethod<[Principal, TicketMetaData], Principal>,
  'cyclesBalance' : ActorMethod<[], bigint>,
  'getAllSongNFTs' : ActorMethod<
    [],
    Array<[string, string, string, bigint, bigint, string, Principal]>
  >,
  'getAllTicketNFTs' : ActorMethod<
    [],
    Array<
      [
        string,
        string,
        string,
        string,
        string,
        string,
        bigint,
        bigint,
        string,
        Principal,
      ]
    >
  >,
  'getArtistNfts' : ActorMethod<
    [Principal],
    Array<[string, string, Principal]>
  >,
  'getArtistSongs' : ActorMethod<[Principal], [] | [Array<string>]>,
  'getAvailableMemoryCanister' : ActorMethod<[Principal], [] | [bigint]>,
  'getCallerId' : ActorMethod<[], Principal>,
  'getCallerIdentifier' : ActorMethod<[], Uint8Array | number[]>,
  'getCallerIdentifierAsText' : ActorMethod<[], string>,
  'getNFT' : ActorMethod<[string], [] | [NFT]>,
  'getSongMetadata' : ActorMethod<[string], [] | [SongMetaData]>,
  'getStatus' : ActorMethod<[[] | [StatusRequest]], [] | [StatusResponse]>,
  'getTicketMetaData' : ActorMethod<[string], [] | [TicketMetaData]>,
}
