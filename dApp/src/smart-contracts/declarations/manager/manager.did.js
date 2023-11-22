export const idlFactory = ({ IDL }) => {
  const Timestamp = IDL.Int;
  const ArtistAccountData = IDL.Record({
    createdAt: Timestamp,
    userPrincipal: IDL.Principal
  });
  const FanAccountData = IDL.Record({
    createdAt: Timestamp,
    userPrincipal: IDL.Principal
  });
  const UserId = IDL.Principal;
  const UserType = IDL.Variant({ fan: IDL.Null, artist: IDL.Null });
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
  return IDL.Service({
    changeCanisterSize: IDL.Func([IDL.Nat], [], ['oneway']),
    changeCycleAmount: IDL.Func([IDL.Nat], [], ['oneway']),
    createProfileArtist: IDL.Func([ArtistAccountData], [IDL.Principal], []),
    createProfileFan: IDL.Func([FanAccountData], [IDL.Principal], []),
    cyclesBalance: IDL.Func([], [IDL.Nat], []),
    deleteAccountCanister: IDL.Func(
      [UserId, IDL.Principal, UserType],
      [IDL.Bool],
      []
    ),
    deleteContentCanister: IDL.Func([IDL.Principal], [], []),
    getArtistAccountEntries: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Principal))],
      ['query']
    ),
    getAvailableMemoryCanister: IDL.Func(
      [IDL.Principal],
      [IDL.Opt(IDL.Nat)],
      []
    ),
    getCanisterArtist: IDL.Func(
      [IDL.Principal],
      [IDL.Opt(IDL.Principal)],
      []
    ),
    getCanisterFan: IDL.Func([IDL.Principal], [IDL.Opt(IDL.Principal)], []),
    getFanAccountEntries: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Principal))],
      []
    ),
    getOwnerOfArtistCanister: IDL.Func(
      [IDL.Principal],
      [IDL.Opt(UserId)],
      []
    ),
    getOwnerOfFanCanister: IDL.Func([IDL.Principal], [IDL.Opt(UserId)], []),
    getStatus: IDL.Func(
      [IDL.Opt(StatusRequest)],
      [IDL.Opt(StatusResponse)],
      []
    ),
    getTotalArtistAccounts: IDL.Func([], [IDL.Nat], ['query']),
    getTotalFanAccounts: IDL.Func([], [IDL.Nat], ['query']),
    installCode: IDL.Func(
      [IDL.Principal, IDL.Vec(IDL.Nat8), IDL.Vec(IDL.Nat8)],
      [],
      []
    ),
    transferCycles: IDL.Func([IDL.Principal, IDL.Nat], [], []),
    transferOwnershipArtist: IDL.Func(
      [IDL.Principal, IDL.Principal],
      [],
      []
    ),
    transferOwnershipFan: IDL.Func([IDL.Principal, IDL.Principal], [], [])
  });
};
export const init = () => [];
