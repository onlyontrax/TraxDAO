

import { message } from "antd";
import { Principal } from "@dfinity/principal";
import { Actor, HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import {
    tokenTransctionService,
  } from "src/services";
import { idlFactory as idlFactoryTipping } from "../../smart-contracts/declarations/tipping/tipping.did.js";
import { idlFactory as idlFactoryICRC1, TransferArg } from "../../smart-contracts/declarations/icrc1/icrc1.did.js";
import type {
    _SERVICE as _SERVICE_TIPPING,
    TippingParticipants,
    Participants,
  } from "../../smart-contracts/declarations/tipping/tipping2.did.js";
  import { cryptoService } from '@services/crypto.service';
  import { AccountBalanceArgs } from "@dfinity/nns/dist/candid/ledger";
import { idlFactory as idlFactoryLedger } from 'src/smart-contracts/declarations/ledger/ledger.did.js';
import type { _SERVICE as _SERVICE_LEDGER } from 'src/smart-contracts/declarations/ledger/ledger2.did';
import { IcrcLedgerCanister, TransferParams } from "@dfinity/ledger";
import { AccountIdentifier } from "@dfinity/nns";
import { TransferArgs, Tokens, TimeStamp } from "src/smart-contracts/declarations/ledger/ledger2.did";





export const sendTipCrypto = async(amount: number, ticker: string, performer: any, settings: any) => {
    if (performer === null) return;
    if (!performer?.wallet_icp) {
    //   this.setState({
    //     requesting: false,
    //     submiting: false,
    //     openTipProgressModal: false,
    //     tipProgress: 0,
    //   });
      message.info("This artist is not a web3 user and therefore cannot recieve tips in crypto at this time.");
      return;
    }

    let amountToSend = BigInt(Math.trunc(Number(amount) * 100000000));

    try {
    //   this.setState({ requesting: true, submiting: true });

      let identity, ledgerActor, sender, tippingActor, agent;
      const authClient = await AuthClient.create();

      const tippingCanID = Principal.fromText(settings.icTipping);
      const ledgerCanID = settings.icLedger;
      const ckBTCLedgerCanID = Principal.fromText(settings.icCKBTCMinter);
      const TRAXLedgerCanID = Principal.fromText(settings.icTraxToken);

      await authClient.login({
        identityProvider: cryptoService.getIdentityProviderLink(),
        onSuccess: async () => {
          identity = authClient.getIdentity();
          const host = settings.icHost;
          agent = new HttpAgent({ identity, host });

          settings.icNetwork !== true && agent.fetchRootKey();

          sender = await agent.getPrincipal();
          if (ticker == "ICP") {
            ledgerActor = Actor.createActor<_SERVICE_LEDGER>(idlFactoryLedger, {
              agent,
              canisterId: ledgerCanID,
            });
          } else if (ticker === "ckBTC") {
            ledgerActor = IcrcLedgerCanister.create({
              agent,
              canisterId: ckBTCLedgerCanID,
            });
          }else if ( ticker === "TRAX") {
            ledgerActor = IcrcLedgerCanister.create({
              agent,
              canisterId: TRAXLedgerCanID,
            });
          } else {
            message.error("Invalid ticker, please select a different token!");
          }
          tippingActor = Actor.createActor<_SERVICE_TIPPING>(idlFactoryTipping, {
            agent,
            canisterId: tippingCanID,
          });

          return  (sender) (tippingCanID) (amountToSend) (ledgerActor) (tippingActor) (ticker)
        },
      });

    } catch (e) {
      const err = await e;
      message.error(err.message || "error occured, please try again later");
    }
}



const handleSendTipCrypto = async (
    tippingCanID: Principal,
    fanID: Principal,
    amountToSend: bigint,
    ledgerActor: any,
    tippingActor: any,
    ticker: string,
    performer: any

  ) => {

    if (performer === null) return;

    // this.setState({ openTipProgressModal: true, openTipModal: false, tipProgress: 25 });

    const tippingCanisterAI = AccountIdentifier.fromPrincipal({
      principal: tippingCanID,
    });

    // @ts-ignore
    const { bytes } = tippingCanisterAI;
    const accountIdBlob = Object.keys(bytes).map(m => bytes[m]);

    const fanAI = AccountIdentifier.fromPrincipal({
      principal: fanID,
    });

    // @ts-ignore
    const fanBytes = fanAI.bytes;

    const txTime: TimeStamp = {
      timestamp_nanos: BigInt(Date.now() * 1000000),
    };
    const balArgs: AccountBalanceArgs = {
      account: fanBytes,
    };

    const uuid = BigInt(Math.floor(Math.random() * 1000));
    let transferArgs: TransferArgs;
    let transferParams: TransferParams;
    if (ticker === "ICP") {
      transferArgs = {
        memo: uuid,
        amount: { e8s: amountToSend },
        fee: { e8s: BigInt(10000) },
        from_subaccount: [],
        to: accountIdBlob,
        created_at_time: [txTime],
      };

      let balICP = await ledgerActor.account_balance(balArgs);

      if (Number(balICP.e8s) < Number(amountToSend) + 10000) {
        // this.setState({
        //   requesting: false,
        //   submiting: false,
        //   openTipProgressModal: false,
        //   tipProgress: 0,
        // });
        message.error("Insufficient balance, please top up your wallet with ICP and try again.");
      }
    } else if (ticker === "ckBTC") {
      transferParams = {
        amount: amountToSend,
        fee: BigInt(10),
        from_subaccount: null,
        to: {
          owner: tippingCanID,
          subaccount: [],
        },
        created_at_time: BigInt(Date.now() * 1000000),
      };

      let balICRC1 = await ledgerActor.balance({
        owner: fanID,
        certified: false,
      });

      if (Number(balICRC1) < Number(amountToSend) + 10) {
        // this.setState({
        //   requesting: false,
        //   submiting: false,
        //   openTipProgressModal: false,
        //   tipProgress: 0,
        // });
        message.error("Insufficient balance, please top up your wallet with ckBTC and try again.");
      }
    }else if (ticker === "TRAX"){
      transferParams = {
        amount: amountToSend,
        fee: BigInt(100000),
        from_subaccount: null,
        to: {
          owner: tippingCanID,
          subaccount: [],
        },
        created_at_time: BigInt(Date.now() * 1000000),
      };

      let balICRC1 = await ledgerActor.balance({
        owner: fanID,
        certified: false,
      });

      if (Number(balICRC1) < Number(amountToSend) + 100000) {
        // this.setState({
        //   requesting: false,
        //   submiting: false,
        //   openTipProgressModal: false,
        //   tipProgress: 0,
        // });
        message.error("Insufficient balance, please top up your wallet with TRAX and try again.");
      }
    }else {
    //   this.setState({
    //     requesting: false,
    //     submiting: false,
    //     openTipProgressModal: false,
    //     tipProgress: 0,
    //   });
      message.error("Invalid ticker, please select a different token!");
    }

    const participants = [];

    const obj2: Participants = {
      participantID: Principal.fromText(performer?.wallet_icp),
      participantPercentage: 1,
    };
    participants.push(obj2);

    const participantArgs: TippingParticipants = participants;
    // this.setState({ tipProgress: 50 });
    await ledgerActor
      .transfer(ticker === "ICP" ? transferArgs : transferParams)
      .then(async res => {
        // this.setState({ tipProgress: 75 });

        await tippingActor
          .sendTip(ticker === "ICP" ? res.Ok : res, participantArgs, amountToSend, ticker)
          .then(() => {
            // this.setState({ tipProgress: 100 });
            tokenTransctionService
              .sendCryptoTip(performer?._id, {
                performerId: performer?._id,
                price: Number(amountToSend),
                tokenSymbol: ticker,
              })
              .then(() => {});
            setTimeout(
              () =>
                // this.setState({
                //   requesting: false,
                //   submiting: false
                // }),
              1000
            );

            message.success(`Payment successful! ${performer?.name} has recieved your tip`);
            // this.setState({ requesting: false, submiting: false });
          })
          .catch(error => {
            // this.setState({
            //   requesting: false,
            //   submiting: false,
            //   openTipProgressModal: false,
            //   tipProgress: 0,
            // });
            message.error(error.message || "error occured, please try again later");
            return error;
          });
        // }
      })
      .catch(error => {
        // this.setState({
        //   requesting: false,
        //   submiting: false,
        //   openTipProgressModal: false,
        //   tipProgress: 0,
        // });
        message.error(error.message || "error occured, please try again later");
        return error;
      });
  }
