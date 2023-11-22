export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Variant({
    'principal' : IDL.Principal,
    'blob' : IDL.Vec(IDL.Nat8),
    'text' : IDL.Text,
  });
  const AccountIdentifierToBlobArgs = IDL.Record({
    'canisterId' : IDL.Opt(IDL.Principal),
    'accountIdentifier' : AccountIdentifier,
  });
  const AccountIdentifierToBlobSuccess = IDL.Vec(IDL.Nat8);
  const AccountIdentifierToBlobErr = IDL.Record({
    'kind' : IDL.Variant({
      'InvalidAccountIdentifier' : IDL.Null,
      'Other' : IDL.Null,
    }),
    'message' : IDL.Opt(IDL.Text),
  });
  const AccountIdentifierToBlobResult = IDL.Variant({
    'ok' : AccountIdentifierToBlobSuccess,
    'err' : AccountIdentifierToBlobErr,
  });
  const AccountIdentifier__1 = IDL.Variant({
    'principal' : IDL.Principal,
    'blob' : IDL.Vec(IDL.Nat8),
    'text' : IDL.Text,
  });
  const AccountIdentifierToTextArgs = IDL.Record({
    'canisterId' : IDL.Opt(IDL.Principal),
    'accountIdentifier' : AccountIdentifier,
  });
  const AccountIdentifierToTextSuccess = IDL.Text;
  const AccountIdentifierToTextErr = IDL.Record({
    'kind' : IDL.Variant({
      'InvalidAccountIdentifier' : IDL.Null,
      'Other' : IDL.Null,
    }),
    'message' : IDL.Opt(IDL.Text),
  });
  const AccountIdentifierToTextResult = IDL.Variant({
    'ok' : AccountIdentifierToTextSuccess,
    'err' : AccountIdentifierToTextErr,
  });
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
  const TicketMetaData = IDL.Record({
    'id' : IDL.Text,
    'status' : IDL.Text,
    'ticker' : IDL.Text,
    'logo' : IDL.Vec(IDL.Nat8),
    'name' : IDL.Text,
    'description' : IDL.Text,
    'totalSupply' : IDL.Nat,
    'schedule' : Time,
    'price' : IDL.Nat64,
    'royalty' : IDL.Vec(Participants),
    'location' : IDL.Text,
    'eventDate' : IDL.Text,
    'eventTime' : IDL.Text,
  });
  const NFT = IDL.Record({
    'id' : IDL.Text,
    'owner' : IDL.Principal,
    'productType' : IDL.Text,
    'canisterId' : IDL.Principal,
  });
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
  return IDL.Service({
    'accountIdentifierToBlob' : IDL.Func(
        [AccountIdentifierToBlobArgs],
        [AccountIdentifierToBlobResult],
        [],
      ),
    'accountIdentifierToBlobFromText' : IDL.Func(
        [AccountIdentifier__1],
        [AccountIdentifierToBlobResult],
        [],
      ),
    'accountIdentifierToText' : IDL.Func(
        [AccountIdentifierToTextArgs],
        [AccountIdentifierToTextResult],
        [],
      ),
    'candidAccountIdentifierToBlob' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(IDL.Nat8)],
        [],
      ),
    'createSong' : IDL.Func([IDL.Principal, SongMetaData], [IDL.Principal], []),
    'createTicket' : IDL.Func(
        [IDL.Principal, TicketMetaData],
        [IDL.Principal],
        [],
      ),
    'cyclesBalance' : IDL.Func([], [IDL.Nat], []),
    'getAllSongNFTs' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Tuple(
              IDL.Text,
              IDL.Text,
              IDL.Text,
              IDL.Nat,
              IDL.Nat64,
              IDL.Text,
              IDL.Principal,
            )
          ),
        ],
        [],
      ),
    'getAllTicketNFTs' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Tuple(
              IDL.Text,
              IDL.Text,
              IDL.Text,
              IDL.Text,
              IDL.Text,
              IDL.Text,
              IDL.Nat,
              IDL.Nat64,
              IDL.Text,
              IDL.Principal,
            )
          ),
        ],
        [],
      ),
    'getArtistNfts' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text, IDL.Principal))],
        ['query'],
      ),
    'getArtistSongs' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(IDL.Vec(IDL.Text))],
        ['query'],
      ),
    'getAvailableMemoryCanister' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(IDL.Nat)],
        [],
      ),
    'getCallerId' : IDL.Func([], [IDL.Principal], []),
    'getCallerIdentifier' : IDL.Func([], [IDL.Vec(IDL.Nat8)], []),
    'getCallerIdentifierAsText' : IDL.Func([], [IDL.Text], []),
    'getNFT' : IDL.Func([IDL.Text], [IDL.Opt(NFT)], []),
    'getSongMetadata' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(SongMetaData)],
        ['query'],
      ),
    'getStatus' : IDL.Func(
        [IDL.Opt(StatusRequest)],
        [IDL.Opt(StatusResponse)],
        [],
      ),
    'getTicketMetaData' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(TicketMetaData)],
        ['query'],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
