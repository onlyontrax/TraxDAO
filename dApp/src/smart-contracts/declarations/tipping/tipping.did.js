export const idlFactory = ({ IDL }) => {
  const AccountIdentifier__1 = IDL.Variant({
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
  const ArtistID__1 = IDL.Principal;
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const Ticker = IDL.Text;
  const FanID = IDL.Principal;
  const Timestamp = IDL.Int;
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
  const Tokens = IDL.Record({ 'e8s' : IDL.Nat64 });
  const Percentage = IDL.Float64;
  const ArtistID = IDL.Principal;
  const Participants = IDL.Record({
    'participantPercentage' : Percentage,
    'participantID' : ArtistID,
  });
  const TippingParticipants = IDL.Vec(Participants);
  const Tipping = IDL.Service({
    'accountIdentifierToBlob' : IDL.Func(
        [AccountIdentifier__1],
        [AccountIdentifierToBlobResult],
        [],
      ),
    'addToReferralMap' : IDL.Func([ArtistID__1, ArtistID__1], [], []),
    'canisterAccount' : IDL.Func([], [AccountIdentifier], []),
    'changePlatformFee' : IDL.Func([IDL.Float64], [], []),
    'ckbtcBalance' : IDL.Func([IDL.Principal], [IDL.Nat], []),
    'ckbtcBalanceOfCanister' : IDL.Func([], [IDL.Nat], []),
    'cyclesBalance' : IDL.Func([], [IDL.Nat], ['query']),
    'drainCanisterBalance' : IDL.Func(
        [IDL.Nat64, IDL.Principal, Ticker],
        [IDL.Bool],
        [],
      ),
    'getAllTippingTransactions' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(ArtistID__1, FanID, Timestamp, IDL.Nat, Ticker))],
        ['query'],
      ),
    'getStatus' : IDL.Func(
        [IDL.Opt(StatusRequest)],
        [IDL.Opt(StatusResponse)],
        [],
      ),
    'icpBalance' : IDL.Func([IDL.Principal], [Tokens], []),
    'icpBalanceOfCanister' : IDL.Func([], [Tokens], []),
    'myAccountId' : IDL.Func([IDL.Principal], [AccountIdentifier], []),
    'sendTip' : IDL.Func(
        [IDL.Nat64, TippingParticipants, IDL.Nat64, Ticker],
        [],
        [],
      ),
    'traxBalance' : IDL.Func([IDL.Principal], [IDL.Nat], []),
    'traxBalanceOfCanister' : IDL.Func([], [IDL.Nat], []),
  });
  return Tipping;
};
export const init = ({ IDL }) => { return []; };
