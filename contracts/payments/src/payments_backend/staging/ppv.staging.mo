import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Float "mo:base/Float";
import T "../types";
import Account "../utils/account";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Error "mo:base/Error";
import Debug "mo:base/Debug";
import Result "mo:base/Result";
import U "../utils/utils";
import Hex "../utils/Hex";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Map "mo:stable-hash-map/Map";
import Option "mo:base/Option";
import Array "mo:base/Array";
import Env "../utils/env";
import Prim "mo:⛔";
import Cycles "mo:base/ExperimentalCycles";
import B   "mo:stable-buffer/StableBuffer";

actor class PPV() = this {

    private let { thash; phash } = Map;

    // Types
    
    type FanID = T.FanID;
    type Tokens = T.Tokens;
    type Content = T.Content;
    type ArtistID = T.ArtistID;
    type Ticker = T.Ticker;
    type ContentID = T.ContentID;
    type Timestamp = T.Timestamp;
    type Percentage = T.Percentage;
    type ContentType = T.ContentType;
    type StatusRequest = T.StatusRequest;
    type StatusResponse = T.StatusResponse;
    


    // ICRC1/2 Types
    type Account = { owner : Principal; subaccount : ?Blob };
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

    // Constants
    let FEE_TRAX : Nat64 = 100_000;
    var PLATFORM_FEE: Float = 0.10;
    let VERSION: Nat = 310;
    private stable var locked : Bool = false; // Reentrancy guard

    // Rate limiting
    private stable var lastPurchaseTime = Map.new<Principal, Int>(phash);
    private let MIN_TIME_BETWEEN_PURCHASES = 1_000_000_000; // 1 second in nanoseconds

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

    // Stable storage
    
    stable let contentMap = Map.new<ContentID, Content>(thash);
    private type FanToTime = Map.Map<FanID, (Timestamp, Nat, Ticker)>;
    private type ArtistToFan = Map.Map<ArtistID, FanToTime>;
    stable let contentPaymentMap = Map.new<ContentID, ArtistToFan>(thash);

    // Event logging
    private type Event = {
        timestamp: Int;
        eventType: Text;
        caller: Principal;
        details: Text;
    };
    private var eventLog = B.init<Event>();

    // Helper function to log events
    private func logEvent(eventType: Text, caller: Principal, details: Text) {
        let event = {
            timestamp = Time.now();
            eventType;
            caller;
            details;
        };
        if (B.size(eventLog) >= 1000) {
            ignore B.remove(eventLog, 0); // Remove oldest event
        };
        B.add(eventLog, event);
    };

    // Rate limiting check
    private func checkRateLimit(caller: Principal) : Bool {
        let now = Time.now();
        switch (Map.get(lastPurchaseTime, phash, caller)) {
            case (?lastTime) {
                if (now - lastTime < MIN_TIME_BETWEEN_PURCHASES) {
                    return false;
                };
            };
            case null {};
        };
        ignore Map.put(lastPurchaseTime, phash, caller, now);
        true
    };

    // Content Management
    public shared({caller}) func addPPVContent(id: ContentID, content: Content): async Result.Result<(), Text> {
        assert(not locked);
        locked := true;

        try {
            // Authentication
            if (not (caller == content.publisher or U.isAdmin(caller))) {
                return #err("Unauthorized: Only content publisher or admin can add content");
            };

            // Validation
            if (content.price <= 0) {
                return #err("Invalid price: Must be greater than 0");
            };

            var totalPercentage: Percentage = content.publisherPercentage;
            for (participant in content.participants.vals()) {
                totalPercentage += participant.participantPercentage;
            };

            if (totalPercentage != 1) {
                return #err("Invalid percentages: Must sum to 1");
            };

            // Check for existing content
            switch(Map.get(contentMap, thash, id)) {
                case(?_) {
                    return #err("Content ID already exists");
                };
                case null {
                    ignore Map.put(contentMap, thash, id, content);
                    logEvent("ContentAdded", caller, "Content ID: " # id);
                    #ok(());
                };
            };
        } catch (e) {
            #err("Error adding content: " # Error.message(e));
        } finally {
            locked := false;
        };
    };

    public shared({caller}) func updatePPVContent(id: ContentID, content: Content) : async Result.Result<(), Text> {
        assert(not locked);
        locked := true;

        try {
            // Validate content exists
            switch(Map.get(contentMap, thash, id)) {
                case(?exists) {
                    // Authentication check
                    if (not (caller == exists.publisher or U.isAdmin(caller))) {
                        return #err("Unauthorized: Only content publisher or admin can update content");
                    };

                    // Validate price
                    if (content.price <= 0) {
                        return #err("Invalid price: Must be greater than 0");
                    };

                    // Validate percentages
                    var totalPercentage: Percentage = content.publisherPercentage;
                    for(each in Iter.fromArray(content.participants)) {
                        totalPercentage += each.participantPercentage;
                    };

                    if (totalPercentage != 1) {
                        return #err("Invalid percentages: Must sum to 1");
                    };

                    // Update content
                    ignore Map.replace(contentMap, thash, id, content);
                    
                    // Log event
                    logEvent(
                        "ContentUpdated", 
                        caller, 
                        "Content ID: " # id
                    );

                    #ok(())
                };
                case null {
                    #err("Content ID does not match any existing record")
                };
            };
        } catch (e) {
            #err("Error updating content: " # Error.message(e))
        } finally {
            locked := false;
        };
    };


    public shared({caller}) func removeContent(id: ContentID): async Result.Result<(), Text> {    
        assert(not locked);
        locked := true;

        try {
            switch(Map.get(contentMap, thash, id)) {
                case(?exists) {
                    // Authentication check
                    if (not (caller == exists.publisher or U.isAdmin(caller))) {
                        return #err("Unauthorized: Only content publisher or admin can remove content");
                    };

                    Map.delete(contentMap, thash, id);   
                    
                    // Also remove from payment map if exists
                    Map.delete(contentPaymentMap, thash, id);

                    logEvent(
                        "ContentRemoved", 
                        caller, 
                        "Content ID: " # id
                    );

                    #ok(())
                };
                case null {
                    #err("Content ID does not match any existing record")
                };
            };
        } catch (e) {
            #err("Error removing content: " # Error.message(e))
        } finally {
            locked := false;
        };
    };
public shared({caller}) func purchaseContent(id: ContentID, ticker: Ticker, price: Nat) : async Result.Result<Nat, Text> {
    assert(not locked);
    locked := true;

     Debug.print("caller: " # debug_show caller);

    try {
        // Rate limiting check
        if (not checkRateLimit(caller)) {
            return #err("Rate limit exceeded. Please wait before making another purchase.");
        };

        // Verify content exists
        let content = switch (Map.get(contentMap, thash, id)) {
            case null { return #err("Content not found"); };
            case (?c) { c };
        };

        // Check if already purchased
        let hasPurchased = await fanHasPaid(id, caller);
        if (hasPurchased) {
            return #err("Content already purchased");
        };

        // Calculate total price including fees
        // let basePrice = Int.abs(Float.toInt(content.price * 100_000_000));

        Debug.print("price: " # debug_show price);
        
        // Calculate total required allowance (base price + fees for each recipient)
        let recipientCount = 2 + content.participants.size(); // platform + publisher + participants
        let totalFees = Nat64.toNat(FEE_TRAX) * recipientCount;
        let requiredAllowance = price + totalFees;

        // Get allowance
        let fromAccount = { owner = caller; subaccount = null };
        let spenderAccount = { owner = Principal.fromActor(this); subaccount = null };
        
        let allowance = await TRAXLedger.icrc2_allowance({
            account = fromAccount;
            spender = spenderAccount;
        });

        Debug.print("requiredAllowance: " # debug_show requiredAllowance);

        

        if (allowance.allowance < requiredAllowance) {
            return #err("Insufficient allowance. Required: " # Nat.toText(requiredAllowance) # ", Got: " # Nat.toText(allowance.allowance));
        };

        Debug.print("After initial checks");

        // Calculate distributions with the base price
        let distributions = calculateDistributions(price, content);

        Debug.print("distributions: " # debug_show distributions);

        // Process transfers
        var results : [Result.Result<Nat, Text>] = [];
        var totalTransferred : Nat = 0;
        
        for ((recipient, amount) in Iter.fromArray(distributions)) {
            let transferAmount = Nat64.toNat(amount);
            totalTransferred += transferAmount;
            Debug.print("totalTransferred: " # debug_show totalTransferred);
            Debug.print("transferAmount: " # debug_show transferAmount);

            // Verify we don't exceed base price
            if (totalTransferred > price) {
                return #err("Distribution calculation error: total exceeds base price");
            };

            let transferFromArgs : TransferFromArgs = {
                spender_subaccount = null;
                from = fromAccount;
                to = { owner = recipient; subaccount = null };
                amount = transferAmount;
                fee = ?Nat64.toNat(FEE_TRAX);
                memo = null;
                created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
            };

            let result = await TRAXLedger.icrc2_transfer_from(transferFromArgs);

            Debug.print("result transfer: " # debug_show distributions);
            
            switch(result) {
                case (#Ok(blockIndex)) {
                    results := Array.append(results, [#ok(blockIndex)]);
                    await recordPurchase(id, caller, recipient, Nat64.fromNat(transferAmount), ticker);
                };
                case (#Err(err)) {
                    return #err("Transfer failed: " # debug_show(err));
                };
            };
        };

        logEvent("ContentPurchased", caller, "Content ID: " # id);
        #ok(results.size());

    } catch (e) {
        #err("Error processing purchase: " # Error.message(e));
    } finally {
        locked := false;
    };
};


private func calculateDistributions(totalAmount: Nat, content: Content) : [(Principal, Nat64)] {
    // First ensure we have enough to cover the fee
    if (totalAmount <= Nat64.toNat(FEE_TRAX)) {
        Debug.trap("Amount must be greater than transfer fee");
    };
    
    // Calculate net amount after transfer fee
    let netAmount = totalAmount - Nat64.toNat(FEE_TRAX);

    Debug.print("after netAmount: " # debug_show netAmount);
    
    // Calculate platform fee
    let platformFeeAmount = Float.toInt(Float.fromInt(netAmount) * PLATFORM_FEE);
    if (platformFeeAmount < 0) {
        Debug.trap("Platform fee calculation error");
    };
    
    let remainingAmount = netAmount - Int.abs(platformFeeAmount);
    if (remainingAmount <= 0) {
        Debug.trap("Insufficient amount after platform fee");
    };

     Debug.print("after remainingAmount: " # debug_show remainingAmount);
    
    let distributions = Buffer.Buffer<(Principal, Nat64)>(content.participants.size() + 2);
    
    // Add platform fee receiver
    distributions.add((Principal.fromText(Env.traxAccount), Nat64.fromNat(Int.abs(platformFeeAmount))));
    
    // Calculate and add publisher amount
    let publisherAmount = Float.toInt(Float.fromInt(remainingAmount) * content.publisherPercentage);
    if (publisherAmount < 0) {
        Debug.trap("Publisher amount calculation error");
    };
    distributions.add((content.publisher, Nat64.fromNat(Int.abs(publisherAmount))));
    
    // Track total distributed to ensure we don't exceed net amount
    var totalDistributed = Int.abs(platformFeeAmount) + Int.abs(publisherAmount);
    
    // Calculate and add participant amounts
    for (participant in content.participants.vals()) {
        let participantAmount = Float.toInt(Float.fromInt(remainingAmount) * participant.participantPercentage);
        if (participantAmount < 0) {
            Debug.trap("Participant amount calculation error");
        };
        
        totalDistributed += Int.abs(participantAmount);
        if (totalDistributed > netAmount) {
            Debug.trap("Distribution total exceeds net amount");
        };
        
        distributions.add((participant.participantID, Nat64.fromNat(Int.abs(participantAmount))));
    };
    
    Buffer.toArray(distributions)
};

    private func recordPurchase(contentId: ContentID, fan: Principal, recipient: Principal, amount: Nat64, ticker: Ticker) : async () {
        let now = Time.now();
        switch(Map.get(contentPaymentMap, thash, contentId)) {
            case(?innerMap) {
                switch(Map.get(innerMap, phash, recipient)) {
                    case(?fanMap) {
                        ignore Map.put(fanMap, phash, fan, (now, Nat64.toNat(amount), ticker));
                    };
                    case null {
                        var newFanMap = Map.new<FanID, (Timestamp, Nat, Ticker)>(phash);
                        ignore Map.put(newFanMap, phash, fan, (now, Nat64.toNat(amount), ticker));
                        ignore Map.put(innerMap, phash, recipient, newFanMap);
                    };
                };
            };
            case null {
                var newFanMap = Map.new<FanID, (Timestamp, Nat, Ticker)>(phash);
                var newInnerMap = Map.new<ArtistID, FanToTime>(phash);
                ignore Map.put(newFanMap, phash, fan, (now, Nat64.toNat(amount), ticker));
                ignore Map.put(newInnerMap, phash, recipient, newFanMap);
                ignore Map.put(contentPaymentMap, thash, contentId, newInnerMap);
            };
        };
    };

    // Approval functions
    public shared({caller}) func approveSpending(amount: Nat) : async Result.Result<Nat, Text> {
        try {
            let approveArgs : ApproveArgs = {
                amount = amount;
                spender = { owner = Principal.fromActor(this); subaccount = null };
                created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
                expires_at = null;
                expected_allowance = null;
                memo = null;
                fee = null;
                from_subaccount = null;
            };

            let result = await TRAXLedger.icrc2_approve(approveArgs);
            switch(result) {
                case (#Ok(n)) { #ok(n) };
                case (#Err(e)) { #err(e) };
            };
        } catch (e) {
            #err("Approval failed: " # Error.message(e));
        };
    };




    // Query functions
    public query func fanHasPaid(id: ContentID, fan: Principal) : async Bool {
        switch(Map.get(contentMap, thash, id)) {
            case(?content) {
                switch(Map.get(contentPaymentMap, thash, id)) {
                    case(?innerMap) {
                        switch(Map.get(innerMap, phash, content.publisher)) {
                            case(?fanMap) {
                                switch(Map.get(fanMap, phash, fan)) {
                                    case(?data) { data.0 > 0 };
                                    case null { false };
                                };
                            };
                            case null { false };
                        };
                    };
                    case null { false };
                };
            };
            case null { false };
        };
    };


    public func getAllContentPayments(start: Nat, limit: Nat) : async {
        data: [(ContentID, ArtistID, FanID, Timestamp, Nat, ContentType)];
        total: Nat;
    } {
        var data = Buffer.Buffer<(ContentID, ArtistID, FanID, Timestamp, Nat, ContentType)>(2);
        var count = 0;

        for((contentId, innerMap) in Map.entries(contentPaymentMap)) {
            switch(Map.get(contentMap, thash, contentId)) {
                case(?content) {
                    let contentType = content.contentType;

                    for((artistId, fanMap) in Map.entries(innerMap)) {
                        for((fanId, payment) in Map.entries(fanMap)) {
                            if (count >= start and data.size() < limit) {
                                data.add(contentId, artistId, fanId, payment.0, payment.1, contentType);
                            };
                            count += 1;
                        };
                    };
                };
                case(null) {
                    // Skip if content doesn't exist anymore
                };
            };
        };

        {
            data = Buffer.toArray(data);
            total = count;
        }
    };


    public query func getContent(id: ContentID) : async ?Content {
        Map.get(contentMap, thash, id);
    };

    public query func getAllEvents() : async [Event] {
        B.toArray(eventLog);
    };

    // Admin functions
    public shared({caller}) func updatePlatformFee(newFee: Float) : async Result.Result<(), Text> {
        if (not U.isAdmin(caller)) {
            return #err("Unauthorized: Only admin can update platform fee");
        };
        
        if (newFee < 0 or newFee > 1) {
            return #err("Invalid fee: Must be between 0 and 1");
        };

        PLATFORM_FEE := newFee;
        logEvent("PlatformFeeUpdated", caller, "New fee: " # Float.toText(newFee));
        #ok(());
    };

    // System functions
    
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
};