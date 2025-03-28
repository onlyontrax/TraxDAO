import Principal "mo:base/Principal";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Error "mo:base/Error";
import Int "mo:base/Int";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import ICRC2 "mo:icrc2/ICRC2";

actor class SubscriptionManager() {
    // Types
    type Subscription = {
        provider: Principal;
        subscriber: Principal;
        monthlyPrice: Nat;
        yearlyPrice: Nat;
        isActive: Bool;
        lastPayment: Int;
        nextPayment: Int;
        interval: Interval;
    };

    type Interval = {
        #Monthly;
        #Yearly;
    };

    type SubscriptionDetails = {
        monthlyPrice: Nat;
        yearlyPrice: Nat;
    };

    // State variables
    private let subscriptions = HashMap.HashMap<Principal, Subscription>(10, Principal.equal, Principal.hash);
    private let providerPlans = HashMap.HashMap<Principal, SubscriptionDetails>(10, Principal.equal, Principal.hash);
    
    // Token canister interface (replace with actual token canister ID)
    let tokenCanister : Principal = Principal.fromText("aaaaa-aa");
    let token = actor (Principal.toText(tokenCanister)) : actor {
        icrc2_transfer_from : shared ICRC2.TransferArg -> async Result.Result<Nat, Text>;
    };

    // Constants
    let MONTH_IN_NANOSECONDS : Int = 2_592_000_000_000_000; // 30 days
    let YEAR_IN_NANOSECONDS : Int = 31_536_000_000_000_000; // 365 days

    // Provider functions
    public shared({ caller }) func createSubscriptionPlan(monthlyPrice: Nat, yearlyPrice: Nat) : async Result.Result<Text, Text> {
        if (Principal.isAnonymous(caller)) {
            return #err("Anonymous principals cannot create subscription plans");
        };

        let details : SubscriptionDetails = {
            monthlyPrice = monthlyPrice;
            yearlyPrice = yearlyPrice;
        };

        providerPlans.put(caller, details);
        #ok("Subscription plan created successfully")
    };

    public shared({ caller }) func updateSubscriptionPlan(monthlyPrice: Nat, yearlyPrice: Nat) : async Result.Result<Text, Text> {
        switch (providerPlans.get(caller)) {
            case null { #err("No subscription plan found for this provider") };
            case (?_) {
                let details : SubscriptionDetails = {
                    monthlyPrice = monthlyPrice;
                    yearlyPrice = yearlyPrice;
                };
                providerPlans.put(caller, details);
                #ok("Subscription plan updated successfully")
            };
        }
    };

    // Subscriber functions
    public shared({ caller }) func subscribe(provider: Principal, interval: Interval) : async Result.Result<Text, Text> {
        if (Principal.isAnonymous(caller)) {
            return #err("Anonymous principals cannot subscribe");
        };

        switch (providerPlans.get(provider)) {
            case null { return #err("Provider not found") };
            case (?plan) {
                let currentTime = Time.now();
                let price = switch (interval) {
                    case (#Monthly) { plan.monthlyPrice };
                    case (#Yearly) { plan.yearlyPrice };
                };

                // Attempt initial payment
                try {
                    let transferResult = await makePayment(caller, provider, price);
                    switch (transferResult) {
                        case (#err(e)) { return #err("Initial payment failed: " # e) };
                        case (#ok(_)) {
                            let nextPaymentTime = switch (interval) {
                                case (#Monthly) { currentTime + MONTH_IN_NANOSECONDS };
                                case (#Yearly) { currentTime + YEAR_IN_NANOSECONDS };
                            };

                            let subscription : Subscription = {
                                provider = provider;
                                subscriber = caller;
                                monthlyPrice = plan.monthlyPrice;
                                yearlyPrice = plan.yearlyPrice;
                                isActive = true;
                                lastPayment = currentTime;
                                nextPayment = nextPaymentTime;
                                interval = interval;
                            };

                            subscriptions.put(caller, subscription);
                            #ok("Subscription started successfully")
                        };
                    }
                } catch (e) {
                    #err("Subscription failed: " # Error.message(e))
                }
            };
        }
    };

    public shared({ caller }) func cancelSubscription() : async Result.Result<Text, Text> {
        switch (subscriptions.get(caller)) {
            case null { #err("No active subscription found") };
            case (?sub) {
                let updatedSub = {
                    provider = sub.provider;
                    subscriber = sub.subscriber;
                    monthlyPrice = sub.monthlyPrice;
                    yearlyPrice = sub.yearlyPrice;
                    isActive = false;
                    lastPayment = sub.lastPayment;
                    nextPayment = sub.nextPayment;
                    interval = sub.interval;
                };
                subscriptions.put(caller, updatedSub);
                #ok("Subscription cancelled successfully")
            };
        }
    };

    // Helper functions
    private func makePayment(from: Principal, to: Principal, amount: Nat) : async Result.Result<Nat, Text> {
        try {
            let transferArgs : ICRC2.TransferArg = {
                from_subaccount = null;
                to = {
                    owner = to;
                    subaccount = null;
                };
                amount = amount;
                fee = null;
                memo = null;
                created_at_time = null;
            };

            await token.icrc2_transfer_from(transferArgs)
        } catch (e) {
            #err("Payment failed: " # Error.message(e))
        }
    };

    // Automatic payment processing (to be called by a timer or external trigger)
    public shared func processRecurringPayments() : async () {
        let currentTime = Time.now();
        
        for ((subscriber, subscription) in subscriptions.entries()) {
            if (subscription.isActive and currentTime >= subscription.nextPayment) {
                let amount = switch (subscription.interval) {
                    case (#Monthly) { subscription.monthlyPrice };
                    case (#Yearly) { subscription.yearlyPrice };
                };

                try {
                    let paymentResult = await makePayment(subscriber, subscription.provider, amount);
                    switch (paymentResult) {
                        case (#ok(_)) {
                            // Update next payment time
                            let nextPaymentTime = switch (subscription.interval) {
                                case (#Monthly) { currentTime + MONTH_IN_NANOSECONDS };
                                case (#Yearly) { currentTime + YEAR_IN_NANOSECONDS };
                            };

                            let updatedSub = {
                                provider = subscription.provider;
                                subscriber = subscription.subscriber;
                                monthlyPrice = subscription.monthlyPrice;
                                yearlyPrice = subscription.yearlyPrice;
                                isActive = true;
                                lastPayment = currentTime;
                                nextPayment = nextPaymentTime;
                                interval = subscription.interval;
                            };
                            subscriptions.put(subscriber, updatedSub);
                        };
                        case (#err(_)) {
                            // Handle failed payment (could add retry logic or deactivate subscription)
                            let updatedSub = {
                                provider = subscription.provider;
                                subscriber = subscription.subscriber;
                                monthlyPrice = subscription.monthlyPrice;
                                yearlyPrice = subscription.yearlyPrice;
                                isActive = false;
                                lastPayment = subscription.lastPayment;
                                nextPayment = subscription.nextPayment;
                                interval = subscription.interval;
                            };
                            subscriptions.put(subscriber, updatedSub);
                        };
                    };
                } catch (_) {
                    // Handle error
                };
            };
        };
    };

    // Query functions
    public query func getSubscriptionDetails(subscriber: Principal) : async ?Subscription {
        subscriptions.get(subscriber)
    };

    public query func getProviderPlan(provider: Principal) : async ?SubscriptionDetails {
        providerPlans.get(provider)
    };
}