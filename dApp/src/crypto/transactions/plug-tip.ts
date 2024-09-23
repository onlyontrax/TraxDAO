import { message } from "antd";
import { Principal } from "@dfinity/principal";
import { Actor } from "@dfinity/agent";
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
  import { getPlugWalletIsConnected, getPlugWalletAgent, getPlugWalletProvider, getPrincipalId } from '../../crypto/mobilePlugWallet';




  import { IcrcLedgerCanister} from "@dfinity/ledger";

  // declare const window: any;

//   declare global {
//     interface Window {
//         ic: any;
//     }
// }

  export const requestPlugBalance = async ()=>{
    const plugWalletProvider = await getPlugWalletProvider();
    const agent = await getPlugWalletAgent();

    // @ts-ignore
    const principal = await getPrincipalId();
    // @ts-ignore
    const requestBalanceResponse = await plugWalletProvider.requestBalance();
    let icp_balance;
    let ckbtc_balance;
    let trax_balance;
    for(let i = 0; i < requestBalanceResponse.length; i++){
      if(requestBalanceResponse[i]?.symbol === 'ICP'){
        icp_balance = requestBalanceResponse[i]?.amount;
      }
      if(requestBalanceResponse[i]?.symbol === 'ckBTC'){
        ckbtc_balance = requestBalanceResponse[i]?.amount;
      }
      if(requestBalanceResponse[i]?.symbol === 'TRAX'){
        trax_balance = requestBalanceResponse[i]?.amount;
      }
    };
    return {icp_balance, ckbtc_balance, trax_balance}
  }


  export const requestConnectPlug = async (whitelist, icHost)=>{
    const plugWalletProvider = await getPlugWalletProvider();
    const agent = await getPlugWalletAgent();
    const connected = await getPlugWalletIsConnected();

    if (connected) {
      return true;
    }else{
      message.error("Failed to connected to canister. Please try again later or contact us.");
      return false
    }
  }


  export const transferPlug = async (to: string, amountStr: string, amountNo: number, ticker: string, token?: string)=>{
    const plugWalletProvider = await getPlugWalletProvider();
    const agent = await getPlugWalletAgent();
    const connected = await getPlugWalletIsConnected();

    let requestTransferArg;
    if(ticker === "ICP"){
      requestTransferArg = {
        to: to,
        amount: amountNo,
        memo: '0'
      };
//@ts-ignore
      return await plugWalletProvider.requestTransfer(requestTransferArg).then((res)=>{
        return res.height.height;
      }).catch(error => {
        message.error(`Transaction failed. ${error}`);
        console.log(error)
      });
    }else {
      //@ts-ignore
      const ledgerActor = await plugWalletProvider.createActor({
        canisterId: token,
        interfaceFactory: idlFactoryICRC1,
      });

      let transferParams: TransferArg = {
        amount: BigInt(amountNo),
        fee: ticker === "ckBTC" ? [BigInt(10)] : [BigInt(100000)],
        memo: [],
        from_subaccount: [],
        to: {
          owner: Principal.fromText(to),
          subaccount: [],
        },
        created_at_time: [BigInt(Date.now() * 1000000)],
      };

      return await ledgerActor.icrc1_transfer(transferParams).then((res)=>{
        return Number(res.Ok);
      }).catch((err)=>{
        message.error(`Transaction failed. ${err}`);
        console.log(err)
      })

    }





    // }else{
    //   const params = {
    //     to: to,
    //     strAmount: amountStr,
    //     token: token,
    //   };
    //      //@ts-ignore
    //   return await window.ic.plug.requestTransferToken(params).catch(error => {
    //       message.error(`Transaction failed. ${error}`);
    //       console.log(error)
    //   });
    // }
  }

  export const sendTipPlug = async (principal: Principal, tippingActor: any, block: bigint, amountToSend: bigint, ticker: string, performerId: string) =>{
   let participants = []

    const obj2: Participants = {
      participantID: principal,
      participantPercentage: 1,
    };

    participants.push(obj2);
    const participantArgs: TippingParticipants = participants;


    let success = false;

    await tippingActor.sendTip(block, participantArgs, amountToSend, ticker).then(() => {
      tokenTransctionService.sendCryptoTip(performerId, {
          performerId: performerId,
          price: Number(amountToSend),
          tokenSymbol: ticker,
        }).then(() => {
            success = true;
            return success
        });
    }).catch(error => {
        message.error("Transaction failed. Please try again later.");
        console.log(error);
      return success
    });


  }




  export const purchasePPVPlug = async (principal: Principal, ppvActor: any, block: bigint, amountToSend: bigint, ticker: string, performerId: string) =>{
    let participants = []

     const obj2: Participants = {
       participantID: principal,
       participantPercentage: 1,
     };

     participants.push(obj2);
     const participantArgs: TippingParticipants = participants;


     let success = false;

     await ppvActor.purchaseContent(block, participantArgs, amountToSend, ticker).then(() => {
       tokenTransctionService.sendCryptoTip(performerId, {
           performerId: performerId,
           price: Number(amountToSend),
           tokenSymbol: ticker,
         }).then(() => {
             success = true;
             return success
         });
     }).catch(error => {
         message.error("Transaction failed. Please try again later.");
         console.log(error);
       return success
     });


   }







