import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Error "mo:base/Error";
import Debug "mo:base/Debug";
import Result "mo:base/Result";
import Buffer "mo:base/Buffer";
import Map "mo:stable-hash-map/Map";
import Float "mo:base/Float";
import Array "mo:base/Array";
import Hash "mo:base/Hash";
import Option "mo:base/Option";
import Blob "mo:base/Blob";
import T "../types";
import Account "../utils/account";
import Env "../utils/env";
import U "../utils/utils";
import B   "mo:stable-buffer/StableBuffer";
import Prim "mo:⛔";
import Cycles "mo:base/ExperimentalCycles";


actor class Tipping() = this {
    // Stable storage
    private let { ihash; thash; phash } = Map;
    // Types
    type ArtistID = T.ArtistID;
    type FanID = T.FanID;
    type Tokens = T.Tokens;
    type Ticker = T.Ticker;
    type Timestamp = T.Timestamp;
    type TippingParticipants = T.TippingParticipants;
    type StatusRequest = T.StatusRequest;
    type StatusResponse = T.StatusResponse;
    
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

        type TransferFromArgs = {
    spender_subaccount : ?Blob;
    from : Account;
    to : Account;
    amount : Nat;
    fee : ?Nat;
    memo : ?Blob;
    created_at_time : ?Nat64;
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

    // Event system
    type EventKind = {
        #TipSent;
        #AllowanceUpdated;
        #Error;
        #AdminAction;
    };

    type Event = {
        timestamp: Int;
        caller: Principal;
        kind: EventKind;
        message: Text;
        details: ?{
            amount: ?Nat;
            participants: ?[Principal];
            error: ?Text;
        };
    };

    // Constants
    let FEE_TRAX : Nat64 = 100_000;
    var PLATFORM_FEE: Float = 0.10;
    let VERSION: Nat = 310;
    let MAX_PARTICIPANTS : Nat = 20;
    let MAX_BATCH_SIZE : Nat = 50;
    let MIN_TIME_BETWEEN_TIPS : Int = 1_000_000_000; // 1 second in nanoseconds
    let ALLOWANCE_CACHE_DURATION : Int = 3600_000_000_000; // 1 hour in nanoseconds

    // Reentrancy guard
    private stable var locked : Bool = false;

    // Rate limiting
    private stable var lastTipTime = Map.new<Principal, Int>(phash);

    // Actor interface
    let TRAXLedger = actor "emww2-4yaaa-aaaaq-aacbq-cai" : actor {
        icrc2_transfer_from : shared TransferFromArgs -> async TransferFromResult;
        icrc2_approve : shared ApproveArgs -> async { #Ok : Nat; #Err : Text };
        icrc2_allowance : shared query (args: AllowanceArgs) -> async Allowance;
        icrc1_balance_of : shared query (Account) -> async Nat;
    };
    let CKBTCLedger = actor "mxzaz-hqaaa-aaaar-qaada-cai" : actor {
        icrc2_transfer_from : shared TransferFromArgs -> async TransferFromResult;
        icrc2_approve : shared ApproveArgs -> async { #Ok : Nat; #Err : Text };
        icrc2_allowance : shared query (args: AllowanceArgs) -> async Allowance;
        icrc1_balance_of : shared query (Account) -> async Nat;
    };

    
    
    // Optimized data structure for tips
    private type TipRecord = {
        timestamp: Timestamp;
        amount: Nat;
        ticker: Ticker;
    };
    private type TippingData = Map.Map<Timestamp, (Nat, Ticker)>;
    private type FanToTippingData = Map.Map<FanID, TippingData>;

    stable let tippingMap = Map.new<ArtistID, FanToTippingData>(phash);
     
    // Cache for active allowances with expiration
    private type AllowanceCache = {
        amount: Nat;
        expires_at: Nat64;
        timestamp: Nat64;
    };

    private type AllowanceData = Map.Map<Ticker, AllowanceCache>;
    private let allowanceCache = Map.new<Principal, AllowanceData>(phash);

    // Event log with limited size
    private let eventLog = B.init<Event>();

    // Event logging
    private func logEvent(caller: Principal, kind: EventKind, message: Text, details: ?{
        amount: ?Nat;
        participants: ?[Principal];
        error: ?Text;
    }) {
        let event = {
            timestamp = Time.now();
            caller;
            kind;
            message;
            details;
        };
        
        if (B.size(eventLog) >= 1000) {
            ignore B.remove(eventLog, 0); // Remove oldest event
        };
        B.add(eventLog, event);
    };

    // Rate limiting
    private func checkRateLimit(caller: Principal) : Bool {
        let now = Time.now();
        switch (Map.get(lastTipTime, phash, caller)) {
            case (?lastTime) {
                if (now - lastTime < MIN_TIME_BETWEEN_TIPS) {
                    return false;
                };
            };
            case null {};
        };
        ignore Map.put(lastTipTime, phash, caller, now);
        true
    };

    // Input validation
    private func validateParticipants(participants: TippingParticipants) : Result.Result<(), Text> {
        if (participants.size() > MAX_PARTICIPANTS) {
            return #err("Too many participants. Maximum allowed: " # Nat.toText(MAX_PARTICIPANTS));
        };

        let seen = Map.new<Principal, Bool>(phash);
        var totalPercentage : Float = 0;

        for (participant in participants.vals()) {
            switch (Map.get(seen, phash, participant.participantID)) {
                case (?_) { return #err("Duplicate participant: " # Principal.toText(participant.participantID)) };
                case null { 
                    ignore Map.put(seen, phash, participant.participantID, true);
                    totalPercentage += participant.participantPercentage;
                };
            };

            if (participant.participantPercentage <= 0 or participant.participantPercentage > 1) {
                return #err("Invalid participant percentage: " # Float.toText(participant.participantPercentage));
            };
        };

        if (totalPercentage != 1.0) {
            return #err("Total percentage must equal 1.0. Current total: " # Float.toText(totalPercentage));
        };

        #ok(())
    };

    // Main functions with improvements
    public shared({caller}) func sendTip(
        participants: TippingParticipants, 
        amount: Nat64, 
        ticker: Ticker
    ) : async Result.Result<[Nat], Text> {
        // Reentrancy check
        assert(not locked);
        locked := true;

        try {
            // Input validation
            if (amount == 0) {
                throw Error.reject("Amount must be greater than 0");
            };

            if (ticker != "TRAX") {
                throw Error.reject("Only TRAX token is supported");
            };

            // Rate limiting
            if (not checkRateLimit(caller)) {
                throw Error.reject("Rate limit exceeded. Please wait before sending another tip");
            };

            // Validate participants
            switch(validateParticipants(participants)) {
                case (#err(e)) { throw Error.reject(e) };
                case (#ok()) {};
            };

            // Check allowance
            let spenderAccount = { owner = Principal.fromActor(this); subaccount = null };
            let fromAccount = { owner = caller; subaccount = null };
            
            let allowance = await TRAXLedger.icrc2_allowance({
                account = fromAccount;
                spender = spenderAccount;
            });

            if (allowance.allowance < Nat64.toNat(amount)) {
                logEvent(
                    caller,
                    #Error,
                    "Insufficient allowance",
                    ?{ amount = ?Nat64.toNat(amount); participants = null; error = ?"Insufficient allowance" }
                );
                return #err("Insufficient allowance");
            };

            // Calculate amounts with safe math
            let transfers = calculateAmounts(amount, participants, ticker);
            switch(transfers) {
                case (#err(e)) { return #err(e) };
                case (#ok(transferArray)) {
                    var results : [Result.Result<Nat, Text>] = [];
                    
                    for ((recipient, amount) in Iter.fromArray(transferArray)) {
                        let transferFromArgs : TransferFromArgs = {
                            spender_subaccount = null;
                            from = fromAccount;
                            to = { owner = recipient; subaccount = null };
                            amount = Nat64.toNat(amount);
                            fee = ?Nat64.toNat(FEE_TRAX);
                            memo = null;
                            created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
                        };

                        let result = await TRAXLedger.icrc2_transfer_from(transferFromArgs);
                        
                        switch(result) {
                            case (#Ok(blockIndex)) {
                                results := Array.append(results, [#ok(blockIndex)]);
                                recordTip(caller, recipient, amount, ticker, Time.now());
                                
                                logEvent(
                                    caller,
                                    #TipSent,
                                    "Tip sent successfully",
                                    ?{
                                        amount = ?Nat64.toNat(amount);
                                        participants = ?[recipient];
                                        error = null;
                                    }
                                );
                            };
                            case (#Err(err)) {
                                logEvent(
                                    caller,
                                    #Error,
                                    "Transfer failed",
                                    ?{
                                        amount = ?Nat64.toNat(amount);
                                        participants = ?[recipient];
                                        error = ?debug_show(err);
                                    }
                                );
                                
                                return #err("Transfer failed: " # debug_show(err));
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
                };
            };
        } catch (e) {
            logEvent(
                caller,
                #Error,
                "Tip failed",
                ?{ amount = null; participants = null; error = ?Error.message(e) }
            );
            #err("Tip failed: " # Error.message(e));
        } finally {
            locked := false;
        };
    };




public func approveSpending(
    amount: Nat64,
    ticker: Ticker,
    expires_in: ?Nat64  // Seconds from now
) : async Result.Result<Nat, Text> {
    assert(not locked);
    locked := true;

    try {
        // Input validation
        if (amount == 0) {
            throw Error.reject("Amount must be greater than 0");
        };

        if (ticker != "TRAX") {
            throw Error.reject("Only TRAX token is supported");
        };

        let now = Nat64.fromNat(Int.abs(Time.now()));
        
        // Calculate expiration time
        let expires_at = Option.map<Nat64, Nat64>(
            expires_in,
            func(duration) = now + (duration * 1_000_000_000)
        );
        
        // Construct approval arguments
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

        // Call ledger for approval
        let result = await TRAXLedger.icrc2_approve(approveArgs);
        
        switch(result) {
            case (#Ok(blockIndex)) {
                // Log successful approval
                logEvent(
                    Principal.fromActor(this),
                    #AllowanceUpdated,
                    "Spending approved",
                    ?{
                        amount = ?Nat64.toNat(amount);
                        participants = null;
                        error = null
                    }
                );
                
                // Update allowance cache if successful
                switch(expires_at) {
                    case (?exp) {
                        let cacheEntry = {
                            amount = Nat64.toNat(amount);
                            expires_at = exp;
                            timestamp = now;
                        };
                        
                        switch(Map.get(allowanceCache, phash, Principal.fromActor(this))) {
                            case (?data) {
                                ignore Map.put(data, thash, ticker, cacheEntry);
                            };
                            case null {
                                let newData = Map.new<Ticker, AllowanceCache>(thash);
                                ignore Map.put(newData, thash, ticker, cacheEntry);
                                ignore Map.put(allowanceCache, phash, Principal.fromActor(this), newData);
                            };
                        };
                    };
                    case null {};
                };
                
                #ok(blockIndex)
            };
            case (#Err(e)) {
                // Log failed approval
                logEvent(
                    Principal.fromActor(this),
                    #Error,
                    "Approval failed",
                    ?{
                        amount = ?Nat64.toNat(amount);
                        participants = null;
                        error = ?e
                    }
                );
                #err(e)
            };
        };
    } catch (e) {
        // Log any unexpected errors
        logEvent(
            Principal.fromActor(this),
            #Error,
            "Approval failed unexpectedly",
            ?{
                amount = ?Nat64.toNat(amount);
                participants = null;
                error = ?Error.message(e)
            }
        );
        #err("Approval failed: " # Error.message(e))
    } finally {
        locked := false;
    };
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

    public query func getAllEvents() : async [Event] {
        B.toArray(eventLog);
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
            // case "ICP" FEE;
            // case "ckBTC" FEE_CKBTC;
            case "TRAX" FEE_TRAX;
            case _ Debug.trap("Invalid ticker");
        };
    };

    private func calculateAmounts(totalAmount: Nat64, participants: TippingParticipants, ticker: Ticker) : Result.Result<[(Principal, Nat64)], Text> {
        let fee = getFee(ticker);
        if (totalAmount <= fee) {
            return #err("Total amount must be greater than fee");
        };

        let netAmount = totalAmount - fee;
        let platformFee = Float.toInt(Float.fromInt(Nat64.toNat(netAmount)) * PLATFORM_FEE);
        if (platformFee < 0) {
            return #err("Platform fee calculation error");
        };

        let remainingAmount = netAmount - Nat64.fromNat(Int.abs(platformFee));
        if (remainingAmount <= 0) {
            return #err("Insufficient remaining amount after fees");
        };

        let amounts = Buffer.Buffer<(Principal, Nat64)>(participants.size() + 1);

        // Add platform fee
        amounts.add((Principal.fromText(Env.traxAccount), Nat64.fromNat(Int.abs(platformFee))));

        // Calculate participant amounts
        var totalDistributed : Nat64 = 0;

        for (participant in participants.vals()) {
            let amount = Float.toInt(Float.fromInt(Nat64.toNat(remainingAmount)) * participant.participantPercentage);
            if (amount < 0) {
                return #err("Invalid participant amount calculation");
            };
            let amountNat64 = Nat64.fromNat(Int.abs(amount));
            totalDistributed := totalDistributed + amountNat64;
            amounts.add((participant.participantID, amountNat64));
        };

        if (totalDistributed > remainingAmount) {
            return #err("Distribution amount exceeds remaining amount");
        };

        #ok(Buffer.toArray(amounts))
    };










    // Admin Functions
    public shared({caller}) func updatePlatformFee(newFee: Float) : async () {
        assert(U.isAdmin(caller));
        assert(newFee >= 0 and newFee <= 1);
        PLATFORM_FEE := newFee;
    };


    // System Functions
    private func getCurrentHeapMemory(): Nat {
      Prim.rts_heap_size();
    };


    private func getCurrentMemory(): Nat {
      Prim.rts_memory_size();
    };


    private func getCurrentCycles(): Nat {
      Cycles.balance();
    };

    private func getVersion() : Nat {
		return VERSION;
	};  



    public func ckbtcBalanceOfCanister() : async Nat{
      await CKBTCLedger.icrc1_balance_of(
        {owner = Principal.fromActor(this); subaccount = null }
      );
    };

    public func traxBalanceOfCanister() : async Nat{
      await TRAXLedger.icrc1_balance_of(
        {owner = Principal.fromActor(this); subaccount = null }
      );
    };




  public shared({caller}) func getStatus(request: ?StatusRequest): async ?StatusResponse {
    // assert(U.isAdmin(caller));
      switch(request) {
          case (null) {
              return null;
          };
          case (?_request) {
              var cycles: ?Nat = null;
              switch(_request.cycles){
                case(?_checkCycles){
                  cycles := ?getCurrentCycles();
                };case null {};
              };
              
              var memory_size: ?Nat = null;
              switch(_request.memory_size){
                case(?_checkStableMemory){
                  memory_size := ?getCurrentMemory();
                };case null {};
              };

              var heap_memory_size: ?Nat = null;
              switch(_request.heap_memory_size){
                case(?_checkHeapMemory){
                  heap_memory_size := ?getCurrentHeapMemory();
                };case null {};
              };
              var version: ?Nat = null;
              switch(_request.version){
                case(?_checkVersion){
                  version := ?getVersion();
                };case null {};
              };
              
              var icp_balance: ?Tokens = null;
              

              var ckbtc_balance: ?Nat = null;
              switch(_request.ckbtc_balance){
                case(?_checkCkbtcBal){
                  switch(await ckbtcBalanceOfCanister()){
                    case(_bal){
                      ckbtc_balance := ?_bal;
                    };
                  };
                };case null {};
              };

              var trax_balance: ?Nat = null;
              switch(_request.trax_balance){
                case(?_checkTraxBal){
                  switch(await traxBalanceOfCanister()){
                    case(_bal){
                      trax_balance := ?_bal;
                    };
                  };
                };case null {};
              };

              return ?{
                  cycles = cycles;
                  memory_size = memory_size;
                  heap_memory_size = heap_memory_size;
                  version = version;
                  icp_balance = icp_balance;
                  ckbtc_balance = ckbtc_balance;
                  trax_balance = trax_balance;
              };
          };
      };
  };

}