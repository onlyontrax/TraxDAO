
import Nat        "mo:base/Nat";
import Debug      "mo:base/Debug";
import Text       "mo:base/Text";
import Time       "mo:base/Time";
import Error      "mo:base/Error";
import Principal  "mo:base/Principal";
import Utils      "../utils/utils";
import Env        "../env";
import T          "../types";
import Prim       "mo:⛔";
import Cycles     "mo:base/ExperimentalCycles";

actor class Identity(innitialHash : Text) {

  var VERSION: Nat      = 1;
  type StatusRequest    = T.StatusRequest;
  type StatusResponse   = T.StatusResponse;
  private var tokenHash = innitialHash;

  public shared({caller}) func changeHash(newHash: Text) : async (Text){
    if (not Utils.isManager(caller)) {
      throw Error.reject("@changeHash: Unauthorized access. Caller is not the manager. Caller: " # Principal.toText(caller));
    };
    tokenHash := newHash;

    return tokenHash;
  };

  public shared({caller}) func getHashedTokenManager(baseHash: Text, user: Text) : async Nat32 {
    if (not Utils.isManager(caller)) {
      throw Error.reject("@changeHash: Unauthorized access. Caller is not the manager. Caller: " # Principal.toText(caller));
    };
    let myHashedToken = baseHash # tokenHash # user # baseHash;

    return Text.hash(myHashedToken);
  };

  public query ({caller}) func whoami() : async Principal {
    Debug.print("caller principal: " # debug_show Principal.toText(caller));
      return caller;
  };

  public query ({caller}) func getHashedToken(baseHash: Text) : async (Nat32, Text) {
    Debug.print("caller principal: " # debug_show Principal.toText(caller));
    let myHashedToken = baseHash # tokenHash # Principal.toText(caller) # baseHash;

    return (Text.hash(myHashedToken), Principal.toText(caller));
  };

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

  public query({caller}) func getStatus(request: ?StatusRequest): async ?StatusResponse {
    switch(request) {
      case (?_request) {
          var cycles: ?Nat = null;
          if (_request.cycles) {
              cycles := ?getCurrentCycles();
          };
          var memory_size: ?Nat = null;
          if (_request.memory_size) {
              memory_size := ?getCurrentMemory();
          };
          var heap_memory_size: ?Nat = null;
          if (_request.heap_memory_size) {
              heap_memory_size := ?getCurrentHeapMemory();
          };
          var version: ?Nat = null;
          if (_request.version) {
              version := ?getVersion();
          };
          return ?{
              cycles = cycles;
              memory_size = memory_size;
              heap_memory_size = heap_memory_size;
              version = version;
          };
      };
      case null return null;
    };
  };

};
