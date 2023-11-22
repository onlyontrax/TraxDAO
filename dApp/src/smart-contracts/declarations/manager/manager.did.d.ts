import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface ArtistAccountData {
  'createdAt' : Timestamp,
  'userPrincipal' : Principal,
}
export interface FanAccountData {
  'createdAt' : Timestamp,
  'userPrincipal' : Principal,
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
export type Timestamp = bigint;
export type UserId = Principal;
export type UserType = { 'fan' : null } |
  { 'artist' : null };
export interface _SERVICE {
  'changeCanisterSize' : ActorMethod<[bigint], undefined>,
  'changeCycleAmount' : ActorMethod<[bigint], undefined>,
  'createProfileArtist' : ActorMethod<[ArtistAccountData], Principal>,
  'createProfileFan' : ActorMethod<[FanAccountData], Principal>,
  'cyclesBalance' : ActorMethod<[], bigint>,
  'deleteAccountCanister' : ActorMethod<[UserId, Principal, UserType], boolean>,
  'deleteContentCanister' : ActorMethod<[Principal], undefined>,
  'getArtistAccountEntries' : ActorMethod<[], Array<[Principal, Principal]>>,
  'getAvailableMemoryCanister' : ActorMethod<[Principal], [] | [bigint]>,
  'getCanisterArtist' : ActorMethod<[Principal], [] | [Principal]>,
  'getCanisterFan' : ActorMethod<[Principal], [] | [Principal]>,
  'getFanAccountEntries' : ActorMethod<[], Array<[Principal, Principal]>>,
  'getOwnerOfArtistCanister' : ActorMethod<[Principal], [] | [UserId]>,
  'getOwnerOfFanCanister' : ActorMethod<[Principal], [] | [UserId]>,
  'getStatus' : ActorMethod<[[] | [StatusRequest]], [] | [StatusResponse]>,
  'getTotalArtistAccounts' : ActorMethod<[], bigint>,
  'getTotalFanAccounts' : ActorMethod<[], bigint>,
  'installCode' : ActorMethod<
    [Principal, Uint8Array | number[], Uint8Array | number[]],
    undefined
  >,
  'transferCycles' : ActorMethod<[Principal, bigint], undefined>,
  'transferOwnershipArtist' : ActorMethod<[Principal, Principal], undefined>,
  'transferOwnershipFan' : ActorMethod<[Principal, Principal], undefined>,
}
