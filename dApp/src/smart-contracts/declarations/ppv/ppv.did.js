export const idlFactory = ({ IDL }) => {
  const Tokens = IDL.Record({ 'e8s' : IDL.Nat64 });
  const AccountIdentifier__2 = IDL.Variant({
    'principal' : IDL.Principal,
    'blob' : IDL.Vec(IDL.Nat8),
    'text' : IDL.Text,
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
  const ContentID = IDL.Text;
  const Percentage = IDL.Float64;
  const ArtistID = IDL.Principal;
  const Participants = IDL.Record({
    'participantPercentage' : Percentage,
    'participantID' : ArtistID,
  });
  const ContentType = IDL.Text;
  const Content = IDL.Record({
    'participants' : IDL.Vec(Participants),
    'contentType' : ContentType,
    'publisher' : ArtistID,
    'price' : IDL.Float64,
    'publisherPercentage' : Percentage,
  });
  const AccountIdentifier__1 = IDL.Vec(IDL.Nat8);
  const Ticker = IDL.Text;
  const FanID = IDL.Principal;
  const ArtistID__1 = IDL.Principal;
  const Timestamp = IDL.Int;
  const ContentType__1 = IDL.Text;
  const StatusRequest = IDL.Record({
    'memory_size' : IDL.Opt(IDL.Bool),
    'trax_balance' : IDL.Opt(IDL.Bool),
    'version' : IDL.Opt(IDL.Bool),
    'cycles' : IDL.Opt(IDL.Bool),
    'heap_memory_size' : IDL.Opt(IDL.Bool),
    'ckbtc_balance' : IDL.Opt(IDL.Bool),
    'icp_balance' : IDL.Opt(IDL.Bool),
  });
  const Tokens__1 = IDL.Record({ 'e8s' : IDL.Nat64 });
  const StatusResponse = IDL.Record({
    'memory_size' : IDL.Opt(IDL.Nat),
    'trax_balance' : IDL.Opt(IDL.Nat),
    'version' : IDL.Opt(IDL.Nat),
    'cycles' : IDL.Opt(IDL.Nat),
    'heap_memory_size' : IDL.Opt(IDL.Nat),
    'ckbtc_balance' : IDL.Opt(IDL.Nat),
    'icp_balance' : IDL.Opt(Tokens__1),
  });
  const Token = IDL.Record({ 'symbol' : IDL.Text });
  const GetAccountIdentifierArgs = IDL.Record({
    'principal' : IDL.Principal,
    'token' : Token,
  });
  const AccountIdentifier = IDL.Variant({
    'principal' : IDL.Principal,
    'blob' : IDL.Vec(IDL.Nat8),
    'text' : IDL.Text,
  });
  const GetAccountIdentifierSuccess = IDL.Record({
    'accountIdentifier' : AccountIdentifier,
  });
  const GetAccountIdentifierErr = IDL.Record({
    'kind' : IDL.Variant({ 'InvalidToken' : IDL.Null, 'Other' : IDL.Null }),
    'message' : IDL.Opt(IDL.Text),
  });
  const GetAccountIdentifierResult = IDL.Variant({
    'ok' : GetAccountIdentifierSuccess,
    'err' : GetAccountIdentifierErr,
  });
  const PPV = IDL.Service({
    'accountBalance' : IDL.Func([IDL.Principal], [Tokens], []),
    'accountIdentifierToBlob' : IDL.Func(
        [AccountIdentifier__2],
        [AccountIdentifierToBlobResult],
        [],
      ),
    'addPPVContent' : IDL.Func([ContentID, Content], [], []),
    'canisterAccount' : IDL.Func([], [AccountIdentifier__1], ['query']),
    'changePlatformFee' : IDL.Func([IDL.Float64], [], []),
    'ckbtcBalanceOfCanister' : IDL.Func([], [IDL.Nat], []),
    'cyclesBalance' : IDL.Func([], [IDL.Nat], []),
    'drainCanisterBalance' : IDL.Func(
        [IDL.Nat64, IDL.Principal, Ticker],
        [IDL.Bool],
        [],
      ),
    'fanHasPaid' : IDL.Func([ContentID, FanID], [IDL.Bool], ['query']),
    'getAllArtistContentIDs' : IDL.Func(
        [ArtistID__1],
        [IDL.Vec(ContentID)],
        ['query'],
      ),
    'getAllArtistContentPayments' : IDL.Func(
        [ArtistID__1],
        [IDL.Vec(IDL.Tuple(ContentID, FanID, Timestamp, IDL.Nat, Ticker))],
        [],
      ),
    'getAllContentPayments' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Tuple(
              ContentID,
              ArtistID__1,
              FanID,
              Timestamp,
              IDL.Nat,
              Ticker,
              ContentType__1,
            )
          ),
        ],
        [],
      ),
    'getAllFanContentPayments' : IDL.Func(
        [FanID],
        [IDL.Vec(IDL.Tuple(ContentID, Timestamp, IDL.Nat, Ticker))],
        [],
      ),
    'getContent' : IDL.Func([ContentID], [IDL.Opt(Content)], ['query']),
    'getExchangeRate' : IDL.Func([IDL.Text], [IDL.Float64], []),
    'getStatus' : IDL.Func(
        [IDL.Opt(StatusRequest)],
        [IDL.Opt(StatusResponse)],
        [],
      ),
    'get_account_identifier' : IDL.Func(
        [GetAccountIdentifierArgs],
        [GetAccountIdentifierResult],
        ['query'],
      ),
    'icpBalanceOfCanister' : IDL.Func([], [Tokens], []),
    'purchaseContent' : IDL.Func(
        [IDL.Nat64, ContentID, IDL.Text, IDL.Nat64],
        [],
        [],
      ),
    'removeContent' : IDL.Func([ContentID], [], []),
    'showEntriesOfContentMap' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(ContentID, Content))],
        [],
      ),
    'traxBalanceOfCanister' : IDL.Func([], [IDL.Nat], []),
    'updatePPVContent' : IDL.Func([ContentID, Content], [], []),
  });
  return PPV;
};
export const init = ({ IDL }) => { return []; };