// export const sendTipPlug = async (
//     amount: number,
//     ticker: string,
//     principal: string,
//     name: string,
//     id: string,
//     icTipping: string,
//     icLedger: string,
//     icCKBTCMinter: string,
//     icHost: string,
//     icTraxIdentity: string,
// ) => {

//     let transfer;
//     let amountToSend = BigInt(Math.trunc(Number(amount) * 100000000));

//     // this.setState({
//     //   requesting: false,
//     //   submiting: false,
//     //   openTipProgressModal: false,
//     //   tipProgress: 0,
//     // });

//     const tippingCanID = icTipping;
//     const ledgerCanID = icLedger;
//     const ckBTCLedgerCanID = icCKBTCMinter;
//     const identityCanisterId = icTraxIdentity;

//     const whitelist = [tippingCanID, identityCanisterId];

//     if (typeof window !== "undefined" && "ic" in window) {
//       const connected =
//         typeof window !== "undefined" && "ic" in window
//           ? // @ts-ignore
//         await window?.ic?.plug?.requestConnect({  whitelist, host: icHost  })  :  false;

//       !connected && message.info("Failed to connected to canister. Please try again later or contact us. ");


//       // @ts-ignore
//       if (!window?.ic?.plug?.agent && connected) {
//         // @ts-ignore
//         await window.ic.plug.createAgent({  whitelist, host: icHost  });
//       }else{
//         message.error("Failed to connected to canister. Please try again later or contact us.");
//       }


//       let tippingActor = Actor.createActor<_SERVICE_TIPPING>(idlFactoryTipping, {
//         agent: (window as any).ic.plug.agent,
//         canisterId: tippingCanID,
//       });

//       const participants = [];

//       if (connected) {
//         // this.setState({ openTipProgressModal: true, openTipModal: false, tipProgress: 25 });
//         //@ts-ignore
//         const requestBalanceResponse = await window.ic.plug.requestBalance();
//         console.log("requestBalanceResponse", requestBalanceResponse)
//         let icp_balance;
//         let ckBTC_balance;
//         let TRAX_balance;
//         for(let i = 0; i < requestBalanceResponse.length; i++){
//           if(requestBalanceResponse[i]?.symbol === 'ICP'){
//             icp_balance = requestBalanceResponse[i]?.amount;
//           }
//           if(requestBalanceResponse[i]?.symbol === 'ckBTC'){
//             ckBTC_balance = requestBalanceResponse[i]?.amount;
//           }
//           if(requestBalanceResponse[i]?.symbol === 'TRAX'){
//             TRAX_balance = requestBalanceResponse[i]?.amount;
//           }

