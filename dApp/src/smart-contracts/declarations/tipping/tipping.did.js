/* eslint-disable camelcase, @typescript-eslint/no-unused-vars */
export const idlFactory = ({ IDL }) => {
  const Network = IDL.Variant({
    Mainnet: IDL.Null,
    Regtest: IDL.Null,
    Testnet: IDL.Null
  });
  const AccountIdentifier__1 = IDL.Variant({
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
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const Tokens = IDL.Record({ e8s: IDL.Nat64 });
  const ArtistID__1 = IDL.Principal;
  const FanID = IDL.Principal;
  const Timestamp = IDL.Int;
  const Ticker = IDL.Text;
  const Percentage = IDL.Float64;
  const ArtistID = IDL.Principal;
  const Participants = IDL.Record({
    participantPercentage: Percentage,
    participantID: ArtistID
  });
  const TippingParticipants = IDL.Vec(Participants);
  const Tipping = IDL.Service({
    accountIdentifierToBlob: IDL.Func(
      [AccountIdentifier__1],
      [AccountIdentifierToBlobResult],
      []
    ),
    canisterAccount: IDL.Func([], [AccountIdentifier], ['query']),
    canisterBTCAddress: IDL.Func([], [IDL.Text], []),
    canisterBalance: IDL.Func([], [Tokens], []),
    changePlatformFee: IDL.Func([IDL.Float64], [], []),
    cyclesBalance: IDL.Func([], [IDL.Nat], []),
    drainCanisterBalance: IDL.Func(
      [IDL.Nat64, IDL.Principal],
      [IDL.Bool],
      []
    ),
    getAllTippingTransactions: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(ArtistID__1, FanID, Timestamp, IDL.Nat, Ticker))],
      ['query']
    ),
    getBalanceBTC: IDL.Func([IDL.Text], [IDL.Nat64], []),
    getTipDataArtist: IDL.Func(
      [ArtistID__1],
      [IDL.Vec(IDL.Tuple(FanID, Timestamp, IDL.Nat, Ticker))],
      ['query']
    ),
    getTipDataFan: IDL.Func(
      [FanID],
      [IDL.Vec(IDL.Tuple(ArtistID__1, Timestamp, IDL.Nat, Ticker))],
      ['query']
    ),
    getUserAddressBTC1: IDL.Func([IDL.Principal], [IDL.Text], []),
    getUserAddressBTC2: IDL.Func([IDL.Principal], [IDL.Text], []),
    sendTip: IDL.Func(
      [IDL.Nat64, TippingParticipants, IDL.Nat64, Ticker],
      [],
      []
    )
  });
  return Tipping;
};
export const init = ({ IDL }) => {
  const Network = IDL.Variant({
    Mainnet: IDL.Null,
    Regtest: IDL.Null,
    Testnet: IDL.Null
  });
  return [Network];
};
