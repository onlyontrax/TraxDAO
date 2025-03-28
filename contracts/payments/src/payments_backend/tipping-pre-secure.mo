import Principal      "mo:base/Principal";
import Nat           "mo:base/Nat";
import Nat64         "mo:base/Nat64";
import Text          "mo:base/Text";
import Iter          "mo:base/Iter";
import Time          "mo:base/Time";
import Int           "mo:base/Int";
import Error         "mo:base/Error";
import Debug         "mo:base/Debug";
import Result        "mo:base/Result";
import Buffer        "mo:base/Buffer";
import Map           "mo:stable-hash-map/Map";
import Float         "mo:base/Float";
import Array         "mo:base/Array";
import Hash          "mo:base/Hash";
import Option        "mo:base/Option";
import Blob          "mo:base/Blob";
import T             "./types";
import Account       "./utils/account";
import Env           "./utils/env";
import U             "./utils/utils";

actor class Tipping() = this {
    
    // Types
    type ArtistID = T.ArtistID;
    type FanID = T.FanID;
    type Ticker = T.Ticker;
    type Timestamp = T.Timestamp;
    type TippingParticipants = T.TippingParticipants;
    
    // ICRC1/2 Types
    type Account = { owner : Principal; subaccount : ?Blob };
    type TransferArgs = {
        amount: Nat;
        from: Account;
        to: Account;
        fee: ?Nat;
        memo: ?Blob;
        created_at_time: ?Nat64;
    };

    type TransferFromResult = { #Ok : Nat; #Err : TransferFromError };
type TransferFromError = {
    #BadFee : { expected_fee : Nat };
    #BadBurn : { min_burn_amount : Nat };
    #InsufficientFunds : { balance : Nat };
    #InsufficientAllowance : { allowance : Nat };
    #TooOld;
    #CreatedInFuture : { ledger_time : Nat64 };
    #Duplicate : { duplicate_of : Nat };
    #TemporarilyUnavailable;
    #GenericError : { error_code : Nat; message : Text };
};
    
    type ApproveArgs = {
        amount: Nat;
        spender: Account;
        created_at_time: ?Nat64;
        expires_at: ?Nat64;
        expected_allowance: ?Nat;
        memo: ?Blob;
        fee: ?Nat;
        from_subaccount: ?[Nat8];
    };

    type Allowance = {
        allowance: Nat;
        expires_at: ?Nat64;
    };
    type AllowanceArgs = {
      account: Account;
      spender: Account;
    };


    // Constants
    let FEE : Nat64 = 10_000;
    let FEE_CKBTC : Nat64 = 10;
    let FEE_TRAX : Nat64 = 10;
    var PLATFORM_FEE: Float = 0.10;
    let VERSION: Nat = 2;

    // Actor interfaces

    type TransferFromArgs = {
    spender_subaccount : ?Blob;
    from : Account;
    to : Account;
    amount : Nat;
    fee : ?Nat;
    memo : ?Blob;
    created_at_time : ?Nat64;
};

// Update the TRAXLedger actor interface
let TRAXLedger = actor "emww2-4yaaa-aaaaq-aacbq-cai" : actor {
    icrc2_transfer_from : shared TransferFromArgs -> async TransferFromResult;
    icrc2_approve : shared ApproveArgs -> async { #Ok : Nat; #Err : Text };
    icrc2_allowance : shared query (args: AllowanceArgs) -> async Allowance;
    icrc1_balance_of : shared query (Account) -> async Nat;
};

    // Stable storage
    private let { ihash; n64hash; phash } = Map;
    
    // Optimized data structure for tips
    private type TipRecord = {
        timestamp: Timestamp;
        amount: Nat;
        ticker: Ticker;
    };
    private type TippingData            = Map.Map<Timestamp, (Nat, Ticker)>;
    private type FanToTippingData       = Map.Map<FanID, TippingData>;

    stable let tippingMap               = Map.new<ArtistID, FanToTippingData>(phash);
     
  
    // Cache for active allowances
    private type AllowanceCache = {
        amount: Nat;
        expires_at: Nat64;
        timestamp: Nat64;
    };

    private type AllowanceData = Map.Map<Ticker, AllowanceCache>;
    private let allowanceCache = Map.new<Principal, AllowanceData>(phash);




public shared({caller}) func sendTip(
    participants: TippingParticipants, 
    amount: Nat64, 
    ticker: Ticker
) : async Result.Result<[Nat], Text> {
    assert(amount > 0);
    Debug.print("in sendTip function");
    
    let spenderAccount = { owner = Principal.fromActor(this); subaccount = null };
    let fromAccount = { owner = caller; subaccount = null };
    
    let allowance = await getLedger(ticker).icrc2_allowance({
        account = fromAccount;
        spender = spenderAccount;
    });
    if (allowance.allowance < Nat64.toNat(amount)) {
        return #err("Insufficient allowance");
    };

    Debug.print("after verifying allowance");
    let transfers = calculateAmounts(amount, participants, ticker);
    Debug.print("after calculateAmounts");

    try {
        var results : [Result.Result<Nat, Text>] = [];
    
for ((recipient, amount) in Iter.fromArray(transfers)) {
    let transferFromArgs : TransferFromArgs = {
        spender_subaccount = null;
        from = fromAccount;
        to = { owner = recipient; subaccount = null };
        amount = Nat64.toNat(amount);
        fee = ?Nat64.toNat(getFee(ticker));
        memo = null;
        created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
    };

    let result = await getLedger(ticker).icrc2_transfer_from(transferFromArgs);
    Debug.print("after send TRAX");
    
    switch(result) {
        case (#Ok(blockIndex)) {
            results := Array.append(results, [#ok(blockIndex)]);
            recordTip(caller, recipient, amount, ticker, Time.now());
        };
        case (#Err(err)) {
            switch(err) {
                case (#GenericError(e)) {
                    return #err("Transfer failed: " # e.message);
                };
                case (#InsufficientFunds(e)) {
                    return #err("Insufficient funds. Balance: " # Nat.toText(e.balance));
                };
                case (#InsufficientAllowance(e)) {
                    return #err("Insufficient allowance. Allowance: " # Nat.toText(e.allowance));
                };
                case (_) {
                    return #err("Transfer failed: " # debug_show(err));
                };
            };
        };
    };
};
        
        #ok(Array.map<Result.Result<Nat, Text>, Nat>(
            results,
            func(r) = switch(r) { 
                case (#ok(n)) n;
                case (#err(_)) 0
            }
        ))
    } catch (e) {
        #err("Batch transfer failed: " # Error.message(e))
    };
};


    public func approveSpending(
        amount: Nat64,
        ticker: Ticker,
        expires_in: ?Nat64  // Seconds from now
    ) : async { #Ok : Nat; #Err : Text } {
        let now = Nat64.fromNat(Int.abs(Time.now()));
        let expires_at = Option.map<Nat64, Nat64>(
            expires_in,
            func(duration) = now + (duration * 1_000_000_000)
        );
        
        let approveArgs : ApproveArgs = {
            amount = Nat64.toNat(amount);
            spender = { owner = Principal.fromActor(this); subaccount = null };
            created_at_time = ?now;
            expires_at = expires_at;
            expected_allowance = null;
            memo = null;
            fee = null;
            from_subaccount = null;
        };

        await getLedger(ticker).icrc2_approve(approveArgs);
    };




    public shared({ caller }) func getMyBalance(ticker: Ticker) : async Result.Result<Nat, Text> {
        let account = {
            owner = caller;
            subaccount = null;
        };

        try {
            let balance = await getLedger(ticker).icrc1_balance_of(account);
            #ok(balance)
        } catch (e) {
            #err("Failed to fetch balance: " # Error.message(e))
        };
    };





    // State Management Functions
    private func recordTip(
        from: Principal,
        to: Principal,
        amount: Nat64,
        ticker: Ticker,
        timestamp: Timestamp
    ) {
        
        switch(Map.get(tippingMap, phash, to)) {
            case(?fanToTippingData){
      
        switch(Map.get(fanToTippingData, phash, from)){
            case(?tippingData){
                ignore Map.put(tippingData, ihash, timestamp, (Nat64.toNat(amount), ticker));
            };
            case null {
                var y : TippingData = Map.new<Timestamp, (Nat, Ticker)>(ihash);
                ignore Map.put(y, ihash, timestamp, (Nat64.toNat(amount), ticker));
                ignore Map.put(fanToTippingData, phash, from, y);
            };
        };
        
      };
      case null {
          var y : TippingData = Map.new<Timestamp, (Nat, Ticker)>(ihash);
          var x : FanToTippingData = Map.new<FanID, TippingData>(phash);
          ignore Map.put(y, ihash, timestamp, (Nat64.toNat(amount), ticker));
          ignore Map.put(x, phash, from, y);
          ignore Map.put(tippingMap, phash, to, x);
      };
        };
    };










    // Query Functions
    public query func getAllTippingTransactions() : async [(ArtistID, FanID, Timestamp, Nat, Ticker)]{
      var data = Buffer.Buffer<(ArtistID, FanID, Timestamp, Nat, Ticker)>(2);

      for((key, val) in Map.entries(tippingMap)){
        var artist: ArtistID = key;
        for((key, value) in Map.entries(val)){
          var fanID: FanID = key;
            for((k, v) in Map.entries(value)){
                var timestamp: Timestamp = k;
                var amount: Nat = v.0;
                var ticker: Ticker = v.1;
                data.add(artist, fanID, timestamp, amount, ticker);
            }
        }
      };
     return Buffer.toArray(data);
    };










    // Helper Functions
private func getLedger(ticker: Ticker) : actor {
    icrc2_transfer_from : shared TransferFromArgs -> async TransferFromResult;
    icrc2_approve : shared ApproveArgs -> async { #Ok : Nat; #Err : Text };
    icrc2_allowance : shared query (args: AllowanceArgs) -> async Allowance;
    icrc1_balance_of : shared query (Account) -> async Nat;
} {
    switch(ticker) {
        case "TRAX" TRAXLedger;
        case _ Debug.trap("Invalid ticker");
    };
};

    private func getFee(ticker: Ticker) : Nat64 {
        switch(ticker) {
            case "ICP" FEE;
            case "ckBTC" FEE_CKBTC;
            case "TRAX" FEE_TRAX;
            case _ Debug.trap("Invalid ticker");
        };
    };

    private func calculateAmounts(totalAmount: Nat64, participants: TippingParticipants, ticker: Ticker) : [(Principal, Nat64)] {
        let fee = getFee(ticker);
        let netAmount = totalAmount - fee;
        let platformFee = Float.toInt(Float.fromInt(Nat64.toNat(netAmount)) * PLATFORM_FEE);
        let remainingAmount = netAmount - Nat64.fromNat(Int.abs(platformFee));
        
        let amounts = Buffer.Buffer<(Principal, Nat64)>(participants.size() + 1);
        
        // Add platform fee
        amounts.add((Principal.fromText(Env.traxAccount), Nat64.fromNat(Int.abs(platformFee))));
        
        // Calculate participant amounts
        for (participant in participants.vals()) {
            let amount = Float.toInt(Float.fromInt(Nat64.toNat(remainingAmount)) * participant.participantPercentage);
            amounts.add((participant.participantID, Nat64.fromNat(Int.abs(amount))));
        };
        
        Buffer.toArray(amounts);
    };










    // Admin Functions
    public shared({caller}) func updatePlatformFee(newFee: Float) : async () {
        assert(U.isAdmin(caller));
        assert(newFee >= 0 and newFee <= 1);
        PLATFORM_FEE := newFee;
    };










    // System Functions
    public query func getVersion() : async Nat {
        VERSION
    };
};
