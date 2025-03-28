import Cycles             "mo:base/ExperimentalCycles";
import Principal          "mo:base/Principal";
import Error              "mo:base/Error";
import Nat                "mo:base/Nat";
import Map                "mo:stable-hash-map/Map";
import Debug              "mo:base/Debug";
import Text               "mo:base/Text";
import Hash               "mo:base/Hash";
import Nat32              "mo:base/Nat32";
import Nat64              "mo:base/Nat64";
import Iter               "mo:base/Iter";
import Float              "mo:base/Float";
import Time               "mo:base/Time";
import Int                "mo:base/Int";
import Result             "mo:base/Result";
import Blob               "mo:base/Blob";
import Array              "mo:base/Array";
import Buffer             "mo:base/Buffer";
import Trie               "mo:base/Trie";
import TrieMap            "mo:base/TrieMap";
import Utils              "../utils/utils";
import T                  "../types";
import ICRC1T             "../ckbtcTypes";
import Account            "../utils/account";

actor AirdropDisbursment {
    // - function sendAirdropReward that recieves recipient principal and amount of $TRAX
    // - the function has a security check assuring that the caller is the manager principal 
    // - make a check that the remaining smart contract balance is greater than the amount being sent 
    // - Once a transaction takes place check in the failedTx hashmap if it exists and delte if so. 
    // - Once the transaction takes place add entry to hashmap to store completed transactions. TX number, Recipient pricinpal, amount, timestamp. 
    // - If a transaction fails add an entry to the failedTransactions hashmap. Recipient pricinpal, amount, timestamp. 
    //   Make a check to see if this principal has already been added.
    // - Create functions to add, remove and fetch entries in hashmaps 
    // - global variables: Tx number, 
    type TransferArg               = ICRC1T.TransferArg;
    type GetBlocksRequest          = ICRC1T.GetBlocksRequest;
    type Account                   = T.Account;
    type Result                    = ICRC1T.Result;
    type GetTransactionsResponse   = ICRC1T.GetTransactionsResponse;
    type Tokens                    = T.Tokens;
    type Block                     = Nat64;

    let { ihash; n64hash; thash; phash; calcHash } = Map;

    public type TxNo        = Nat64;
    public type Timestamp   = Int;
    public type Round       = Text;
    public type Recipient   = Principal;
    public type Amount      = Nat64;
    public type Reason      = Text;
    public type Status      = Text;

    var VERSION: Nat          = 1;
    stable var txNumber: TxNo = 0;

    private type CompletedMap = Map.Map<TxNo, (Recipient, Amount, Timestamp, Block)>;
    private type FailedMap = Map.Map<TxNo, (Recipient, Amount, Timestamp, Reason )>;
    private type AirdropMap = Map.Map<Recipient, (Amount, Status)>;

    stable let completedTxs = Map.new<Round, CompletedMap>(thash);
    stable let failedTxs = Map.new<Round, FailedMap>(thash);

    stable let airdropRounds = Map.new<Round, AirdropMap>(thash);



    let TRAXLedger = actor "emww2-4yaaa-aaaaq-aacbq-cai" : actor {
    // let TRAXLedger = actor "bkyz2-fmaaa-aaaaa-qaaaq-cai" : actor {
         icrc1_transfer : shared TransferArg -> async Result;
         icrc1_balance_of : shared query Account -> async Nat;
         get_transactions : shared query GetBlocksRequest -> async GetTransactionsResponse;
    };




// region - TRANSFER

    public shared({caller}) func initiateAirdropRound(round: Round, recipient: Recipient, amount: Amount) : async (){
      // Only manager identity can call this function 
      if (not Utils.isAdmin(caller)) {
        throw Error.reject("@initiateAirdropRound: Unauthorized access. Caller is not the manager principal. Caller: " # Principal.toText(caller));
      };

      // Upload each entry in airdrop round to airdropRounds map and set status to UNCLAIMED
      switch(Map.get(airdropRounds, thash, round)){
        case(?roundInnerMap){
          var add = Map.put(roundInnerMap, phash, recipient, (amount, "UNCLAIMED"));
        };case null {
          var y : AirdropMap = Map.new<Recipient, (Amount, Status)>(phash);
          var a = Map.put(y, phash, recipient, (amount, "UNCLAIMED"));
          var b = Map.put(airdropRounds, thash, round, y);
        };
      };
    };


    public shared({caller}) func claimAirdrop(round: Round, recipient: Recipient) : async (){
       // Then check if the caller is the recipient 
      if (recipient != caller) {
        throw Error.reject("@claimAirdrop: Unauthorized access. Caller is not the recipient principal. Caller: " # Principal.toText(caller));
      };
      // Check first if the recipient is in the aidrop round
      switch(Map.get(airdropRounds, thash, round)){
        case(?roundInnerMap){
          switch(Map.get(roundInnerMap, phash, recipient)){
            case(?exists){
              let amount: Amount = exists.0;
              let status: Status = exists.1;
              
              // Then check that the status is UNCLAIMED
              if(status == "UNCLAIMED"){
                // Then send the airdrop tokens and mark the status as CLAIMED
                switch(await transfer(recipient, amount)){
                  case(#ok(res)){
                    await addToCompletedTxs(round, txNumber, recipient, amount, res);

                    let remove = Map.delete(roundInnerMap, phash, recipient);
                    let add = Map.put(roundInnerMap, phash, recipient, (amount, "CLAIMED"));
                    Debug.print("@claimAirdrop: Paid airdrop recipient: " # debug_show recipient # "\namount: " # debug_show amount #  "\nin block " # debug_show res);

                  }; case(#err(msg)){
                    await addToFailedTxs(round, txNumber, recipient, amount, msg);
                    throw Error.reject("@sendAirdrop: Unexpected error: " # debug_show msg);
                  };
                };
              }else{
                throw Error.reject("@claimAirdrop: Recipient is already registered for this round." # Principal.toText(caller));
              }
              
            };case null {
              throw Error.reject("@claimAirdrop: Recipient does not exist in airdrop round." # Principal.toText(caller));
            };
          };
        }; case null{
          throw Error.reject("@claimAirdrop: Round does not exist." # Principal.toText(caller));
        };
      };
      
      // Then add transaction to completedTxs map 
    };


    public shared({caller}) func sendAirdrop(round: Round, recipient: Recipient, amount: Amount) : async (){
      let canBal = await traxBalance();
      let timestamp = Time.now();

      if (not Utils.isAdmin(caller)) {
        throw Error.reject("@sendAirdrop: Unauthorized access. Caller is not the manager principal. Caller: " # Principal.toText(caller));
      };

      if(canBal < Nat64.toNat(amount)){
        await addToFailedTxs(round, txNumber, recipient, amount, "Insufficient canister balance");
        throw Error.reject("@sendAirdrop: Insufficient canister balance. Balance: " # debug_show canBal);
      };
      
      txNumber += 1;

      switch(await transfer(recipient, amount)){
        case(#ok(res)){
          await addToCompletedTxs(round, txNumber, recipient, amount, res);
          Debug.print("@sendAirdrop: Paid airdrop recipient: " # debug_show recipient # "\namount: " # debug_show amount #  "\nin block " # debug_show res);

        }; case(#err(msg)){
          await addToFailedTxs(round, txNumber, recipient, amount, msg);
          throw Error.reject("@sendAirdrop: Unexpected error: " # debug_show msg);
        };
      };
    };


    private func transfer(to: Recipient, amount: Nat64): async Result.Result<Nat64, Text>{
      let now = Time.now();
      try {
          let transferResult = await TRAXLedger.icrc1_transfer(
            {
              amount = Nat64.toNat(amount);
              from_subaccount = null;
              created_at_time = null;
              fee = ?100_000;
              memo = null;
              to = {
                owner = to;
                subaccount = null;
              };
            }
          );    
          switch (transferResult) {
            case (#Ok(transferResult)) {
              Debug.print("@transfer: Paid recipient $TRAX: " # debug_show to # " in block " # debug_show transferResult);
              return #ok(Nat64.fromNat(transferResult));
            };
            case (#Err(transferError)) {
              return #err("@transfer: Couldn't transfer $TRAX funds to default account:\n" # debug_show (transferError));
            };
          };
      } catch (error : Error) {
        return #err("@transfer: Reject message: " # Error.message(error));
      };
    };
// endregion




// region - UPDATING STATE
    private func addToCompletedTxs(round: Round, tx: TxNo, recipient: Recipient, amount: Nat64, block: Nat64) : async (){
      let now = Time.now();
      switch(Map.get(completedTxs, thash, round)){
        case(?roundInnerMap){
          var add = Map.put(roundInnerMap, n64hash, tx, (recipient, amount, now, block));
        };case null {
          var y : CompletedMap = Map.new<TxNo, (Recipient, Amount, Timestamp, Block)>(n64hash);
          var a = Map.put(y, n64hash, tx, (recipient, amount, now, block));
          var b = Map.put(completedTxs, thash, round, y);
        };
      };
    };


    private func addToFailedTxs(round: Round, tx: TxNo, recipient: Recipient, amount: Nat64, reason: Reason) : async (){
      let now = Time.now();
      switch(Map.get(failedTxs, thash, round)){
        case(?roundInnerMap){
          var add = Map.put(roundInnerMap, n64hash, tx, (recipient, amount, now, reason));
        };case null {
          var y : FailedMap = Map.new<TxNo, (Recipient, Amount, Timestamp, Reason)>(n64hash);
          var a = Map.put(y, n64hash, tx, (recipient, amount, now, reason));
          var b = Map.put(failedTxs, thash, round, y);
        };
      };
    };


    public shared({caller}) func removeFromFailedTxs(round: Round, tx: TxNo) : async (){
        switch(Map.get(failedTxs, thash, round)){
          case(?roundInnerMap){
            Map.delete(roundInnerMap, n64hash, tx);
          }; case null {
            throw Error.reject("@removeFromFailedTxs: This round does not exists in failedTxs hashmap");  
          }
        }
    };
// endregion




// region - FETCH STATE
    public query({caller}) func getFailedTxs() : async [(Round, TxNo, Recipient, Amount, Timestamp, Reason)]{
      var data = Buffer.Buffer<(Round, TxNo, Recipient, Amount, Timestamp, Reason)>(2);

      for((key, val) in Map.entries(failedTxs)){
        var round: Round = key;
        for((k, v) in Map.entries(val)){
          var txNo: TxNo = k;
          var recipient: Recipient = v.0;
          var amount: Amount = v.1;
          var timestamp: Timestamp = v.2;
          var reason: Reason = v.3;
          data.add(round, txNo, recipient, amount, timestamp, reason);
        };
      };

      return Buffer.toArray(data);
    };


    public query({caller}) func getCompletedTxs() : async [(Round, TxNo, Recipient, Amount, Timestamp, Block)]{
      var data = Buffer.Buffer<(Round, TxNo, Recipient, Amount, Timestamp, Block)>(2);

      for((key, val) in Map.entries(completedTxs)){
        var round: Round = key;
        for((k, v) in Map.entries(val)){
          var txNo: TxNo = k;
          var recipient: Recipient = v.0;
          var amount: Amount = v.1;
          var timestamp: Timestamp = v.2;
          var block: Block = v.3;
          data.add(round, txNo, recipient, amount, timestamp, block);
        };
      };

      return Buffer.toArray(data);
    };
// endregion




// region - UTILS
  public func traxBalance() : async Nat{
    let balance = await TRAXLedger.icrc1_balance_of(
      {owner = Principal.fromActor(AirdropDisbursment); subaccount = null }
    );
  };


  private func myAccountId() : Account.AccountIdentifier {
    Account.accountIdentifier(Principal.fromActor(AirdropDisbursment), Account.defaultSubaccount());
  };


  public query func cyclesBalance() : async Nat {
      return Cycles.balance();
  };
// endregion
    

}