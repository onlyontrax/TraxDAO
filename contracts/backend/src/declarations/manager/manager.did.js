export const idlFactory = ({ IDL }) => {
  const Timestamp = IDL.Int;
  const ArtistAccountData = IDL.Record({
    'createdAt' : Timestamp,
    'userPrincipal' : IDL.Principal,
  });
  const FanAccountData = IDL.Record({
    'createdAt' : Timestamp,
    'userPrincipal' : IDL.Principal,
  });
  const UserId = IDL.Principal;
  const UserType = IDL.Variant({ 'fan' : IDL.Null, 'artist' : IDL.Null });
  const CanisterId = IDL.Principal;
  const StatusRequest = IDL.Record({
    'memory_size' : IDL.Bool,
    'version' : IDL.Bool,
    'cycles' : IDL.Bool,
    'heap_memory_size' : IDL.Bool,
  });
  const StatusResponse = IDL.Record({
    'memory_size' : IDL.Opt(IDL.Nat),
    'version' : IDL.Opt(IDL.Nat),
    'cycles' : IDL.Opt(IDL.Nat),
    'heap_memory_size' : IDL.Opt(IDL.Nat),
  });
  return IDL.Service({
    'changeCanisterSize' : IDL.Func([IDL.Nat], [], ['oneway']),
    'changeCycleAmount' : IDL.Func([IDL.Nat], [], ['oneway']),
    'createProfileArtist' : IDL.Func([ArtistAccountData], [IDL.Principal], []),
    'createProfileFan' : IDL.Func([FanAccountData], [IDL.Principal], []),
    'cyclesBalance' : IDL.Func([], [IDL.Nat], ['query']),
    'deleteAccountCanister' : IDL.Func(
        [UserId, IDL.Principal, UserType],
        [IDL.Bool],
        [],
      ),
    'getArtistAccountEntries' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(UserId, CanisterId))],
        ['query'],
      ),
    'getAvailableMemoryCanister' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(IDL.Nat)],
        [],
      ),
    'getCanisterArtist' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(IDL.Principal)],
        ['query'],
      ),
    'getCanisterFan' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(IDL.Principal)],
        ['query'],
      ),
    'getFanAccountEntries' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Principal))],
        ['query'],
      ),
    'getOwnerOfArtistCanister' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(UserId)],
        ['query'],
      ),
    'getOwnerOfFanCanister' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(UserId)],
        ['query'],
      ),
    'getStatus' : IDL.Func(
        [IDL.Opt(StatusRequest)],
        [IDL.Opt(StatusResponse)],
        ['query'],
      ),
    'getTotalArtistAccounts' : IDL.Func([], [IDL.Nat], ['query']),
    'getTotalFanAccounts' : IDL.Func([], [IDL.Nat], ['query']),
    'installCode' : IDL.Func(
        [IDL.Principal, IDL.Vec(IDL.Nat8), IDL.Vec(IDL.Nat8)],
        [],
        [],
      ),
    'transferCyclesToAccountCanister' : IDL.Func(
        [IDL.Principal, IDL.Nat],
        [],
        [],
      ),
    'transferCyclesToCanister' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'transferCyclesToContentCanister' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat],
        [],
        [],
      ),
    'transferOwnershipArtist' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [],
        [],
      ),
    'transferOwnershipFan' : IDL.Func([IDL.Principal, IDL.Principal], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