//         };

//         if (ticker === "ckBTC") {
//           if (ckBTC_balance >= amount) {

//             // this.setState({ tipProgress: 50 });

//             const params = {
//               to: tippingCanID,
//               strAmount: amount,
//               token: ckBTCLedgerCanID,
//             };
//             //@ts-ignore
//             transfer = await window.ic.plug.requestTransferToken(params).catch(error => {
//               message.error(`Transaction failed. ${error}`);
//               console.log(error)
//               this.setState({ requesting: false, submiting: false, openTipProgressModal: false, tipProgress: 0 });
//             });


//           } else {

//             // this.setState({
//             //   requesting: false,
//             //   submiting: false,
//             //   openTipProgressModal: false,
//             //   tipProgress: 0,
//             // });

//             message.error("Insufficient balance, please top up your wallet and try again.");
//           }
//         }

//         if (ticker === "TRAX") {
//           if (TRAX_balance >= amount) {
//             this.setState({ tipProgress: 50 });
//             const params = {
//               to: tippingCanID,
//               strAmount: amount,
//               token: process.env.NEXT_PUBLIC_TRAX_CANISTER_ID as string,
//             };
//             //@ts-ignore
//             transfer = await window.ic.plug.requestTransferToken(params).catch(error => {
//               message.error(`Transaction failed. ${error}`);
//               console.log(error)
//               this.setState({ requesting: false, submiting: false, openTipProgressModal: false, tipProgress: 0 });
//             });
//           } else {
//             this.setState({
//               requesting: false,
//               submiting: false,
//               openTipProgressModal: false,
//               tipProgress: 0,
//             });
//             message.error("Insufficient balance, please top up your wallet and try again.");
//           }
//         }

//         if (ticker === "ICP") {

//           if (icp_balance >= amount) {
//             this.setState({ tipProgress: 50 });
//             const requestTransferArg = {
//               to: tippingCanID,
//               amount: Math.trunc(Number(amount) * 100000000),
//             };
//             //@ts-ignore
//             transfer = await window.ic?.plug?.requestTransfer(requestTransferArg).catch(error => {
//               message.error(`Transaction failed. ${error}`);
//               console.log(error)
//               this.setState({ requesting: false, submiting: false, openTipProgressModal: false, tipProgress: 0 });
//             });

//           } else {
//             this.setState({
//               requesting: false,
//               submiting: false,
//               openTipProgressModal: false,
//               tipProgress: 0,
//             });
//             message.error("Insufficient balance, please top up your wallet and try again.");
//           }
//         }


//         if (transfer.height) {
//           this.setState({ tipProgress: 75 });

//           const obj2: Participants = {
//             participantID: Principal.fromText(principal),
//             participantPercentage: 1,
//           };
//           participants.push(obj2);
//           const participantArgs: TippingParticipants = participants;

//           await tippingActor
//             .sendTip(transfer.height, participantArgs, amountToSend, ticker)
//             .then(() => {
//               this.setState({ tipProgress: 100 });
//               tokenTransctionService.sendCryptoTip(id, {
//                   performerId: id,
//                   price: Number(amountToSend),
//                   tokenSymbol: ticker,
//                 })
//                 .then(() => {});
//               setTimeout(
//                 () =>
//                   this.setState({
//                     requesting: false,
//                     submiting: false,

//                   }),
//                 1000
//               );
//               message.success(`Payment successful! ${name} has recieved your tip`);
//               this.setState({ requesting: false, submiting: false });
//             })
//             .catch(error => {
//               this.setState({
//                 requesting: false,
//                 submiting: false,
//                 openTipProgressModal: false,
//                 tipProgress: 0,
//               });
//               message.error(error.message || "error occured, please try again later");
//               return error;
//             });
//         } else {
//           message.error("Transaction failed. Please try again later.");
//         }
//       }
//     }
//   }
