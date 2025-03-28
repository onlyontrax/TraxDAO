export const idlFactory = ({ IDL }) => {
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
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const ArtistID__1 = IDL.Principal;
  const FanID = IDL.Principal;
  const Timestamp = IDL.Int;
  const ContentType__1 = IDL.Text;
  const Event = IDL.Record({
    'timestamp' : IDL.Int,
    'details' : IDL.Text,
    'caller' : IDL.Principal,
    'eventType' : IDL.Text,
  });
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
  const Ticker = IDL.Text;
  const PPV = IDL.Service({
    'addPPVContent' : IDL.Func([ContentID, Content], [Result], []),
    'approveSpending' : IDL.Func([IDL.Nat], [Result_1], []),
    'ckbtcBalanceOfCanister' : IDL.Func([], [IDL.Nat], []),
    'fanHasPaid' : IDL.Func([ContentID, IDL.Principal], [IDL.Bool], ['query']),
    'getAllContentPayments' : IDL.Func(
        [IDL.Nat, IDL.Nat],
        [
          IDL.Record({
            'total' : IDL.Nat,
            'data' : IDL.Vec(
              IDL.Tuple(
                ContentID,
                ArtistID__1,
                FanID,
                Timestamp,
                IDL.Nat,
                ContentType__1,
              )
            ),
          }),
        ],
        [],
      ),
    'getAllEvents' : IDL.Func([], [IDL.Vec(Event)], ['query']),
    'getContent' : IDL.Func([ContentID], [IDL.Opt(Content)], ['query']),
    'getStatus' : IDL.Func(
        [IDL.Opt(StatusRequest)],
        [IDL.Opt(StatusResponse)],
        [],
      ),
    'purchaseContent' : IDL.Func([ContentID, Ticker, IDL.Nat], [Result_1], []),
    'removeContent' : IDL.Func([ContentID], [Result], []),
    'traxBalanceOfCanister' : IDL.Func([], [IDL.Nat], []),
    'updatePPVContent' : IDL.Func([ContentID, Content], [Result], []),
    'updatePlatformFee' : IDL.Func([IDL.Float64], [Result], []),
  });
  return PPV;
};
export const init = ({ IDL }) => { return []; };
