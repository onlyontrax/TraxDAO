import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface ArtistContentBucket {
  'changeCanisterSize' : ActorMethod<[bigint], undefined>,
  'changeCycleAmount' : ActorMethod<[bigint], undefined>,
  'checkCyclesBalance' : ActorMethod<[], undefined>,
  'createContent' : ActorMethod<[ContentInit], [] | [ContentId]>,
  'getContentChunk' : ActorMethod<
    [ContentId, bigint],
    [] | [Uint8Array | number[]]
  >,
  'getContentInfo' : ActorMethod<[ContentId], [] | [ContentData]>,
  'getPrincipalThis' : ActorMethod<[], Principal>,
  'getStatus' : ActorMethod<[[] | [StatusRequest]], [] | [StatusResponse]>,
  'putContentChunk' : ActorMethod<
    [ContentId, bigint, Uint8Array | number[]],
    undefined
  >,
  'removeContent' : ActorMethod<[ContentId, bigint], undefined>,
  'transferFreezingThresholdCycles' : ActorMethod<[], undefined>,
  'version' : ActorMethod<[], bigint>,
}
export interface ContentData {
  'contentId' : string,
  'userId' : UserId,
  'name' : string,
  'createdAt' : Timestamp,
  'size' : bigint,
  'tags' : Array<string>,
  'description' : string,
  'chunkCount' : bigint,
  'extension' : FileExtension,
  'uploadedAt' : Timestamp,
}
export type ContentId = string;
export interface ContentInit {
  'contentId' : string,
  'userId' : UserId,
  'name' : string,
  'createdAt' : Timestamp,
  'size' : bigint,
  'tags' : Array<string>,
  'description' : string,
  'chunkCount' : bigint,
  'extension' : FileExtension,
}
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
export interface _SERVICE extends ArtistContentBucket {}
