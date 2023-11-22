export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const Percentage = IDL.Float64;
  const ArtistID = IDL.Principal;
  const Participants = IDL.Record({
    'participantPercentage' : Percentage,
    'participantID' : ArtistID,
  });
  const FileExtension = IDL.Variant({
    'aac' : IDL.Null,
    'avi' : IDL.Null,
    'gif' : IDL.Null,
    'jpg' : IDL.Null,
    'mp3' : IDL.Null,
    'mp4' : IDL.Null,
    'png' : IDL.Null,
    'svg' : IDL.Null,
    'wav' : IDL.Null,
    'jpeg' : IDL.Null,
  });
  const SongMetaData = IDL.Record({
    'id' : IDL.Text,
    'status' : IDL.Text,
    'ticker' : IDL.Text,
    'logo' : IDL.Vec(IDL.Nat8),
    'name' : IDL.Text,
    'size' : IDL.Nat64,
    'description' : IDL.Text,
    'totalSupply' : IDL.Nat,
    'chunkCount' : IDL.Nat64,
    'schedule' : Time,
    'price' : IDL.Nat64,
    'royalty' : IDL.Vec(Participants),
    'extension' : FileExtension,
  });
  const TokenIdentifier__1 = IDL.Text;
  const TokenIdentifier = IDL.Text;
  const CommonError = IDL.Variant({
    'InvalidToken' : TokenIdentifier,
    'Other' : IDL.Text,
  });
  const Result_3 = IDL.Variant({ 'ok' : IDL.Principal, 'err' : CommonError });
  const ArtistID__1 = IDL.Principal;
  const Tokens = IDL.Record({ 'e8s' : IDL.Nat64 });
  const TokenIndex = IDL.Nat32;
  const StatusRequest = IDL.Record({
    'memory_size' : IDL.Bool,
    'cycles' : IDL.Bool,
    'heap_memory_size' : IDL.Bool,
  });
  const StatusResponse = IDL.Record({
    'memory_size' : IDL.Opt(IDL.Nat),
    'cycles' : IDL.Opt(IDL.Nat),
    'heap_memory_size' : IDL.Opt(IDL.Nat),
  });
  const ExtMetadata = IDL.Variant({
    'fungible' : IDL.Record({
      'decimals' : IDL.Nat8,
      'metadata' : IDL.Opt(IDL.Vec(IDL.Nat8)),
      'name' : IDL.Text,
      'symbol' : IDL.Text,
    }),
    'nonfungible' : IDL.Record({ 'metadata' : IDL.Opt(IDL.Vec(IDL.Nat8)) }),
  });
  const Result_2 = IDL.Variant({ 'ok' : ExtMetadata, 'err' : CommonError });
  const User = IDL.Principal;
  const MintRequest = IDL.Record({
    'to' : User,
    'metadata' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : CommonError });
  const Result = IDL.Variant({
    'ok' : IDL.Vec(TokenIndex),
    'err' : CommonError,
  });
  const SongNFT = IDL.Service({
    'bearer' : IDL.Func([TokenIdentifier__1], [Result_3], ['query']),
    'changeCanisterSize' : IDL.Func([IDL.Nat], [], ['oneway']),
    'changeCycleAmount' : IDL.Func([IDL.Nat], [], ['oneway']),
    'checkCyclesBalance' : IDL.Func([], [], []),
    'getAllArtistContentPayments' : IDL.Func(
        [ArtistID__1],
        [
          IDL.Vec(
            IDL.Tuple(IDL.Text, IDL.Principal, IDL.Int, IDL.Nat, IDL.Text)
          ),
        ],
        [],
      ),
    'getAllContentPayments' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Tuple(
              IDL.Text,
              ArtistID__1,
              IDL.Principal,
              IDL.Int,
              IDL.Nat,
              IDL.Text,
            )
          ),
        ],
        [],
      ),
    'getAllFanContentPayments' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Int, IDL.Nat, IDL.Text))],
        [],
      ),
    'getBalance' : IDL.Func([], [Tokens], []),
    'getContentChunk' : IDL.Func([IDL.Nat], [IDL.Opt(IDL.Vec(IDL.Nat8))], []),
    'getFanSongs' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(IDL.Vec(IDL.Text))],
        ['query'],
      ),
    'getMinter' : IDL.Func([], [IDL.Principal], ['query']),
    'getRegistry' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(TokenIndex, IDL.Principal))],
        [],
      ),
    'getStatus' : IDL.Func(
        [IDL.Opt(StatusRequest)],
        [IDL.Opt(StatusResponse)],
        [],
      ),
    'getTokens' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(TokenIndex, ExtMetadata))],
        [],
      ),
    'initCanister' : IDL.Func([], [IDL.Bool], []),
    'metadata' : IDL.Func([TokenIdentifier__1], [Result_2], ['query']),
    'mintNFT' : IDL.Func([MintRequest], [IDL.Text], []),
    'putContentChunk' : IDL.Func([IDL.Nat, IDL.Vec(IDL.Nat8)], [], []),
    'supply' : IDL.Func([], [Result_1], []),
    'tokens' : IDL.Func([IDL.Principal], [Result], []),
  });
  return SongNFT;
};
export const init = ({ IDL }) => {
  const Time = IDL.Int;
  const Percentage = IDL.Float64;
  const ArtistID = IDL.Principal;
  const Participants = IDL.Record({
    'participantPercentage' : Percentage,
    'participantID' : ArtistID,
  });
  const FileExtension = IDL.Variant({
    'aac' : IDL.Null,
    'avi' : IDL.Null,
    'gif' : IDL.Null,
    'jpg' : IDL.Null,
    'mp3' : IDL.Null,
    'mp4' : IDL.Null,
    'png' : IDL.Null,
    'svg' : IDL.Null,
    'wav' : IDL.Null,
    'jpeg' : IDL.Null,
  });
  const SongMetaData = IDL.Record({
    'id' : IDL.Text,
    'status' : IDL.Text,
    'ticker' : IDL.Text,
    'logo' : IDL.Vec(IDL.Nat8),
    'name' : IDL.Text,
    'size' : IDL.Nat64,
    'description' : IDL.Text,
    'totalSupply' : IDL.Nat,
    'chunkCount' : IDL.Nat64,
    'schedule' : Time,
    'price' : IDL.Nat64,
    'royalty' : IDL.Vec(Participants),
    'extension' : FileExtension,
  });
  return [IDL.Opt(SongMetaData), IDL.Principal];
};
