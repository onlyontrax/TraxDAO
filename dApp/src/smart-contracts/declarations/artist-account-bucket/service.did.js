export const idlFactory = ({ IDL }) => {
  const UserId1 = IDL.Principal;
  const Timestamp = IDL.Int;
  const FileExtension = IDL.Variant({
    aac: IDL.Null,
    avi: IDL.Null,
    gif: IDL.Null,
    jpg: IDL.Null,
    mp3: IDL.Null,
    mp4: IDL.Null,
    png: IDL.Null,
    svg: IDL.Null,
    wav: IDL.Null,
    jpeg: IDL.Null
  });
  const ContentInit = IDL.Record({
    contentId: IDL.Text,
    userId: UserId1,
    name: IDL.Text,
    createdAt: Timestamp,
    size: IDL.Nat,
    tags: IDL.Vec(IDL.Text),
    description: IDL.Text,
    chunkCount: IDL.Nat,
    extension: FileExtension
  });
  const ContentId = IDL.Text;
  const CanisterId = IDL.Principal;
  const UserId = IDL.Principal;
  const ArtistAccountData1 = IDL.Record({
    createdAt: Timestamp,
    userPrincipal: IDL.Principal
  });
  const StatusRequest = IDL.Record({
    memory_size: IDL.Bool,
    cycles: IDL.Bool,
    heap_memory_size: IDL.Bool
  });
  const StatusResponse = IDL.Record({
    memory_size: IDL.Opt(IDL.Nat),
    cycles: IDL.Opt(IDL.Nat),
    heap_memory_size: IDL.Opt(IDL.Nat)
  });
  const ArtistBucket = IDL.Service({
    changeCanisterSize: IDL.Func([IDL.Nat], [], ['oneway']),
    changeCycleAmount: IDL.Func([IDL.Nat], [], ['oneway']),
    checkCyclesBalance: IDL.Func([], [], []),
    createContent: IDL.Func(
      [ContentInit],
      [IDL.Opt(IDL.Tuple(ContentId, IDL.Principal))],
      []
    ),
    deleteAccount: IDL.Func([IDL.Principal], [], []),
    getAllContentCanisters: IDL.Func([], [IDL.Vec(CanisterId)], []),
    getCanisterOfContent: IDL.Func([ContentId], [IDL.Opt(CanisterId)], []),
    getEntriesOfCanisterToContent: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(CanisterId, ContentId))],
      []
    ),
    getPrincipalThis: IDL.Func([], [IDL.Principal], []),
    getProfileInfo: IDL.Func([UserId], [IDL.Opt(ArtistAccountData1)], []),
    getStatus: IDL.Func(
      [IDL.Opt(StatusRequest)],
      [IDL.Opt(StatusResponse)],
      []
    ),
    initCanister: IDL.Func([], [IDL.Bool], []),
    removeContent: IDL.Func([ContentId, IDL.Nat], [], []),
    transferFreezingThresholdCycles: IDL.Func([], [], []),
    updateProfileInfo: IDL.Func([ArtistAccountData1], [IDL.Bool], []),
    version: IDL.Func([], [IDL.Nat], ['query'])
  });
  return ArtistBucket;
};
export const init = () => [];
