export const idlFactory = ({ IDL }) => {
  const Ticker = IDL.Text;
  const Result_1 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const EventKind = IDL.Variant({
    'Error' : IDL.Null,
    'AdminAction' : IDL.Null,
    'TipSent' : IDL.Null,
    'AllowanceUpdated' : IDL.Null,
  });
  const Event = IDL.Record({
    'kind' : EventKind,
    'message' : IDL.Text,
    'timestamp' : IDL.Int,
    'details' : IDL.Opt(
      IDL.Record({
        'participants' : IDL.Opt(IDL.Vec(IDL.Principal)),
        'error' : IDL.Opt(IDL.Text),
        'amount' : IDL.Opt(IDL.Nat),
      })
    ),
    'caller' : IDL.Principal,
  });
  const ArtistID__1 = IDL.Principal;
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
  const Tokens = IDL.Record({ 'e8s' : IDL.Nat64 });
  const StatusResponse = IDL.Record({
    'memory_size' : IDL.Opt(IDL.Nat),
    'trax_balance' : IDL.Opt(IDL.Nat),
    'version' : IDL.Opt(IDL.Nat),
    'cycles' : IDL.Opt(IDL.Nat),
    'heap_memory_size' : IDL.Opt(IDL.Nat),
    'ckbtc_balance' : IDL.Opt(IDL.Nat),
    'icp_balance' : IDL.Opt(Tokens),
  });
  const Percentage = IDL.Float64;
  const ArtistID = IDL.Principal;
  const Participants = IDL.Record({
    'participantPercentage' : Percentage,
    'participantID' : ArtistID,
  });
  const TippingParticipants = IDL.Vec(Participants);
  const Result = IDL.Variant({ 'ok' : IDL.Vec(IDL.Nat), 'err' : IDL.Text });
  const Tipping = IDL.Service({
    'approveSpending' : IDL.Func(
        [IDL.Nat64, Ticker, IDL.Opt(IDL.Nat64)],
        [Result_1],
        [],
      ),
    'ckbtcBalanceOfCanister' : IDL.Func([], [IDL.Nat], []),
    'getAllEvents' : IDL.Func([], [IDL.Vec(Event)], ['query']),
    'getAllTippingTransactions' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(ArtistID__1, FanID, Timestamp, IDL.Nat, Ticker))],
        ['query'],
      ),
    'getMyBalance' : IDL.Func([Ticker], [Result_1], []),
    'getStatus' : IDL.Func(
        [IDL.Opt(StatusRequest)],
        [IDL.Opt(StatusResponse)],
        [],
      ),
    'sendTip' : IDL.Func(
        [TippingParticipants, IDL.Nat64, Ticker],
        [Result],
        [],
      ),
    'traxBalanceOfCanister' : IDL.Func([], [IDL.Nat], []),
    'updatePlatformFee' : IDL.Func([IDL.Float64], [], []),
  });
  return Tipping;
};
export const init = ({ IDL }) => { return []; };
