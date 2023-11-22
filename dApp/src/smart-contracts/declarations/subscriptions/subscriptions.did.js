/* eslint-disable camelcase, @typescript-eslint/no-unused-vars */
export const idlFactory = ({ IDL }) => {
  const Tokens = IDL.Record({ e8s: IDL.Nat64 });
  const AccountIdentifier__2 = IDL.Variant({
    principal: IDL.Principal,
    blob: IDL.Vec(IDL.Nat8),
    text: IDL.Text
  });
  const AccountIdentifierToBlobSuccess = IDL.Vec(IDL.Nat8);
  const AccountIdentifierToBlobErr = IDL.Record({
    kind: IDL.Variant({
      InvalidAccountIdentifier: IDL.Null,
      Other: IDL.Null
    }),
    message: IDL.Opt(IDL.Text)
  });
  const AccountIdentifierToBlobResult = IDL.Variant({
    ok: AccountIdentifierToBlobSuccess,
    err: AccountIdentifierToBlobErr
  });
  const AccountIdentifier__1 = IDL.Vec(IDL.Nat8);
  const FanID = IDL.Principal;
  const ArtistID = IDL.Principal;
  const Ticker = IDL.Text;
  const Timestamp = IDL.Int;
  const Token = IDL.Record({ symbol: IDL.Text });
  const GetAccountIdentifierArgs = IDL.Record({
    principal: IDL.Principal,
    token: Token
  });
  const AccountIdentifier = IDL.Variant({
    principal: IDL.Principal,
    blob: IDL.Vec(IDL.Nat8),
    text: IDL.Text
  });
  const GetAccountIdentifierSuccess = IDL.Record({
    accountIdentifier: AccountIdentifier
  });
  const GetAccountIdentifierErr = IDL.Record({
    kind: IDL.Variant({ InvalidToken: IDL.Null, Other: IDL.Null }),
    message: IDL.Opt(IDL.Text)
  });
  const GetAccountIdentifierResult = IDL.Variant({
    ok: GetAccountIdentifierSuccess,
    err: GetAccountIdentifierErr
  });
  const SubType = IDL.Variant({ monthly: IDL.Null, yearly: IDL.Null });
  return IDL.Service({
    _payArtistsSub: IDL.Func([], [], []),
    accountBalance: IDL.Func([IDL.Principal], [Tokens], []),
    accountIdentifierToBlob: IDL.Func(
      [AccountIdentifier__2],
      [AccountIdentifierToBlobResult],
      []
    ),
    canisterAccount: IDL.Func([], [AccountIdentifier__1], ['query']),
    canisterBalance: IDL.Func([], [Tokens], []),
    checkLatePaymentStrikes: IDL.Func([FanID, ArtistID], [IDL.Nat], []),
    getArtistTotalSubRevenue: IDL.Func(
      [ArtistID, Ticker],
      [IDL.Opt(IDL.Nat64)],
      []
    ),
    getExchangeRate: IDL.Func([IDL.Text], [IDL.Float64], []),
    getNumOfSubs: IDL.Func([ArtistID], [IDL.Nat32], []),
    getSubTxMapArtist: IDL.Func(
      [ArtistID],
      [IDL.Vec(IDL.Tuple(FanID, Timestamp, IDL.Nat64, Ticker))],
      []
    ),
    getSubTxMapFan: IDL.Func(
      [ArtistID],
      [IDL.Vec(IDL.Tuple(ArtistID, Timestamp, IDL.Nat64, Ticker))],
      []
    ),
    get_account_identifier: IDL.Func(
      [GetAccountIdentifierArgs],
      [GetAccountIdentifierResult],
      ['query']
    ),
    isFanSubscribed: IDL.Func([ArtistID, FanID], [IDL.Bool], []),
    subscribe: IDL.Func(
      [ArtistID, FanID, IDL.Float64, Ticker, SubType],
      [IDL.Bool],
      []
    ),
    unsubscribe: IDL.Func([ArtistID, FanID], [IDL.Bool], [])
  });
};
export const init = ({ IDL }) => [];
